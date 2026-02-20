/**
 * Text chunking utilities for processing large documents
 * Implements overlapping chunks to maintain context
 */

export interface Chunk {
    content: string;
    index: number;
    startChar: number;
    endChar: number;
}

/**
 * Split text into overlapping chunks
 * @param text - Text to chunk
 * @param chunkSize - Target size of each chunk in tokens (approximate)
 * @param overlap - Number of overlapping tokens between chunks
 * @returns Array of chunks with metadata
 */
export function chunkText(
    text: string,
    chunkSize: number = parseInt(process.env.CHUNK_SIZE || '500'),
    overlap: number = parseInt(process.env.CHUNK_OVERLAP || '100')
): Chunk[] {
    // Approximate tokens by splitting on whitespace
    // Note: This is a rough approximation. For exact token counting, use a tokenizer library
    const words = text.split(/\s+/);
    const chunks: Chunk[] = [];

    let index = 0;
    let position = 0;

    while (position < words.length) {
        const chunkWords = words.slice(position, position + chunkSize);
        const content = chunkWords.join(' ');

        // Calculate character positions
        const startChar = words.slice(0, position).join(' ').length;
        const endChar = startChar + content.length;

        chunks.push({
            content,
            index,
            startChar,
            endChar,
        });

        index++;
        position += chunkSize - overlap;
    }

    return chunks;
}

/**
 * Chunk text by sentences to maintain semantic boundaries
 * @param text - Text to chunk
 * @param maxChunkSize - Maximum size of each chunk in characters
 * @returns Array of chunks
 */
export function chunkBySentences(text: string, maxChunkSize: number = 2000): Chunk[] {
    // Split by sentence boundaries
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    const chunks: Chunk[] = [];

    let currentChunk = '';
    let index = 0;
    let startChar = 0;

    for (const sentence of sentences) {
        if (currentChunk.length + sentence.length > maxChunkSize && currentChunk.length > 0) {
            // Save current chunk
            chunks.push({
                content: currentChunk.trim(),
                index,
                startChar,
                endChar: startChar + currentChunk.length,
            });

            // Start new chunk
            index++;
            startChar += currentChunk.length;
            currentChunk = sentence;
        } else {
            currentChunk += sentence;
        }
    }

    // Add the last chunk
    if (currentChunk.length > 0) {
        chunks.push({
            content: currentChunk.trim(),
            index,
            startChar,
            endChar: startChar + currentChunk.length,
        });
    }

    return chunks;
}

/**
 * Chunk text by paragraphs
 * @param text - Text to chunk
 * @returns Array of chunks
 */
export function chunkByParagraphs(text: string): Chunk[] {
    const paragraphs = text.split(/\n\s*\n/);
    const chunks: Chunk[] = [];

    let startChar = 0;

    paragraphs.forEach((paragraph, index) => {
        const content = paragraph.trim();
        if (content.length > 0) {
            chunks.push({
                content,
                index,
                startChar,
                endChar: startChar + content.length,
            });
            startChar += paragraph.length + 2; // +2 for the newlines
        }
    });

    return chunks;
}

/**
 * Smart chunking that tries to maintain semantic boundaries
 * Uses paragraphs first, then sentences, then word-based chunking
 * @param text - Text to chunk
 * @param targetSize - Target chunk size in tokens
 * @returns Array of chunks
 */
export function smartChunk(text: string, targetSize: number = 500): Chunk[] {
    // Try paragraph-based chunking first
    const paragraphChunks = chunkByParagraphs(text);

    // If paragraphs are reasonably sized, use them
    const avgParagraphSize = paragraphChunks.reduce((sum, c) => sum + c.content.split(/\s+/).length, 0) / paragraphChunks.length;

    if (avgParagraphSize <= targetSize * 1.5) {
        return paragraphChunks;
    }

    // Otherwise, use sentence-based chunking
    const sentenceChunks = chunkBySentences(text, targetSize * 4); // Approximate 4 chars per token

    return sentenceChunks;
}
