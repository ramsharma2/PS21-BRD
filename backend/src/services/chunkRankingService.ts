import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getEmbedding } from '../utils/embeddings';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });

interface RankedChunk {
    id: string;
    content: string;
    relevanceScore: number;
    semanticScore: number;
    diversityScore: number;
    finalScore: number;
    rank: number;
}

interface RankingConfig {
    topN?: number; // Number of chunks to select
    relevanceWeight?: number; // Weight for relevance score (0-1)
    semanticWeight?: number; // Weight for semantic similarity (0-1)
    diversityWeight?: number; // Weight for diversity (0-1)
    query?: string; // Optional query for semantic ranking
}

class ChunkRankingService {
    /**
     * Re-rank all chunks in a project based on multiple criteria
     */
    async reRankChunks(
        projectId: string,
        config: RankingConfig = {}
    ): Promise<RankedChunk[]> {
        const {
            topN = 50,
            relevanceWeight = 0.5,
            semanticWeight = 0.3,
            diversityWeight = 0.2,
            query = 'business requirements, functional requirements, non-functional requirements, objectives, constraints'
        } = config;

        console.log(`[Chunk Ranking] Starting re-ranking for project ${projectId}`);
        console.log(`[Chunk Ranking] Config: topN=${topN}, weights: relevance=${relevanceWeight}, semantic=${semanticWeight}, diversity=${diversityWeight}`);

        // 1. Get all relevant chunks
        const chunks = await prisma.chunk.findMany({
            where: {
                projectId,
                isRelevant: true,
            },
            orderBy: {
                relevanceScore: 'desc',
            },
        });

        if (chunks.length === 0) {
            console.log('[Chunk Ranking] No relevant chunks found');
            return [];
        }

        console.log(`[Chunk Ranking] Found ${chunks.length} relevant chunks`);

        // 2. Calculate semantic similarity scores if query provided
        let semanticScores: number[] = [];
        if (semanticWeight > 0 && query) {
            semanticScores = await this.calculateSemanticScores(chunks, query);
        } else {
            semanticScores = chunks.map(() => 0);
        }

        // 3. Calculate diversity scores
        let diversityScores: number[] = [];
        if (diversityWeight > 0) {
            diversityScores = await this.calculateDiversityScores(chunks);
        } else {
            diversityScores = chunks.map(() => 0);
        }

        // 4. Normalize all scores to 0-1 range
        const normalizedRelevance = this.normalizeScores(chunks.map(c => c.relevanceScore || 0));
        const normalizedSemantic = this.normalizeScores(semanticScores);
        const normalizedDiversity = this.normalizeScores(diversityScores);

        // 5. Calculate final weighted scores
        const rankedChunks: RankedChunk[] = chunks.map((chunk, index) => {
            const finalScore = 
                (normalizedRelevance[index] * relevanceWeight) +
                (normalizedSemantic[index] * semanticWeight) +
                (normalizedDiversity[index] * diversityWeight);

            return {
                id: chunk.id,
                content: chunk.content,
                relevanceScore: normalizedRelevance[index],
                semanticScore: normalizedSemantic[index],
                diversityScore: normalizedDiversity[index],
                finalScore,
                rank: 0, // Will be set after sorting
            };
        });

        // 6. Sort by final score and assign ranks
        rankedChunks.sort((a, b) => b.finalScore - a.finalScore);
        rankedChunks.forEach((chunk, index) => {
            chunk.rank = index + 1;
        });

        // 7. Select top N chunks
        const topChunks = rankedChunks.slice(0, topN);

        console.log(`[Chunk Ranking] Selected top ${topChunks.length} chunks out of ${chunks.length}`);
        console.log(`[Chunk Ranking] Score range: ${topChunks[0]?.finalScore.toFixed(3)} - ${topChunks[topChunks.length - 1]?.finalScore.toFixed(3)}`);

        return topChunks;
    }

    /**
     * Calculate semantic similarity scores between chunks and a query
     */
    private async calculateSemanticScores(
        chunks: any[],
        query: string
    ): Promise<number[]> {
        try {
            console.log('[Chunk Ranking] Calculating semantic similarity scores...');
            
            // Get query embedding
            const queryEmbedding = await getEmbedding(query);

            // Calculate cosine similarity for each chunk
            const scores = chunks.map(chunk => {
                if (!chunk.embedding) return 0;

                try {
                    const chunkEmbedding = JSON.parse(chunk.embedding);
                    return this.cosineSimilarity(queryEmbedding, chunkEmbedding);
                } catch (error) {
                    return 0;
                }
            });

            return scores;
        } catch (error) {
            console.error('[Chunk Ranking] Error calculating semantic scores:', error);
            return chunks.map(() => 0);
        }
    }

    /**
     * Calculate diversity scores to avoid redundant chunks
     */
    private async calculateDiversityScores(chunks: any[]): Promise<number[]> {
        console.log('[Chunk Ranking] Calculating diversity scores...');
        
        const scores: number[] = [];

        for (let i = 0; i < chunks.length; i++) {
            if (!chunks[i].embedding) {
                scores.push(0);
                continue;
            }

            try {
                const currentEmbedding = JSON.parse(chunks[i].embedding);
                let maxSimilarity = 0;

                // Compare with all previous chunks
                for (let j = 0; j < i; j++) {
                    if (!chunks[j].embedding) continue;

                    const otherEmbedding = JSON.parse(chunks[j].embedding);
                    const similarity = this.cosineSimilarity(currentEmbedding, otherEmbedding);
                    maxSimilarity = Math.max(maxSimilarity, similarity);
                }

                // Diversity score is inverse of similarity (1 - max similarity)
                // Higher diversity score means less similar to previous chunks
                scores.push(1 - maxSimilarity);
            } catch (error) {
                scores.push(0);
            }
        }

        return scores;
    }

    /**
     * Calculate cosine similarity between two vectors
     */
    private cosineSimilarity(vec1: number[], vec2: number[]): number {
        if (vec1.length !== vec2.length) return 0;

        let dotProduct = 0;
        let norm1 = 0;
        let norm2 = 0;

        for (let i = 0; i < vec1.length; i++) {
            dotProduct += vec1[i] * vec2[i];
            norm1 += vec1[i] * vec1[i];
            norm2 += vec2[i] * vec2[i];
        }

        const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
        return denominator === 0 ? 0 : dotProduct / denominator;
    }

    /**
     * Normalize scores to 0-1 range
     */
    private normalizeScores(scores: number[]): number[] {
        const min = Math.min(...scores);
        const max = Math.max(...scores);
        const range = max - min;

        if (range === 0) return scores.map(() => 0.5);

        return scores.map(score => (score - min) / range);
    }

    /**
     * Get ranked chunks for a specific category
     */
    async getRankedChunksForCategory(
        projectId: string,
        category: string,
        topN: number = 20
    ): Promise<RankedChunk[]> {
        const categoryQueries: Record<string, string> = {
            functional_req: 'functional requirements, features, capabilities, user actions, system behavior',
            nonfunctional_req: 'non-functional requirements, performance, security, scalability, reliability, usability',
            objective: 'business objectives, goals, targets, success criteria, outcomes',
            stakeholder: 'stakeholders, users, roles, responsibilities, concerns, interests',
            constraint: 'constraints, limitations, restrictions, dependencies, assumptions',
            risk: 'risks, challenges, issues, problems, threats, uncertainties',
            timeline: 'timeline, schedule, milestones, deadlines, phases, delivery dates',
        };

        const query = categoryQueries[category] || category;

        return this.reRankChunks(projectId, {
            topN,
            query,
            relevanceWeight: 0.4,
            semanticWeight: 0.5,
            diversityWeight: 0.1,
        });
    }

    /**
     * Batch process: Re-rank and update chunk priorities in database
     */
    async batchReRankAndUpdate(projectId: string, topN: number = 100): Promise<void> {
        console.log(`[Chunk Ranking] Starting batch re-ranking for project ${projectId}`);

        const rankedChunks = await this.reRankChunks(projectId, { topN });

        // Update chunks with new ranking metadata
        for (const rankedChunk of rankedChunks) {
            await prisma.chunk.update({
                where: { id: rankedChunk.id },
                data: {
                    relevanceScore: rankedChunk.finalScore,
                    // Store ranking metadata in a JSON field if available
                    // metadata: JSON.stringify({
                    //     rank: rankedChunk.rank,
                    //     semanticScore: rankedChunk.semanticScore,
                    //     diversityScore: rankedChunk.diversityScore,
                    // }),
                },
            });
        }

        console.log(`[Chunk Ranking] Updated ${rankedChunks.length} chunks with new rankings`);
    }

    /**
     * Get ranking statistics for a project
     */
    async getRankingStats(projectId: string): Promise<{
        totalChunks: number;
        relevantChunks: number;
        averageScore: number;
        scoreDistribution: { range: string; count: number }[];
    }> {
        // Get all chunks (not just isRelevant=true) to show actual data
        const allChunks = await prisma.chunk.findMany({
            where: { projectId },
            select: { relevanceScore: true, isRelevant: true },
        });

        const relevantChunks = allChunks.filter(c => c.isRelevant);
        
        // Use all chunks for scoring if no relevant chunks marked yet
        const chunksToScore = relevantChunks.length > 0 ? relevantChunks : allChunks;
        const scores = chunksToScore.map(c => c.relevanceScore || 0);
        const averageScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

        // Calculate score distribution
        const distribution = [
            { range: '0.0-0.2', count: 0 },
            { range: '0.2-0.4', count: 0 },
            { range: '0.4-0.6', count: 0 },
            { range: '0.6-0.8', count: 0 },
            { range: '0.8-1.0', count: 0 },
        ];

        scores.forEach(score => {
            if (score < 0.2) distribution[0].count++;
            else if (score < 0.4) distribution[1].count++;
            else if (score < 0.6) distribution[2].count++;
            else if (score < 0.8) distribution[3].count++;
            else distribution[4].count++;
        });

        return {
            totalChunks: allChunks.length,
            relevantChunks: relevantChunks.length,
            averageScore,
            scoreDistribution: distribution,
        };
    }
}

export const chunkRankingService = new ChunkRankingService();
