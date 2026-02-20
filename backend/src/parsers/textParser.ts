import fs from 'fs/promises';
import * as XLSX from 'xlsx';

/**
 * Parse plain text file
 * @param filePath - Path to the text file
 * @returns File content as string
 */
export async function parseTextFile(filePath: string): Promise<string> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        console.error('Text file parsing error:', error);
        throw new Error(`Failed to parse text file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parse CSV file
 * @param filePath - Path to the CSV file
 * @returns Parsed CSV data as array of objects
 */
export async function parseCSV(filePath: string): Promise<Record<string, any>[]> {
    try {
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        return data;
    } catch (error) {
        console.error('CSV parsing error:', error);
        throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Parse Excel file (.xlsx, .xls)
 * @param filePath - Path to the Excel file
 * @returns Object with sheet names as keys and data arrays as values
 */
export async function parseExcel(filePath: string): Promise<Record<string, Record<string, any>[]>> {
    try {
        const workbook = XLSX.readFile(filePath);
        const result: Record<string, Record<string, any>[]> = {};

        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            result[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        }

        return result;
    } catch (error) {
        console.error('Excel parsing error:', error);
        throw new Error(`Failed to parse Excel: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}

/**
 * Convert structured data (CSV/Excel) to readable text
 * @param data - Array of objects from CSV/Excel
 * @returns Formatted text representation
 */
export function structuredDataToText(data: Record<string, any>[]): string {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    let text = `Headers: ${headers.join(', ')}\n\n`;

    data.forEach((row, index) => {
        text += `Row ${index + 1}:\n`;
        headers.forEach((header) => {
            text += `  ${header}: ${row[header]}\n`;
        });
        text += '\n';
    });

    return text;
}
