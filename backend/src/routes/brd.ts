import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../middleware/auth';
import { asyncHandler, ApiError } from '../middleware/errorHandler';
import { aiRateLimiter } from '../middleware/rateLimit';
import { noiseFilterService } from '../services/noiseFilterService';
import { extractionService } from '../services/extractionService';
import { brdGeneratorService } from '../services/brdGeneratorService';

const router = Router();
const prisma = new PrismaClient();

// ============================================
// BRD GENERATION & RETRIEVAL
// ============================================

/**
 * POST /api/brd/process/:projectId
 * Process all sources: filter noise, extract information
 */
router.post(
    '/process/:projectId',
    requireAuth,
    aiRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;

        // Verify project ownership
        const project = await prisma.project.findFirst({
            where: {
                id: projectId,
                userId: req.userId,
            },
            include: {
                sources: true,
            },
        });

        if (!project) {
            throw new ApiError(404, 'Project not found');
        }

        if (project.sources.length === 0) {
            throw new ApiError(400, 'No sources to process. Please upload documents first.');
        }

        // Update project status
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'processing' },
        });

        // Process all sources (noise filtering + extraction)
        try {
            // Step 1: Noise filtering
            for (const source of project.sources) {
                await noiseFilterService.processSource(source.id, projectId);
            }

            // Step 2: Information extraction
            await extractionService.extractFromProject(projectId);

            res.json({
                success: true,
                data: {
                    message: 'Processing complete',
                    filtering: await noiseFilterService.getFilteringStats(projectId),
                    extraction: await extractionService.getExtractionStats(projectId),
                    sources: project.sources.length,
                    conflicts: 0,
                },
            });
        } catch (error) {
            // Update project status to error
            await prisma.project.update({
                where: { id: projectId },
                data: { status: 'error' },
            });
            throw error;
        }
    })
);

/**
 * POST /api/brd/generate/:projectId
 * Generate BRD for a project with streaming support and template selection
 */
router.post(
    '/generate/:projectId',
    requireAuth,
    aiRateLimiter,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const { stream } = req.query;
        const { templateId = 'standard' } = req.body;

        console.log(`[BRD Generation] Starting for project ${projectId} with template ${templateId}`);

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

        // Check if extractions exist
        const extractionCount = await prisma.extraction.count({
            where: { projectId },
        });

        console.log(`[BRD Generation] Found ${extractionCount} extractions for project ${projectId}`);

        if (extractionCount === 0) {
            throw new ApiError(
                400,
                'No extracted information available. Please run processing first.'
            );
        }

        // Update project status to processing
        await prisma.project.update({
            where: { id: projectId },
            data: { status: 'processing' },
        });

        // If streaming is requested, use Server-Sent Events
        if (stream === 'true') {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            // Send progress updates
            const onProgress = (section: string, content: any) => {
                res.write(`event: progress\n`);
                res.write(`data: ${JSON.stringify({ section, content })}\n\n`);
            };

            try {
                const brdId = await brdGeneratorService.generateBRD(projectId, templateId, onProgress);

                // Send completion event
                res.write(`event: complete\n`);
                res.write(`data: ${JSON.stringify({ brdId })}\n\n`);
                res.end();
            } catch (error) {
                console.error('[BRD Generation] Error:', error);
                // Update project status to error
                await prisma.project.update({
                    where: { id: projectId },
                    data: { status: 'error' },
                });
                res.write(`event: error\n`);
                res.write(`data: ${JSON.stringify({ error: (error as Error).message })}\n\n`);
                res.end();
            }
        } else {
            // Non-streaming: generate and return
            try {
                const brdId = await brdGeneratorService.generateBRD(projectId, templateId);
                console.log(`[BRD Generation] Successfully generated BRD ${brdId} for project ${projectId}`);

                res.json({
                    success: true,
                    data: { brdId },
                });
            } catch (error) {
                console.error('[BRD Generation] Error:', error);
                // Update project status to error
                await prisma.project.update({
                    where: { id: projectId },
                    data: { status: 'error' },
                });
                throw error;
            }
        }
    })
);

/**
 * GET /api/brd/:projectId
 * Get BRD for a project
 */
router.get(
    '/:projectId',
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

        const brd = await brdGeneratorService.getBRD(projectId);

        if (!brd) {
            throw new ApiError(404, 'BRD not found. Please generate it first.');
        }

        res.json({
            success: true,
            data: brd,
        });
    })
);

/**
 * GET /api/brd/:projectId/stats
 * Get processing statistics for a project
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

        const stats = {
            filtering: await noiseFilterService.getFilteringStats(projectId),
            extraction: await extractionService.getExtractionStats(projectId),
            sources: await prisma.source.count({ where: { projectId } }),
            conflicts: await prisma.conflict.count({ where: { projectId, status: 'open' } }),
        };

        res.json({
            success: true,
            data: stats,
        });
    })
);

/**
 * GET /api/brd/:projectId/export/:format
 * Export BRD in specified format (pdf, docx, md)
 */
router.get(
    '/:projectId/export/:format',
    requireAuth,
    asyncHandler(async (req: Request, res: Response) => {
        const projectId = req.params.projectId as string;
        const format = req.params.format as string;

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

        const brd = await brdGeneratorService.getBRD(projectId);

        if (!brd) {
            throw new ApiError(404, 'BRD not found');
        }

        // TODO: Implement actual export functionality
        // For now, return JSON or markdown
        if (format === 'json') {
            res.json(brd);
        } else if (format === 'md') {
            // Simple markdown export
            const markdown = generateMarkdown(brd);
            res.setHeader('Content-Type', 'text/markdown');
            res.setHeader('Content-Disposition', `attachment; filename="BRD-${project.name}.md"`);
            res.send(markdown);
        } else {
            throw new ApiError(400, 'Unsupported export format. Use: json, md');
        }
    })
);

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Generate markdown from BRD
 */
function generateMarkdown(brd: any): string {
    let md = `# Business Requirements Document\n\n`;
    md += `**Project:** ${brd.project.name}\n`;
    md += `**Version:** ${brd.version}\n`;
    md += `**Last Updated:** ${new Date(brd.updatedAt).toLocaleDateString()}\n\n`;

    md += `---\n\n`;

    // Executive Summary
    md += `## 1. Executive Summary\n\n`;
    if (brd.executiveSummary.overview) {
        md += `${brd.executiveSummary.overview}\n\n`;
    }

    // Business Objectives
    md += `## 2. Business Objectives\n\n`;
    if (brd.businessObjectives.primary) {
        md += `### Primary Objectives\n\n`;
        brd.businessObjectives.primary.forEach((obj: string) => {
            md += `- ${obj}\n`;
        });
        md += `\n`;
    }

    // Functional Requirements
    md += `## 3. Functional Requirements\n\n`;
    if (brd.functionalRequirements.requirements) {
        brd.functionalRequirements.requirements.forEach((req: any) => {
            md += `### ${req.id}: ${req.description}\n\n`;
            md += `**Priority:** ${req.priority}\n\n`;
            if (req.acceptanceCriteria) {
                md += `**Acceptance Criteria:**\n`;
                req.acceptanceCriteria.forEach((ac: string) => {
                    md += `- ${ac}\n`;
                });
                md += `\n`;
            }
        });
    }

    // Add other sections similarly...

    return md;
}

export default router;
