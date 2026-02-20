import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimit';

// Load environment variables
dotenv.config();

// Import routes
import projectsRouter from './routes/projects';
import ingestionRouter from './routes/ingestion';
import brdRouter from './routes/brd';
import editRouter from './routes/edit';
import integrationsRouter from './routes/integrations';
import conflictsRouter from './routes/conflicts';
import rtmRouter from './routes/rtm';
import analyticsRouter from './routes/analytics';
import notificationsRouter from './routes/notifications';

const app: Express = express();
const PORT = process.env.PORT || 3001;

// ============================================
// MIDDLEWARE
// ============================================

// Security headers
app.use(helmet());

// CORS configuration
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3000',
        credentials: true,
    })
);

// Body parsing
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rate limiting
app.use(rateLimiter);

// Request logging
app.use((req: Request, _res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ============================================
// ROUTES
// ============================================

app.get('/health', (_req: Request, res: Response) => {
    res.json({
        success: true,
        data: {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV || 'development',
            mockMode: process.env.MOCK_MODE === 'true',
        },
    });
});

// API routes
app.use('/api/projects', projectsRouter);
app.use('/api/ingestion', ingestionRouter);
app.use('/api/brd', brdRouter);
app.use('/api/edit', editRouter);
app.use('/api/integrations', integrationsRouter);
app.use('/api/conflicts', conflictsRouter);
app.use('/api/rtm', rtmRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/notifications', notificationsRouter);

// 404 handler
app.use((_req: Request, res: Response) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
    });
});

// ============================================
// ERROR HANDLING
// ============================================

app.use(errorHandler);

// ============================================
// SERVER START
// ============================================

app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 BRD Generator API Server                            ║
║                                                           ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(42)} ║
║   Port:        ${PORT.toString().padEnd(42)} ║
║   Mock Mode:   ${(process.env.MOCK_MODE === 'true' ? 'ENABLED' : 'DISABLED').padEnd(42)} ║
║                                                           ║
║   Health:      http://localhost:${PORT}/health${' '.repeat(20)} ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
  `);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    process.exit(0);
});

export default app;
