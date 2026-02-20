import { prisma } from '../index';

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
        },
        include: {
            source: true
        }
    });

    // 2. Map to RTM structure
    // In a real app, we would trace *where* in the BRD this specific requirement was used.
    // For now, we'll map based on category -> BRD section heuristic

    const rtmData: RTMEntry[] = requirements.map(req => {
        let section = 'Unknown';
        if (req.category === 'functional_req') section = 'Functional Requirements';
        if (req.category === 'nonfunctional_req') section = 'Non-Functional Requirements';

        return {
            requirementId: req.id,
            requirement: req.content,
            sourceId: req.sourceId,
            sourceName: req.source.filename,
            brdSection: section,
            priority: req.priority,
            status: 'Draft' // Default status
        };
    });

    return rtmData;
};
