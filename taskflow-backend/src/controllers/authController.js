import { body } from 'express-validator';
import User from '../models/User.js';
import { hashPassword, comparePasswords, generateToken } from '../utils/auth.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

/**
 * POST /api/auth/register
 * Register a new user
 */
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword } = req.body;

  // Validate input
  if (!name || !email || !password || !confirmPassword) {
    throw new AppError('Please provide all required fields', 400);
  }

  if (password !== confirmPassword) {
    throw new AppError('Passwords do not match', 400);
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('Email already registered', 409);
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashedPassword
  });

  // Generate token
  const token = generateToken(user._id);

  // Return response (without password)
  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

/**
 * POST /api/auth/login
 * Login user
 */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError('Please provide email and password', 400);
  }

  // Find user and select password
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new AppError('Invalid credentials', 401);
  }

  // Compare passwords
  const isPasswordValid = await comparePasswords(password, user.password);
  if (!isPasswordValid) {
    throw new AppError('Invalid credentials', 401);
  }

  // Check if user is active
  if (!user.isActive) {
    throw new AppError('User account is inactive', 403);
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  // Generate token
  const token = generateToken(user._id);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    }
  });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    success: true,
    data: user
  });
});

/**
 * PUT /api/auth/profile
 * Update user profile
 */
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, avatar } = req.body;
  const updateData = {};

  if (name) updateData.name = name;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true
  });

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user
  });
});

/**
 * PUT /api/auth/change-password
 * Change user password
 */
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new AppError('Please provide all password fields', 400);
  }

  if (newPassword !== confirmPassword) {
    throw new AppError('New passwords do not match', 400);
  }

  if (newPassword.length < 8) {
    throw new AppError('Password must be at least 8 characters', 400);
  }

  // Get user with password field
  const user = await User.findById(req.user._id).select('+password');

  // Verify current password
  const isValid = await comparePasswords(currentPassword, user.password);
  if (!isValid) {
    throw new AppError('Current password is incorrect', 401);
  }

  // Hash and update new password
  user.password = await hashPassword(newPassword);
  await user.save();

  res.json({
    success: true,
    message: 'Password changed successfully'
  });
});
