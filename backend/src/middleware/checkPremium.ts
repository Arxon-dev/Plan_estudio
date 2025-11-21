import { Request, Response, NextFunction } from 'express';

export const checkPremium = async (req: any, res: Response, next: NextFunction) => {
    try {
        const user = req.user;

        if (!user || !user.isPremium) {
            return res.status(403).json({
                message: 'Premium access required',
                code: 'PREMIUM_REQUIRED'
            });
        }

        next();
    } catch (error) {
        console.error('Error checking premium status:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
