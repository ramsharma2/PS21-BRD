import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * Get all sources for a project
 */
router.get('/project/:projectId', async (req, res) => {
    try {
        const { projectId } = req.params;

        const sources = await prisma.source.findMany({
            where: { projectId },
            orderBy: { ingestedAt: 'desc' },
        });

        res.json(sources);
    } catch (error) {
        console.error('Error fetching sources:', error);
        res.status(500).json({ error: 'Failed to fetch sources' });
    }
});

/**
 * Get a single source by ID
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        const source = await prisma.source.findUnique({
            where: { id },
            include: {
                chunks: {
                    where: { isRelevant: true },
                    orderBy: { chunkIndex: 'asc' },
                },
            },
        });

        if (!source) {
            return res.status(404).json({ error: 'Source not found' });
        }

        res.json(source);
    } catch (error) {
        console.error('Error fetching source:', error);
        res.status(500).json({ error: 'Failed to fetch source' });
    }
});

/**
 * Get a specific chunk by ID
 */
router.get('/chunk/:chunkId', async (req, res) => {
    try {
        const { chunkId } = req.params;

        const chunk = await prisma.chunk.findUnique({
            where: { id: chunkId },
            include: {
                source: true,
            },
        });

        if (!chunk) {
            return res.status(404).json({ error: 'Chunk not found' });
        }

        res.json(chunk);
    } catch (error) {
        console.error('Error fetching chunk:', error);
        res.status(500).json({ error: 'Failed to fetch chunk' });
    }
});

export default router;
