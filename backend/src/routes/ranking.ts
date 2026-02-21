import { Router, Request, Response } from 'express';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { chunkRankingService } from '../services/chunkRankingService';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

/**
 * POST /api/ranking/:projectId/rerank
 * Re-rank chunks for a project
 */
router.post(
    '/:projectId/rerank',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const {
            topN = 50,
            relevanceWeight = 0.5,
            semanticWeight = 0.3,
            diversityWeight = 0.2,
            query,
        } = req.body;

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        const rankedChunks = await chunkRankingService.reRankChunks(projectId, {
            topN,
            relevanceWeight,
            semanticWeight,
            diversityWeight,
            query,
        });

        res.json({
            success: true,
            data: {
                totalRanked: rankedChunks.length,
                chunks: rankedChunks.map(chunk => ({
                    id: chunk.id,
                    content: chunk.content.substring(0, 200) + '...',
                    rank: chunk.rank,
                    finalScore: chunk.finalScore,
                    relevanceScore: chunk.relevanceScore,
                    semanticScore: chunk.semanticScore,
                    diversityScore: chunk.diversityScore,
                })),
            },
        });
    })
);

/**
 * POST /api/ranking/:projectId/batch-rerank
 * Batch re-rank and update chunks in database
 */
router.post(
    '/:projectId/batch-rerank',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const { topN = 100 } = req.body;

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        await chunkRankingService.batchReRankAndUpdate(projectId, topN);

        res.json({
            success: true,
            data: {
                message: 'Chunks re-ranked and updated successfully',
            },
        });
    })
);

/**
 * GET /api/ranking/:projectId/stats
 * Get ranking statistics for a project
 */
router.get(
    '/:projectId/stats',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        const stats = await chunkRankingService.getRankingStats(projectId);

        res.json({
            success: true,
            data: stats,
        });
    })
);

/**
 * POST /api/ranking/:projectId/category/:category
 * Get ranked chunks for a specific category
 */
router.post(
    '/:projectId/category/:category',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const category = req.params.category as string;
        const { topN = 20 } = req.body;

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        const rankedChunks = await chunkRankingService.getRankedChunksForCategory(
            projectId,
            category,
            topN
        );

        res.json({
            success: true,
            data: {
                category,
                totalRanked: rankedChunks.length,
                chunks: rankedChunks.map(chunk => ({
                    id: chunk.id,
                    content: chunk.content.substring(0, 200) + '...',
                    rank: chunk.rank,
                    finalScore: chunk.finalScore,
                })),
            },
        });
    })
);

export default router;
