import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
declare global {
    namespace Express {
        interface Request {
            prisma: any;
        }
    }
}
export declare const prismaMiddleware: (req: Request, res: Response, next: NextFunction) => void;
export { prisma };
//# sourceMappingURL=prisma.d.ts.map