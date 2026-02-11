import { Request, Response, NextFunction } from 'express';

export const mockCheckSubscription = (actionType: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const mockResponse = {
            success: true,
            allowed: true,
            reason: `Allowed action: ${actionType} (MOCK_MODE)`
        };
        
        console.log(`[MockSubscription] Permission granted for ${actionType}`);
        next();
    };
};