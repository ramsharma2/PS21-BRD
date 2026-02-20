import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../index';
import { BRD_EDIT_PROMPT } from '../utils/prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-1.5-pro' });

interface EditRequest {
    projectId: string;
    brdId: string;
    section?: string; // Optional: specific section to edit, if null applies to whole doc or inferred
    instruction: string;
}

interface EditResult {
    success: boolean;
    newContent: any;
    explanation: string;
    affectedSections: string[];
}

export const processEditRequest = async (request: EditRequest): Promise<EditResult> => {
    try {
        // 1. Fetch current BRD
        const brd = await prisma.bRD.findUnique({
            where: { id: request.brdId },
        });

        if (!brd) {
            throw new Error('BRD not found');
        }

        const currentContent = brd.content as any;

        // 2. Prepare context for AI
        // If a specific section is targeted, we emphasize it, otherwise provided full context
        const context = JSON.stringify(currentContent, null, 2);

        // 3. Construct Prompt
        const prompt = BRD_EDIT_PROMPT
            .replace('{{CURRENT_BRD}}', context)
            .replace('{{INSTRUCTION}}', request.instruction)
            .replace('{{SECTION_CONTEXT}}', request.section ? `Target Section: ${request.section}` : 'Target: Infer from instruction');

        // 4. Call AI
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // 5. Parse AI Response (expecting JSON)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('Failed to parse AI response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        // 6. Validate structure (basic check)
        if (!parsedResponse.content || !parsedResponse.explanation) {
            throw new Error('AI response missing required fields');
        }

        // 7. Create new BRD Version
        const newVersion = await prisma.bRDVersion.create({
            data: {
                brdId: request.brdId,
                content: parsedResponse.content,
                changeLog: request.instruction,
                versionNumber: (brd.version || 0) + 1,
                createdBy: 'AI_EDIT', // TODO: Pass user ID if available
            },
        });

        // 8. Update main BRD record
        await prisma.bRD.update({
            where: { id: request.brdId },
            data: {
                content: parsedResponse.content,
                version: { increment: 1 },
            },
        });

        return {
            success: true,
            newContent: parsedResponse.content,
            explanation: parsedResponse.explanation,
            affectedSections: parsedResponse.affected_sections || [],
        };

    } catch (error) {
        console.error('Error processing edit request:', error);
        throw error;
    }
};

export const getVersionHistory = async (brdId: string) => {
    return await prisma.bRDVersion.findMany({
        where: { brdId },
        orderBy: { createdAt: 'desc' },
        select: {
            id: true,
            versionNumber: true,
            createdAt: true,
            changeLog: true,
            createdBy: true,
        }
    });
};

export const rollbackToVersion = async (brdId: string, versionId: string) => {
    const version = await prisma.bRDVersion.findUnique({
        where: { id: versionId },
    });

    if (!version) throw new Error('Version not found');

    // Create a new version that is a copy of the old one (to preserve linear history)
    const currentBrd = await prisma.bRD.findUnique({ where: { id: brdId } });

    await prisma.bRDVersion.create({
        data: {
            brdId,
            content: version.content || {},
            changeLog: `Rollback to version ${version.versionNumber}`,
            versionNumber: (currentBrd?.version || 0) + 1,
            createdBy: 'SYSTEM_ROLLBACK',
        },
    });

    return await prisma.bRD.update({
        where: { id: brdId },
        data: {
            content: version.content || {},
            version: { increment: 1 },
        },
    });
};
