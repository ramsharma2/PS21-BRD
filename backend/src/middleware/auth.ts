import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { ApiError } from './errorHandler';

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

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
 * Authentication middleware using Google Auth Library
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

        // Verify the JWT token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.sub) {
            throw new ApiError(401, 'Invalid or expired session');
        }

        // Attach userId to request (sub is the user ID in Google JWTs)
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
            const token = authHeader.substring(7);
            const ticket = await googleClient.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });

            const payload = ticket.getPayload();

            if (payload && payload.sub) {
                req.userId = payload.sub;
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
