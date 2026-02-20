import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '../index';
import { CONFLICT_DETECTION_SYSTEM_PROMPT, createConflictDetectionPrompt } from '../utils/prompts';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
    systemInstruction: CONFLICT_DETECTION_SYSTEM_PROMPT
});

interface ConflictCheckResult {
    hasConflict: boolean;
    severity?: 'high' | 'medium' | 'low';
    description?: string;
    suggestedResolution?: string;
    itemAId: string;
    itemBId: string;
}

export const detectConflicts = async (projectId: string): Promise<ConflictCheckResult[]> => {
    // 1. Fetch all requirements for the project
    const requirements = await prisma.extraction.findMany({
        where: {
            projectId,
            category: { in: ['functional_req', 'nonfunctional_req', 'constraint'] } // Compare reqs and constraints
        }
    });

    if (requirements.length < 2) return [];

    const conflicts: ConflictCheckResult[] = [];

    // 2. Pairwise comparison (Optimization: heuristic or vector similarity could be used to select pairs, 
    // but for now we'll do a simplified N^2 approach or limited batching for demonstration. 
    // For production, we should only compare "related" items using vector similarity).

    // Let's use a smarter approach: Group by similar topics? 
    // Or just compare items that seem contradictory?
    // Since we have limited API calls, let's just picking a few high-priority "Must Have" requirements 
    // and check them against Constraints + other Must Haves.

    const highPriority = requirements.filter(r => r.priority === 'must_have' || r.category === 'constraint');

    // Limit to avoiding explosion for now
    const MAX_PAIRS = 10;
    let pairsChecked = 0;

    for (let i = 0; i < highPriority.length; i++) {
        for (let j = i + 1; j < highPriority.length; j++) {
            if (pairsChecked >= MAX_PAIRS) break;

            const itemA = highPriority[i];
            const itemB = highPriority[j];

            // Skip if same category/id obviously

            const prompt = createConflictDetectionPrompt(
                itemA.content,
                itemB.content,
                `Type: ${itemA.category}`,
                `Type: ${itemB.category}`
            );

            try {
                const result = await model.generateContent(prompt);
                const responseText = result.response.text();

                // Parse JSON
                const match = responseText.match(/\{[\s\S]*\}/);
                if (match) {
                    const analysis = JSON.parse(match[0]);
                    if (analysis.hasConflict) {
                        conflicts.push({
                            itemAId: itemA.id,
                            itemBId: itemB.id,
                            hasConflict: true,
                            severity: analysis.severity,
                            description: analysis.description,
                            suggestedResolution: analysis.suggestedResolution
                        });

                        // Store in DB
                        await prisma.conflict.create({
                            data: {
                                projectId,
                                itemAId: itemA.id,
                                itemBId: itemB.id,
                                severity: analysis.severity,
                                description: analysis.description,
                                status: 'open',
                                resolution: analysis.suggestedResolution
                            }
                        });
                    }
                }
            } catch (e) {
                console.error('Error checking conflict pair:', e);
            }

            pairsChecked++;
        }
        if (pairsChecked >= MAX_PAIRS) break;
    }

    return conflicts;
};

export const getProjectConflicts = async (projectId: string) => {
    return await prisma.conflict.findMany({
        where: { projectId },
        include: {
            itemA: true,
            itemB: true
        }
    });
};

export const resolveConflict = async (conflictId: string, resolution: string, status: 'resolved' | 'ignored') => {
    return await prisma.conflict.update({
        where: { id: conflictId },
        data: {
            resolution,
            status,
            resolvedAt: new Date()
        }
    });
};
