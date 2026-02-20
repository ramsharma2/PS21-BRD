import pdfParse from 'pdf-parse';
import fs from 'fs/promises';

/**
 * Extract text content from a PDF file
 * @param filePath - Path to the PDF file
 * @returns Extracted text content
 */
export async function parsePDF(filePath: string): Promise<string> {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);

        return data.text;
    } catch (error) {
        console.error('PDF parsing error:', error);
        throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract metadata from a PDF file
 * @param filePath - Path to the PDF file
 * @returns PDF metadata
 */
export async function getPDFMetadata(filePath: string): Promise<{
    pages: number;
    title?: string;
    author?: string;
    subject?: string;
    creator?: string;
}> {
    try {
        const dataBuffer = await fs.readFile(filePath);
        const data = await pdfParse(dataBuffer);

        return {
            pages: data.numpages,
            title: data.info?.Title,
            author: data.info?.Author,
            subject: data.info?.Subject,
            creator: data.info?.Creator,
        };
    } catch (error) {
        console.error('PDF metadata extraction error:', error);
        throw new Error(`Failed to extract PDF metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
