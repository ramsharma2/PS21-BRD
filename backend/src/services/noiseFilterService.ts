import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { NOISE_FILTER_SYSTEM_PROMPT, createNoiseFilterPrompt } from '../utils/prompts';
import { generateEmbedding, generateMockEmbedding } from '../utils/embeddings';
import { chunkText } from '../utils/chunker';
import { vectorStore } from './vectorStoreService';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MOCK_MODE = process.env.MOCK_MODE === 'true';

interface NoiseFilterResult {
    classification: 'RELEVANT' | 'NOISE';
    confidence: number;
    reasoning: string;
}

/**
 * Noise filtering service
 * Classifies text chunks as RELEVANT or NOISE using Gemini AI
 */
export class NoiseFilterService {
    /**
     * Process a source document: chunk it, embed it, and filter noise
     * @param sourceId - Source document ID
     * @param projectId - Project ID
     */
    async processSource(sourceId: string, projectId: string): Promise<void> {
        console.log(`Processing source ${sourceId} for noise filtering...`);

        // Get source from database
        const source = await prisma.source.findUnique({
            where: { id: sourceId },
        });

        if (!source) {
            throw new Error(`Source ${sourceId} not found`);
        }

        // Chunk the text
        const chunks = chunkText(source.rawContent);
        console.log(`Created ${chunks.length} chunks from source`);

        // Process each chunk
        for (const chunk of chunks) {
            await this.processChunk(chunk.content, chunk.index, sourceId, projectId);
        }

        console.log(`✓ Completed noise filtering for source ${sourceId}`);
    }

    /**
     * Process a single chunk: classify, embed, and store
     * @param content - Chunk content
     * @param chunkIndex - Index of the chunk
     * @param sourceId - Source ID
     * @param projectId - Project ID
     */
    private async processChunk(
        content: string,
        chunkIndex: number,
        sourceId: string,
        projectId: string
    ): Promise<void> {
        // Generate embedding
        const embedding = MOCK_MODE
            ? generateMockEmbedding(content)
            : await generateEmbedding(content);

        // Classify as RELEVANT or NOISE
        const classification = await this.classifyChunk(content);

        // Store in database
        const dbChunk = await prisma.chunk.create({
            data: {
                projectId,
                sourceId,
                content,
                embedding: JSON.stringify(embedding),
                chunkIndex,
                isRelevant: classification.classification === 'RELEVANT',
                relevanceScore: classification.confidence,
            },
        });

        // If relevant, also store in vector database for similarity search
        if (classification.classification === 'RELEVANT') {
            await vectorStore.addEmbeddings(projectId, [
                {
                    id: dbChunk.id,
                    embedding,
                    content,
                    metadata: {
                        sourceId,
                        chunkIndex,
                        relevanceScore: classification.confidence,
                        reasoning: classification.reasoning,
                    },
                },
            ]);
        }
    }

    /**
     * Classify a chunk as RELEVANT or NOISE using Gemini
     * @param chunk - Text chunk to classify
     * @returns Classification result
     */
    private async classifyChunk(chunk: string): Promise<NoiseFilterResult> {
        // Mock mode: simple heuristic
        if (MOCK_MODE) {
            return this.mockClassify(chunk);
        }

        try {
            console.log('[NoiseFilter] Calling Gemini API for classification...');
            const model = genAI.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
                systemInstruction: NOISE_FILTER_SYSTEM_PROMPT,
            });

            const prompt = createNoiseFilterPrompt(chunk);
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            console.log('[NoiseFilter] API response received');

            // Parse JSON response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Invalid JSON response from Gemini');
            }

            const classification: NoiseFilterResult = JSON.parse(jsonMatch[0]);
            console.log('[NoiseFilter] Classification:', classification.classification, 'Confidence:', classification.confidence);
            return classification;
        } catch (error) {
            console.error('Noise classification error - falling back to mock classification');
            console.error('Error details:', error);
            // Fallback: use mock classification if API fails
            return this.mockClassify(chunk);
        }
    }

    /**
     * Mock classification for development mode
     * Uses simple heuristics to classify chunks
     */
    private mockClassify(chunk: string): NoiseFilterResult {
        const lowerChunk = chunk.toLowerCase();

        // Noise indicators
        const noisePatterns = [
            /^(hi|hello|hey|thanks|thank you|regards|best|cheers)/i,
            /meeting at \d+/i,
            /let's schedule/i,
            /out of office/i,
            /^got it\.?$/i,
            /^sounds good\.?$/i,
        ];

        // Relevant indicators
        const relevantPatterns = [
            /requirement/i,
            /must|should|could|won't/i,
            /feature/i,
            /objective|goal/i,
            /stakeholder/i,
            /decision/i,
            /timeline|deadline|milestone/i,
            /risk|concern/i,
            /performance|security|scalability/i,
        ];

        let noiseScore = 0;
        let relevantScore = 0;

        for (const pattern of noisePatterns) {
            if (pattern.test(chunk)) noiseScore++;
        }

        for (const pattern of relevantPatterns) {
            if (pattern.test(chunk)) relevantScore++;
        }

        // Very short chunks are likely noise
        if (chunk.split(/\s+/).length < 10) {
            noiseScore += 2;
        }

        const isRelevant = relevantScore > noiseScore;
        const confidence = Math.min(
            0.95,
            0.5 + Math.abs(relevantScore - noiseScore) * 0.15
        );

        return {
            classification: isRelevant ? 'RELEVANT' : 'NOISE',
            confidence,
            reasoning: `Mock classification: ${relevantScore} relevant patterns, ${noiseScore} noise patterns`,
        };
    }

    /**
     * Get all relevant chunks for a project
     * @param projectId - Project ID
     * @returns Array of relevant chunks
     */
    async getRelevantChunks(projectId: string) {
        return await prisma.chunk.findMany({
            where: {
                projectId,
                isRelevant: true,
            },
            orderBy: [{ sourceId: 'asc' }, { chunkIndex: 'asc' }],
            include: {
                source: {
                    select: {
                        sourceType: true,
                        metadata: true,
                    },
                },
            },
        });
    }

    /**
     * Get noise filtering statistics for a project
     * @param projectId - Project ID
     */
    async getFilteringStats(projectId: string) {
        const total = await prisma.chunk.count({
            where: { projectId },
        });

        const relevant = await prisma.chunk.count({
            where: { projectId, isRelevant: true },
        });

        const noise = total - relevant;

        return {
            total,
            relevant,
            noise,
            relevancePercentage: total > 0 ? (relevant / total) * 100 : 0,
        };
    }
}

// Export singleton instance
export const noiseFilterService = new NoiseFilterService();
