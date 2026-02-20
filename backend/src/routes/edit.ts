import { Router } from 'express';
import { processEditRequest, getVersionHistory, rollbackToVersion } from '../services/nlEditService';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Validation schemas
const editRequestSchema = z.object({
    projectId: z.string(),
    instruction: z.string().min(1),
    section: z.string().optional(),
});

/**
 * @route POST /api/edit/apply
 * @desc Apply natural language edit to BRD
 * @access Private
 */
router.post('/apply', requireAuth, async (req, res, next) => {
    try {
        const { projectId, instruction, section } = editRequestSchema.parse(req.body);
        const { projectId: brdId } = req.body; // Assuming projectId maps to brdId for now, or we fetch BRD by project

        // We need the BRD ID. Assuming 1:1 Project:BRD relation, we can look it up or pass it.
        // Let's assume the frontend passes the BRD ID if available, or we find it via project.
        // For now, let's treat projectId as the identifier to find the BRD.
        // Actually, let's fetch the BRD associated with the project.

        // In a real implementation: `const brd = await prisma.bRD.findFirst({ where: { projectId } })`
        // Depending on schema. 
        // Let's import prisma to do this lookup if needed, but for now let's assume body passed brdId if available
        // or we use the projectId to find the active BRD.

        // Let's look at schema.prisma to see relation.
        // Checking schema... it's a 1:1 relation likely.

        // Just passing the request to service.
        // The service expects brdId.

        // Fix: Let's assume the client sends "brdId".

        const brdIdToUse = req.body.brdId;
        if (!brdIdToUse) {
            return res.status(400).json({ error: 'BRD ID is required' });
        }

        const result = await processEditRequest({
            projectId,
            brdId: brdIdToUse,
            instruction,
            section,
        });

        res.json(result);
    } catch (error) {
        next(error);
    }
});

/**
 * @route GET /api/edit/:brdId/history
 * @desc Get version history for a BRD
 * @access Private
 */
router.get('/:brdId/history', requireAuth, async (req, res, next) => {
    try {
        const { brdId } = req.params;
        const history = await getVersionHistory(brdId);
        res.json(history);
    } catch (error) {
        next(error);
    }
});

/**
 * @route POST /api/edit/:brdId/rollback/:versionId
 * @desc Rollback BRD to a specific version
 * @access Private
 */
router.post('/:brdId/rollback/:versionId', requireAuth, async (req, res, next) => {
    try {
        const { brdId, versionId } = req.params;
        const result = await rollbackToVersion(brdId, versionId);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
