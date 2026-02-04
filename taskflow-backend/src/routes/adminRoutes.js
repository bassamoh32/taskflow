import express from 'express';
import { body } from 'express-validator';
import {
  getAllUsers,
  updateUserRole,
  updateUserStatus,
  getSystemStats
} from '../controllers/adminController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authenticate, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticate, authorize('admin'));

/**
 * GET /api/admin/users
 * Get all users with pagination
 * Query: page?, limit?, search?
 */
router.get('/users', getAllUsers);

/**
 * PUT /api/admin/users/:id/role
 * Update user role
 * Body: { role: 'user' | 'admin' }
 */
router.put(
  '/users/:id/role',
  [
    body('role')
      .isIn(['user', 'admin'])
      .withMessage('Invalid role')
  ],
  validateRequest,
  updateUserRole
);

/**
 * PUT /api/admin/users/:id/status
 * Activate/deactivate user
 * Body: { isActive: boolean }
 */
router.put(
  '/users/:id/status',
  [
    body('isActive')
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  validateRequest,
  updateUserStatus
);

/**
 * GET /api/admin/stats
 * Get system statistics
 */
router.get('/stats', getSystemStats);

export default router;
