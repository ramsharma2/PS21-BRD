import { Router } from 'express';
import { generateRTM } from '../services/rtmService';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:projectId', requireAuth, async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const data = await generateRTM(projectId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default router;
