import { GoogleGenerativeAI } from '@google/generative-ai';
import { PrismaClient } from '@prisma/client';
import { EXTRACTION_SYSTEM_PROMPT, createExtractionPrompt } from '../utils/prompts';
import { areDuplicates } from '../utils/embeddings';

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const MOCK_MODE = process.env.MOCK_MODE === 'true';

interface ExtractedItem {
    category: string;
    content: string;
    priority?: string;
    quote: string;
    confidence: number;
}

/**
 * Information extraction service
 * Extracts structured requirements and business information from relevant chunks
 */
export class ExtractionService {
    /**
     * Extract information from all relevant chunks in a project
     * @param projectId - Project ID
     */
    async extractFromProject(projectId: string): Promise<void> {
        console.log(`Starting information extraction for project ${projectId}...`);

        // Get all relevant chunks
        const chunks = await prisma.chunk.findMany({
            where: {
                projectId,
                isRelevant: true,
            },
            include: {
                source: true,
            },
            orderBy: [{ sourceId: 'asc' }, { chunkIndex: 'asc' }],
        });

        console.log(`Found ${chunks.length} relevant chunks to process`);

        // Group chunks by source for better context
        const chunksBySource = chunks.reduce((acc, chunk) => {
            if (!acc[chunk.sourceId]) {
                acc[chunk.sourceId] = [];
            }
            acc[chunk.sourceId].push(chunk);
            return acc;
        }, {} as Record<string, typeof chunks>);

        // Process each source
        for (const [sourceId, sourceChunks] of Object.entries(chunksBySource)) {
            await this.extractFromSource(projectId, sourceId, sourceChunks);
        }

        // Deduplicate extractions
        await this.deduplicateExtractions(projectId);

        console.log(`✓ Completed information extraction for project ${projectId}`);
    }

    /**
     * Extract information from chunks of a single source
     * @param projectId - Project ID
     * @param sourceId - Source ID
     * @param chunks - Chunks from this source
     */
    private async extractFromSource(
        projectId: string,
        sourceId: string,
        chunks: any[]
    ): Promise<void> {
        // Combine chunks for better context (up to a reasonable limit)
        const combinedText = chunks
            .slice(0, 10) // Limit to first 10 chunks to avoid token limits
            .map((c) => c.content)
            .join('\n\n');

        const extractedItems = await this.extractInformation(combinedText);

        // Store extractions in database
        for (const item of extractedItems) {
            await prisma.extraction.create({
                data: {
                    projectId,
                    category: item.category,
                    content: item.content,
                    priority: item.priority,
                    citations: JSON.stringify([
                        {
                            sourceId,
                            chunkIds: chunks.map((c) => c.id),
                            snippet: item.quote,
                            confidence: item.confidence,
                        },
                    ]),
                    metadata: JSON.stringify({
                        extractedFrom: 'source',
                        sourceType: chunks[0].source.sourceType,
                    }),
                },
            });
        }

        console.log(`Extracted ${extractedItems.length} items from source ${sourceId}`);
    }

    /**
     * Extract structured information from text using Gemini
     * @param text - Text to extract from
     * @returns Array of extracted items
     */
    private async extractInformation(text: string): Promise<ExtractedItem[]> {
        if (MOCK_MODE) {
            return this.mockExtract(text);
        }

        try {
            const model = genAI.getGenerativeModel({
                model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
                systemInstruction: EXTRACTION_SYSTEM_PROMPT,
            });

            const prompt = createExtractionPrompt(text);
            const result = await model.generateContent(prompt);
            const response = result.response.text();

            // Parse JSON response
            const jsonMatch = response.match(/\[[\s\S]*\]/);
            if (!jsonMatch) {
                console.warn('No JSON array found in extraction response');
                return [];
            }

            const items: ExtractedItem[] = JSON.parse(jsonMatch[0]);
            return items;
        } catch (error) {
            console.error('Information extraction error:', error);
            return [];
        }
    }

    /**
     * Mock extraction for development mode
     */
    private mockExtract(text: string): ExtractedItem[] {
        const items: ExtractedItem[] = [];
        const lowerText = text.toLowerCase();

        // Simple pattern matching for demo purposes
        if (lowerText.includes('requirement') || lowerText.includes('must') || lowerText.includes('should')) {
            items.push({
                category: 'functional_req',
                content: 'System must support user authentication',
                priority: 'must_have',
                quote: text.substring(0, 100),
                confidence: 0.75,
            });
        }

        if (lowerText.includes('goal') || lowerText.includes('objective')) {
            items.push({
                category: 'objective',
                content: 'Improve user engagement and retention',
                quote: text.substring(0, 100),
                confidence: 0.7,
            });
        }

        if (lowerText.includes('stakeholder') || lowerText.includes('user') || lowerText.includes('customer')) {
            items.push({
                category: 'stakeholder',
                content: 'Product Owner - Concerned about timeline',
                quote: text.substring(0, 100),
                confidence: 0.65,
            });
        }

        if (lowerText.includes('timeline') || lowerText.includes('deadline') || /\d{4}/.test(text)) {
            items.push({
                category: 'timeline',
                content: 'Project deadline: Q2 2025',
                quote: text.substring(0, 100),
                confidence: 0.8,
            });
        }

        return items;
    }

    /**
     * Deduplicate extractions using vector similarity
     * @param projectId - Project ID
     */
    private async deduplicateExtractions(projectId: string): Promise<void> {
        const extractions = await prisma.extraction.findMany({
            where: { projectId },
        });

        console.log(`Deduplicating ${extractions.length} extractions...`);

        const toDelete: string[] = [];
        const merged: Map<string, any[]> = new Map();

        // Compare all pairs
        for (let i = 0; i < extractions.length; i++) {
            if (toDelete.includes(extractions[i].id)) continue;

            for (let j = i + 1; j < extractions.length; j++) {
                if (toDelete.includes(extractions[j].id)) continue;

                // Only compare items in the same category
                if (extractions[i].category !== extractions[j].category) continue;

                // Simple text similarity for now (in production, use embeddings)
                const similarity = this.textSimilarity(
                    extractions[i].content,
                    extractions[j].content
                );

                if (similarity > 0.8) {
                    // Mark for deletion and merge citations
                    toDelete.push(extractions[j].id);

                    if (!merged.has(extractions[i].id)) {
                        merged.set(extractions[i].id, [extractions[i].citations as any]);
                    }
                    merged.get(extractions[i].id)!.push(extractions[j].citations as any);
                }
            }
        }

        // Delete duplicates
        if (toDelete.length > 0) {
            await prisma.extraction.deleteMany({
                where: {
                    id: { in: toDelete },
                },
            });
        }

        // Update merged items with combined citations
        for (const [id, citations] of merged.entries()) {
            await prisma.extraction.update({
                where: { id },
                data: {
                    citations: JSON.stringify(citations.flat()),
                },
            });
        }

        console.log(`Removed ${toDelete.length} duplicate extractions`);
    }

    /**
     * Simple text similarity (Jaccard similarity)
     * In production, use vector embeddings
     */
    private textSimilarity(text1: string, text2: string): number {
        const words1 = new Set(text1.toLowerCase().split(/\s+/));
        const words2 = new Set(text2.toLowerCase().split(/\s+/));

        const intersection = new Set([...words1].filter((x) => words2.has(x)));
        const union = new Set([...words1, ...words2]);

        return intersection.size / union.size;
    }

    /**
     * Get all extractions for a project, grouped by category
     * @param projectId - Project ID
     */
    async getExtractionsByCategory(projectId: string) {
        const extractions = await prisma.extraction.findMany({
            where: { projectId },
            orderBy: { createdAt: 'asc' },
        });

        const grouped = extractions.reduce((acc, extraction) => {
            if (!acc[extraction.category]) {
                acc[extraction.category] = [];
            }
            acc[extraction.category].push(extraction);
            return acc;
        }, {} as Record<string, typeof extractions>);

        return grouped;
    }

    /**
     * Get extraction statistics for a project
     * @param projectId - Project ID
     */
    async getExtractionStats(projectId: string) {
        const extractions = await prisma.extraction.findMany({
            where: { projectId },
        });

        const byCategory = extractions.reduce((acc, e) => {
            acc[e.category] = (acc[e.category] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return {
            total: extractions.length,
            byCategory,
        };
    }
}

// Export singleton instance
export const extractionService = new ExtractionService();
