import express from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
} from '../controllers/authController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 * Body: { name, email, password, confirmPassword }
 */
router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required')
      .isLength({ max: 100 })
      .withMessage('Name cannot exceed 100 characters'),
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters'),
    body('confirmPassword')
      .custom((value, { req }) => value === req.body.password)
      .withMessage('Passwords must match')
  ],
  validateRequest,
  register
);

/**
 * POST /api/auth/login
 * Login user
 * Body: { email, password }
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .isEmail()
      .withMessage('Please provide a valid email'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  validateRequest,
  login
);

/**
 * GET /api/auth/me
 * Get current user profile (protected)
 */
router.get('/me', authenticate, getProfile);

/**
 * PUT /api/auth/profile
 * Update user profile (protected)
 */
router.put('/profile', authenticate, updateProfile);

/**
 * PUT /api/auth/change-password
 * Change password (protected)
 */
router.put('/change-password', authenticate, changePassword);

export default router;
