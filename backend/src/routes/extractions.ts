import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get all extractions for a project
 */
router.get('/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        const extractions = await prisma.extraction.findMany({
            where: { projectId },
            orderBy: { createdAt: 'desc' },
        });

        res.json(extractions);
    } catch (error) {
        console.error('Error fetching extractions:', error);
        res.status(500).json({ error: 'Failed to fetch extractions' });
    }
});

/**
 * Get a single extraction by ID
 */
router.get('/detail/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const extraction = await prisma.extraction.findUnique({
            where: { id },
        });

        if (!extraction) {
            return res.status(404).json({ error: 'Extraction not found' });
        }

        res.json(extraction);
    } catch (error) {
        console.error('Error fetching extraction:', error);
        res.status(500).json({ error: 'Failed to fetch extraction' });
    }
});

export default router;
