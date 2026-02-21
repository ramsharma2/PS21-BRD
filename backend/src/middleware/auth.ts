import { Request, Response, NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';
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

let _client: OAuth2Client;

const getAuthClient = () => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
        throw new ApiError(500, 'GOOGLE_CLIENT_ID is not configured');
    }
    if (!_client) {
        _client = new OAuth2Client(clientId);
    }
    return { client: _client, clientId };
};

/**
 * Authentication middleware using Google Auth Library
 * Verifies the ID token and attaches userId to the request
 */
export const requireAuth = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new ApiError(401, 'No authorization token provided');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify the Google ID token
        const { client, clientId } = getAuthClient();
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: clientId,
        });

        const payload = ticket.getPayload();

        if (!payload || !payload.sub) {
            throw new ApiError(401, 'Invalid or expired session');
        }

        // Attach userId to request (sub is the unique Google user ID)
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

            try {
                const { client, clientId } = getAuthClient();
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: clientId,
                });

                const payload = ticket.getPayload();
                if (payload && payload.sub) {
                    req.userId = payload.sub;
                }
            } catch (err) {
                // Ignore invalid token for optional auth
            }
        }

        next();
    } catch (error) {
        // Silently fail for optional auth
        next();
    }
};
