import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface RTMEntry {
    requirementId: string;
    requirement: string;
    sourceId: string;
    sourceName: string;
    brdSection: string;
    priority: string;
    status: string;
}

export const generateRTM = async (projectId: string): Promise<RTMEntry[]> => {
    // 1. Fetch requirements
    const requirements = await prisma.extraction.findMany({
        where: {
            projectId,
            category: { in: ['functional_req', 'nonfunctional_req'] }
        }
    });

    // 2. Map to RTM structure
    // In a real app, we would trace *where* in the BRD this specific requirement was used.
    // For now, we'll map based on category -> BRD section heuristic

    const rtmData: RTMEntry[] = requirements.map(req => {
        let section = 'Unknown';
        if (req.category === 'functional_req') section = 'Functional Requirements';
        if (req.category === 'nonfunctional_req') section = 'Non-Functional Requirements';

        let sourceId = '';
        let sourceName = 'Unknown';
        try {
            if (req.citations) {
                const citationsArr = JSON.parse(req.citations);
                if (Array.isArray(citationsArr) && citationsArr.length > 0) {
                    sourceId = citationsArr[0].sourceId || '';
                    sourceName = citationsArr[0].fileName || citationsArr[0].sourceId || 'Unknown Source';
                }
            }
        } catch (e) { }

        return {
            requirementId: req.id,
            requirement: req.content,
            sourceId,
            sourceName,
            brdSection: section,
            priority: req.priority || 'Not Specified',
            status: 'Draft' // Default status
        };
    });

    return rtmData;
};
