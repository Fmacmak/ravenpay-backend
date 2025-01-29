import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            }
        }
    }
}

export const auth = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication token is required'
            });
        }

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET || 'your-secret-key'
        ) as {
            userId: string;
            email: string;
        };

        // Attach user info to request object
        req.user = {
            id: decoded.userId,
            email: decoded.email
        };

        next();
    } catch (error: any) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                status: 'error',
                message: 'Invalid token'
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                status: 'error',
                message: 'Token expired'
            });
        }
        
        console.error('Auth middleware error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Internal server error'
        });
    }
};