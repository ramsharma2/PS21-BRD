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

        let sourceId = 'Unknown Source ID';
        let sourceName = 'Unknown Source';

        try {
            const citations = JSON.parse(req.citations || '[]');
            if (citations && citations.length > 0) {
                sourceId = citations[0].sourceId || sourceId;
                // Currently storing full source details may require another query mapping, 
                // but basic ID is stored in citations
                sourceName = citations[0].sourceLabel || citations[0].sourceId || sourceName;
            }
        } catch (e) { }

        return {
            requirementId: req.id,
            requirement: req.content,
            sourceId: sourceId,
            sourceName: sourceName,
            brdSection: section,
            priority: req.priority || 'Unknown',
            status: 'Draft' // Default status
        };
    });

    return rtmData;
};
