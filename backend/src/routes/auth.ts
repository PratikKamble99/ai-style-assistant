import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { generateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { validate, authSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/asyncHandler';

const router = express.Router();
const prisma = new PrismaClient();

// Register
router.post('/register', validate(authSchemas.register), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { email, password, name } = req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw createError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true
      }
    });

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'User created successfully',
      user,
      token
    });
  } catch (error) {
    next(error);
  }
}));

// Login
router.post('/login', validate(authSchemas.login), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {

    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        profile: true
      }
    });

    if (!user || !user.password) {
      throw createError('Invalid credentials', 401);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 401);
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        profile: user.profile
      },
      token
    });
  } catch (error) {
    next(error);
  }
}));

// Google OAuth (placeholder - implement with passport-google-oauth20)
router.post('/google', asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { googleToken } = req.body;
    
    // TODO: Verify Google token and extract user info
    // This is a placeholder implementation
    
    res.json({
      message: 'Google OAuth not implemented yet',
      error: 'Feature coming soon'
    });
  } catch (error) {
    next(error);
  }
}));

export default router;