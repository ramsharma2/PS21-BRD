import { Request, Response, NextFunction } from 'express';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
    statusCode: number;
    isOperational: boolean;

    constructor(statusCode: number, message: string, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Centralized error handling middleware
 * Returns consistent error response format: { success: false, error: string }
 */
export const errorHandler = (
    err: Error | ApiError,
    _req: Request,
    res: Response,
    _next: NextFunction
) => {
    console.error('Error:', err);

    // Default error values
    let statusCode = 500;
    let message = 'Internal server error';

    // Handle ApiError instances
    if (err instanceof ApiError) {
        statusCode = err.statusCode;
        message = err.message;
    }
    // Handle known error types
    else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = err.message;
    } else if (err.name === 'UnauthorizedError') {
        statusCode = 401;
        message = 'Unauthorized';
    } else if (err.name === 'PrismaClientKnownRequestError') {
        statusCode = 400;
        message = 'Database error: ' + err.message;
    }
    // Development mode: include full error
    else if (process.env.NODE_ENV === 'development') {
        message = err.message;
    }

    res.status(statusCode).json({
        success: false,
        error: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
