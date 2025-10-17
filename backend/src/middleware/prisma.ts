import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { prisma } from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      prisma: any;
    }
  }
}

export const prismaMiddleware = (req: Request, res: Response, next: NextFunction) => {
  req.prisma = prisma;
  next();
};

export { prisma };