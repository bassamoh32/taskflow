import express from 'express';
import { authenticate } from '../middleware/authMiddleware.js';
import {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/categories
 * Create a new category
 */
router.post('/', createCategory);

/**
 * GET /api/categories
 * Get all categories for the current user
 */
router.get('/', getCategories);

/**
 * GET /api/categories/:id
 * Get a single category
 */
router.get('/:id', getCategory);

/**
 * PUT /api/categories/:id
 * Update a category
 */
router.put('/:id', updateCategory);

/**
 * DELETE /api/categories/:id
 * Delete a category
 */
router.delete('/:id', deleteCategory);

export default router;
