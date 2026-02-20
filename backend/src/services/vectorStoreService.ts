import { ChromaClient, Collection } from 'chromadb';

/**
 * Vector store service using ChromaDB
 * Handles storage and retrieval of embeddings
 */
class VectorStoreService {
    private client: ChromaClient | null = null;
    private collections: Map<string, Collection> = new Map();

    constructor() {
        this.initialize();
    }

    /**
     * Initialize ChromaDB client
     */
    private async initialize() {
        try {
            const chromaHost = process.env.CHROMA_HOST || 'http://localhost:8000';
            this.client = new ChromaClient({ path: chromaHost });
            console.log('✓ ChromaDB client initialized');
        } catch (error) {
            console.error('Failed to initialize ChromaDB:', error);
            console.warn('Vector store will not be available');
        }
    }

    /**
     * Get or create a collection for a project
     * @param projectId - Project ID
     * @returns ChromaDB collection
     */
    async getCollection(projectId: string): Promise<Collection | null> {
        if (!this.client) {
            console.warn('ChromaDB client not initialized');
            return null;
        }

        // Check cache
        if (this.collections.has(projectId)) {
            return this.collections.get(projectId)!;
        }

        try {
            // Try to get existing collection
            const collection = await this.client.getOrCreateCollection({
                name: `project_${projectId}`,
                metadata: { projectId },
            });

            this.collections.set(projectId, collection);
            return collection;
        } catch (error) {
            console.error(`Failed to get collection for project ${projectId}:`, error);
            return null;
        }
    }

    /**
     * Add embeddings to the vector store
     * @param projectId - Project ID
     * @param chunks - Array of chunks with embeddings
     */
    async addEmbeddings(
        projectId: string,
        chunks: Array<{
            id: string;
            embedding: number[];
            content: string;
            metadata: Record<string, any>;
        }>
    ): Promise<void> {
        const collection = await this.getCollection(projectId);
        if (!collection) {
            console.warn('ChromaDB not available, skipping vector store operation');
            return; // Gracefully skip if ChromaDB is not available
        }

        try {
            await collection.add({
                ids: chunks.map((c) => c.id),
                embeddings: chunks.map((c) => c.embedding),
                documents: chunks.map((c) => c.content),
                metadatas: chunks.map((c) => c.metadata),
            });

            console.log(`Added ${chunks.length} embeddings to project ${projectId}`);
        } catch (error) {
            console.error('Failed to add embeddings:', error);
            // Don't throw - just log the error and continue
            console.warn('Continuing without vector store');
        }
    }

    /**
     * Query similar chunks
     * @param projectId - Project ID
     * @param queryEmbedding - Query vector
     * @param topK - Number of results to return
     * @returns Similar chunks
     */
    async querySimilar(
        projectId: string,
        queryEmbedding: number[],
        topK: number = 10
    ): Promise<Array<{
        id: string;
        content: string;
        metadata: Record<string, any>;
        similarity: number;
    }>> {
        const collection = await this.getCollection(projectId);
        if (!collection) {
            return [];
        }

        try {
            const results = await collection.query({
                queryEmbeddings: [queryEmbedding],
                nResults: topK,
            });

            // Transform results
            const similar: Array<{
                id: string;
                content: string;
                metadata: Record<string, any>;
                similarity: number;
            }> = [];

            if (results.ids && results.ids[0]) {
                for (let i = 0; i < results.ids[0].length; i++) {
                    similar.push({
                        id: results.ids[0][i],
                        content: results.documents?.[0]?.[i] || '',
                        metadata: results.metadatas?.[0]?.[i] || {},
                        similarity: 1 - (results.distances?.[0]?.[i] || 0), // Convert distance to similarity
                    });
                }
            }

            return similar;
        } catch (error) {
            console.error('Failed to query similar chunks:', error);
            return [];
        }
    }

    /**
     * Delete a collection (when project is deleted)
     * @param projectId - Project ID
     */
    async deleteCollection(projectId: string): Promise<void> {
        if (!this.client) {
            return;
        }

        try {
            await this.client.deleteCollection({ name: `project_${projectId}` });
            this.collections.delete(projectId);
            console.log(`Deleted collection for project ${projectId}`);
        } catch (error) {
            console.error(`Failed to delete collection for project ${projectId}:`, error);
        }
    }

    /**
     * Get all chunks for a project
     * @param projectId - Project ID
     * @returns All chunks in the collection
     */
    async getAllChunks(projectId: string): Promise<Array<{
        id: string;
        content: string;
        metadata: Record<string, any>;
    }>> {
        const collection = await this.getCollection(projectId);
        if (!collection) {
            return [];
        }

        try {
            const results = await collection.get({});

            const chunks: Array<{
                id: string;
                content: string;
                metadata: Record<string, any>;
            }> = [];

            if (results.ids) {
                for (let i = 0; i < results.ids.length; i++) {
                    chunks.push({
                        id: results.ids[i],
                        content: results.documents?.[i] || '',
                        metadata: results.metadatas?.[i] || {},
                    });
                }
            }

            return chunks;
        } catch (error) {
            console.error('Failed to get all chunks:', error);
            return [];
        }
    }
}

// Export singleton instance
export const vectorStore = new VectorStoreService();
