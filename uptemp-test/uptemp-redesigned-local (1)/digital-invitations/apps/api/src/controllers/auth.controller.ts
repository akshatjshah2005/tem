import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/database';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  password: z.string().min(8).regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    'Password must contain at least one uppercase, one lowercase, and one number'
  )
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

// Generate JWT token
const generateToken = (user: { id: string; email: string; role: string }) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  );
};

// Register
export const register = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = registerSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    throw new AppError(validationResult.error.issues[0].message, 400);
  }

  const { name, email, mobile, password } = validationResult.data;

  // Check if user already exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { email },
        { mobile }
      ]
    }
  });

  if (existingUser) {
    throw new AppError('User with this email or mobile already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 12);

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      mobile,
      passwordHash
    }
  });

  // Generate token
  const token = generateToken(user);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    }
  });
});

// Login
export const login = asyncHandler(async (req: Request, res: Response) => {
  const validationResult = loginSchema.safeParse(req.body);
  
  if (!validationResult.success) {
    throw new AppError('Invalid email or password', 401);
  }

  const { email, password } = validationResult.data;

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account is disabled', 403);
  }

  // Check password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', 401);
  }

  // Generate token
  const token = generateToken(user);

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role
      },
      token
    }
  });
});

// Get current user
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: (req as any).user.id },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true,
      avatarUrl: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

// Update profile
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const { name, mobile } = req.body;

  const user = await prisma.user.update({
    where: { id: (req as any).user.id },
    data: {
      ...(name && { name }),
      ...(mobile && { mobile })
    },
    select: {
      id: true,
      name: true,
      email: true,
      mobile: true,
      role: true
    }
  });

  res.json({
    success: true,
    data: user
  });
});

// Change password
export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;

  const user = await prisma.user.findUnique({
    where: { id: (req as any).user.id }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);

  if (!isPasswordValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash }
  });

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
