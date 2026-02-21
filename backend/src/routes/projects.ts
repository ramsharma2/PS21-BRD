import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const createProjectSchema = z.object({
    name: z.string().min(1).max(200),
    description: z.string().optional(),
});

const updateProjectSchema = z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    status: z.enum(['draft', 'ingesting', 'processing', 'ready', 'error']).optional(),
});

// ============================================
// ROUTES
// ============================================

/**
 * GET /api/projects
 * Get all projects for the authenticated user
 */
router.get(
    '/',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const projects = await prisma.project.findMany({
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' },
            include: {
                _count: {
                    select: {
                        sources: true,
                        extractions: true,
                        conflicts: true,
                    },
                },
                brd: {
                    select: {
                        id: true,
                        version: true,
                        updatedAt: true,
                    },
                },
            },
        });

        res.json({
            success: true,
            data: projects,
        });
    })
);

/**
 * GET /api/projects/:id
 * Get a specific project by ID
 */
router.get(
    '/:id',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const project = await prisma.project.findFirst({
            where: {
                id: req.params.id as string,
                userId: req.userId,
            },
            include: {
                sources: {
                    orderBy: { ingestedAt: 'desc' },
                },
                extractions: {
                    orderBy: { createdAt: 'desc' },
                },
                brd: true,
                conflicts: {
                    where: { status: 'open' },
                },
                _count: {
                    select: {
                        chunks: true,
                    },
                },
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        res.json({
            success: true,
            data: project,
        });
    })
);

/**
 * POST /api/projects
 * Create a new project
 */
router.post(
    '/',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const validatedData = createProjectSchema.parse(req.body);

        const project = await prisma.project.create({
            data: {
                ...validatedData,
                userId: req.userId!,
            },
        });

        res.status(201).json({
            success: true,
            data: project,
        });
    })
);

/**
 * PATCH /api/projects/:id
 * Update a project
 */
router.patch(
    '/:id',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const validatedData = updateProjectSchema.parse(req.body);

        // Verify ownership
        const existing = await prisma.project.findFirst({
            where: {
                id: req.params.id as string,
                userId: req.userId,
            },
        });

        if (!existing) {
            throw new ApiError(404, 'Project not found');
        }

        const project = await prisma.project.update({
            where: { id: req.params.id as string },
            data: validatedData,
        });

        res.json({
            success: true,
            data: project,
        });
    })
);

/**
 * DELETE /api/projects/:id
 * Delete a project and all associated data
 */
router.delete(
    '/:id',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        // Verify ownership
        const existing = await prisma.project.findFirst({
            where: {
                id: req.params.id as string,
                userId: req.userId,
            },
        });

        if (!existing) {
            throw new ApiError(404, 'Project not found');
        }

        await prisma.project.delete({
            where: { id: req.params.id as string },
        });

        res.json({
            success: true,
            data: { message: 'Project deleted successfully' },
        });
    })
);

export default router;
