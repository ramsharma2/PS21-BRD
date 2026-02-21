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
        console.log('[Edit] Received edit request:', req.body);
        
        const { projectId, instruction, section } = editRequestSchema.parse(req.body);
        const brdIdToUse = req.body.brdId;
        
        if (!brdIdToUse) {
            console.error('[Edit] Missing brdId in request');
            return res.status(400).json({ success: false, error: 'BRD ID is required' });
        }

        console.log('[Edit] Processing edit for BRD:', brdIdToUse);
        
        const result = await processEditRequest({
            projectId,
            brdId: brdIdToUse,
            instruction,
            section,
        });

        console.log('[Edit] Edit successful, result:', JSON.stringify(result, null, 2));
        res.json({ success: true, data: result });
    } catch (error: any) {
        console.error('[Edit] Error processing edit:', error.message);
        res.status(500).json({ success: false, error: error.message || 'Failed to process edit' });
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
        const history = await getVersionHistory(brdId as string);
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
        const result = await rollbackToVersion(brdId as string, versionId as string);
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;
