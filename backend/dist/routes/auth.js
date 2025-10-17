"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const errorHandler_1 = require("../middleware/errorHandler");
const validation_1 = require("../middleware/validation");
const asyncHandler_1 = require("../middleware/asyncHandler");
const prisma_1 = require("../lib/prisma");
const fetch = require('node-fetch');
const router = express_1.default.Router();
// Register
router.post('/register', (0, validation_1.validate)(validation_1.authSchemas.register), (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        // Check if user exists
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            throw (0, errorHandler_1.createError)('User already exists', 409);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma_1.prisma.user.create({
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
        const token = (0, auth_1.generateToken)(user.id);
        res.status(201).json({
            message: 'User created successfully',
            user,
            token
        });
    }
    catch (error) {
        next(error);
    }
}));
// Login
router.post('/login', (0, validation_1.validate)(validation_1.authSchemas.login), (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await prisma_1.prisma.user.findUnique({
            where: { email },
            include: {
                profile: true
            }
        });
        console.log(user, email, password);
        if (!user || !user.password) {
            throw (0, errorHandler_1.createError)('Invalid credentials', 403);
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            throw (0, errorHandler_1.createError)('Invalid credentials', 403);
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user.id);
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
    }
    catch (error) {
        next(error);
    }
}));
// Google OAuth
router.post('/google', (0, validation_1.validate)(validation_1.authSchemas.googleLogin), (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    try {
        const { idToken, accessToken } = req.body;
        if (!idToken) {
            throw (0, errorHandler_1.createError)('Google ID token is required', 400);
        }
        // Verify Google token by calling Google's API
        const googleResponse = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${idToken}`);
        if (!googleResponse.ok) {
            throw (0, errorHandler_1.createError)('Invalid Google token', 401);
        }
        const googleUser = await googleResponse.json();
        // Check if token is valid and not expired
        if (!googleUser.email || !googleUser.email_verified) {
            throw (0, errorHandler_1.createError)('Invalid Google token or email not verified', 401);
        }
        // Check if user exists
        let user = await prisma_1.prisma.user.findUnique({
            where: { email: googleUser.email },
            include: {
                profile: true
            }
        });
        if (user) {
            // Update Google ID if not set
            if (!user.googleId) {
                user = await prisma_1.prisma.user.update({
                    where: { id: user.id },
                    data: { googleId: googleUser.sub },
                    include: {
                        profile: true
                    }
                });
            }
        }
        else {
            // Create new user
            user = await prisma_1.prisma.user.create({
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
        const token = (0, auth_1.generateToken)(user.id);
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
    }
    catch (error) {
        next(error);
    }
}));
exports.default = router;
//# sourceMappingURL=auth.js.map