import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { sendStatusEmail } from '../services/emailService';

const router = Router();

// Trigger a status update email manually (for testing or workflow steps)
router.post('/status-update', requireAuth, async (req, res, next) => {
    try {
        const { projectId, email, status } = req.body;

        if (!projectId || !email || !status) {
            return res.status(400).json({ success: false, error: 'Missing required fields' });
        }

        const project = await prisma.project.findUnique({
            where: { id: projectId }
        });

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        await sendStatusEmail(email, project, status);

        res.json({ success: true, message: 'Email sent successfully' });
    } catch (error) {
        next(error);
    }
});

export default router;
