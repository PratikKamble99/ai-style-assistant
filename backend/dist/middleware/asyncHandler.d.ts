import { Request, Response, NextFunction, RequestHandler } from 'express';
import { AuthRequest } from './auth';
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => RequestHandler;
export declare const asyncAuthHandler: (fn: (req: AuthRequest, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=asyncHandler.d.ts.map