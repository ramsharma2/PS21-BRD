import { Request, Response, NextFunction } from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { ApiError } from './errorHandler';

/**
 * Extend Express Request to include userId
 */
declare global {
    namespace Express {
        interface Request {
            userId?: string;
        }
    }
}

/**
 * Authentication middleware using Clerk
 * Verifies the session token and attaches userId to the request
 */
export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Get the session token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No authorization token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the JWT token with Clerk
        const payload = await clerkClient.verifyToken(token, {
            secretKey: process.env.CLERK_SECRET_KEY,
        });

        if (!payload || !payload.sub) {
            throw new ApiError(401, 'Invalid or expired session');
        }

        // Attach userId to request (sub is the user ID in Clerk JWTs)
        req.userId = payload.sub;

        next();
    } catch (error) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            console.error('Auth error:', error);
            next(new ApiError(401, 'Authentication failed'));
        }
    }
};

/**
 * Optional authentication middleware
 * Attaches userId if token is present, but doesn't require it
 */
export const optionalAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const sessionToken = authHeader.substring(7);
            const session = await clerkClient.sessions.verifySession(sessionToken, sessionToken);

            if (session && session.userId) {
                req.userId = session.userId;
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
