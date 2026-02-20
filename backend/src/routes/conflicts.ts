import { Router } from 'express';
import { detectConflicts, getProjectConflicts, resolveConflict } from '../services/conflictDetectionService';
import { requireAuth } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

// Run detection
router.post('/detect/:projectId', requireAuth, async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const conflicts = await detectConflicts(projectId);
        res.json({ success: true, count: conflicts.length, conflicts });
    } catch (error) {
        next(error);
    }
});

// Get conflicts
router.get('/:projectId', requireAuth, async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const conflicts = await getProjectConflicts(projectId);
        res.json({ success: true, data: conflicts });
    } catch (error) {
        next(error);
    }
});

// Resolve conflict
router.patch('/:id/resolve', requireAuth, async (req, res, next) => {
    try {
        const { id } = req.params;
        const { resolution, status } = req.body;

        if (!['resolved', 'ignored'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const conflict = await resolveConflict(id, resolution, status);
        res.json({ success: true, data: conflict });
    } catch (error) {
        next(error);
    }
});

export default router;
