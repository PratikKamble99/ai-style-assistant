import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth';
import { createError } from '../middleware/errorHandler';
import { validate, authSchemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/asyncHandler';
import { prisma } from '../lib/prisma';
import { AsyncLocalStorage } from 'async_hooks';
const fetch = require('node-fetch');

const router = express.Router();

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

    console.log(user, email, password)

    if (!user || !user.password) {
      throw createError('Invalid credentials', 403);
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw createError('Invalid credentials', 403);
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

// Google OAuth
router.post('/google', validate(authSchemas.googleLogin), asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idToken, accessToken } = req.body;

    if (!idToken) {
      throw createError('Google ID token is required', 400);
    }

    // Verify Google token by calling Google's API
    const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);

    if (!googleResponse.ok) {
      throw createError('Invalid Google token', 401);
    }

    const googleUser = await googleResponse.json();

    // Check if token is valid and not expired
    if (!googleUser.email || !googleUser.email_verified) {
      throw createError('Invalid Google token or email not verified', 401);
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      include: {
        profile: true
      }
    });

    if (user) {
      // Update Google ID if not set
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: googleUser.sub },
          include: {
            profile: true
          }
        });
      }
    } else {
      // Create new user
      user = await prisma.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name || googleUser.email.split('@')[0],
          avatar: googleUser.picture,
          googleId: googleUser.sub,
          password: null // No password for Google users
        },
        include: {
          profile: true
        }
      });
    }

    // Generate token
    const token = generateToken(user.id);

    res.json({
      message: 'Google login successful',
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

export default router;