import { Router } from 'express';
import { analyzeSentiment } from '../services/sentimentService';
import { requireAuth } from '../middleware/auth';

const router = Router();

router.get('/:projectId', requireAuth, async (req, res, next) => {
    try {
        const { projectId } = req.params;
        const data = await analyzeSentiment(projectId);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
});

export default router;
