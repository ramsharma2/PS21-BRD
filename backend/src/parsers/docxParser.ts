import mammoth from 'mammoth';
import fs from 'fs/promises';

/**
 * Extract text content from a DOCX file
 * @param filePath - Path to the DOCX file
 * @returns Extracted text content
 */
export async function parseDOCX(filePath: string): Promise<string> {
    try {
        const buffer = await fs.readFile(filePath);
        const result = await mammoth.extractRawText({ buffer });

        if (result.messages.length > 0) {
            console.warn('DOCX parsing warnings:', result.messages);
        }

        return result.value;
    } catch (error) {
        console.error('DOCX parsing error:', error);
        throw new Error(`Failed to parse DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Extract HTML from a DOCX file (preserves some formatting)
 * @param filePath - Path to the DOCX file
 * @returns Extracted HTML content
 */
export async function parseDOCXToHTML(filePath: string): Promise<string> {
    try {
        const buffer = await fs.readFile(filePath);
        const result = await mammoth.convertToHtml({ buffer });

        if (result.messages.length > 0) {
            console.warn('DOCX to HTML conversion warnings:', result.messages);
        }

        return result.value;
    } catch (error) {
        console.error('DOCX to HTML conversion error:', error);
        throw new Error(`Failed to convert DOCX to HTML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}
