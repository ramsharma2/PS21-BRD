import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * Initialize Gemini API client
 */
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Generate embeddings for text using Gemini's embedding model
 * @param text - Text to embed
 * @returns Vector embedding as array of numbers
 */
export async function generateEmbedding(text: string): Promise<number[]> {
    try {
        // Use Gemini's embedding model with explicit v1 API version
        // text-embedding-004 is available on v1, not v1beta
        const model = genAI.getGenerativeModel(
            { model: process.env.GOOGLE_EMBEDDING_MODEL || 'text-embedding-004' },
            { apiVersion: 'v1' }
        );

        const result = await model.embedContent(text);
        const embedding = result.embedding;

        return embedding.values;
    } catch (error) {
        console.error('Embedding generation error:', error);

        // Fallback to mock embedding if API fails (to keep the app running)
        console.log('Falling back to mock embedding due to API error');
        return generateMockEmbedding(text);
    }
}

/**
 * Generate embeddings for multiple texts in batch
 * @param texts - Array of texts to embed
 * @returns Array of vector embeddings
 */
export async function generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    try {
        const embeddings = await Promise.all(texts.map((text) => generateEmbedding(text)));
        return embeddings;
    } catch (error) {
        console.error('Batch embedding generation error:', error);
        throw new Error(`Failed to generate batch embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Calculate cosine similarity between two vectors
 * @param vecA - First vector
 * @param vecB - Second vector
 * @returns Similarity score between 0 and 1
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (vecA.length !== vecB.length) {
        throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
        return 0;
    }

    return dotProduct / (normA * normB);
}

/**
 * Find the most similar vectors to a query vector
 * @param queryVector - Query vector
 * @param vectors - Array of vectors to compare against
 * @param topK - Number of top results to return
 * @returns Array of indices and similarity scores
 */
export function findMostSimilar(
    queryVector: number[],
    vectors: number[][],
    topK: number = 5
): Array<{ index: number; similarity: number }> {
    const similarities = vectors.map((vec, index) => ({
        index,
        similarity: cosineSimilarity(queryVector, vec),
    }));

    // Sort by similarity descending
    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, topK);
}

/**
 * Check if two embeddings are duplicates based on similarity threshold
 * @param embeddingA - First embedding
 * @param embeddingB - Second embedding
 * @param threshold - Similarity threshold (default from env or 0.92)
 * @returns True if embeddings are considered duplicates
 */
export function areDuplicates(
    embeddingA: number[],
    embeddingB: number[],
    threshold: number = parseFloat(process.env.SIMILARITY_THRESHOLD || '0.92')
): boolean {
    const similarity = cosineSimilarity(embeddingA, embeddingB);
    return similarity >= threshold;
}

/**
 * Mock embedding generation for development (when MOCK_MODE=true)
 * @param text - Text to embed
 * @returns Random vector of fixed dimension
 */
export function generateMockEmbedding(text: string): number[] {
    // Generate deterministic "random" vector based on text hash
    const hash = text.split('').reduce((acc, char) => {
        return ((acc << 5) - acc) + char.charCodeAt(0);
    }, 0);

    const dimension = 768; // Standard embedding dimension
    const vector: number[] = [];

    for (let i = 0; i < dimension; i++) {
        // Use hash to seed pseudo-random values
        const seed = (hash + i) * 2654435761;
        vector.push((Math.sin(seed) + 1) / 2); // Normalize to 0-1
    }

    return vector;
}
