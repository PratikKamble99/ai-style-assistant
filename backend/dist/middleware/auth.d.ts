import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
            };
        }
    }
}
export interface AuthRequest extends Request {
    user?: {
        id: string;
        email: string;
    };
}
export declare const authenticateToken: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateToken: (userId: string) => string;
//# sourceMappingURL=auth.d.ts.map