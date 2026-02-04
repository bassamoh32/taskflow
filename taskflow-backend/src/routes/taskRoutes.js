import express from 'express';
import { body } from 'express-validator';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  addComment,
  getTaskStats,
  bulkDeleteTasks,
  bulkUpdateStatus
} from '../controllers/taskController.js';
import { validateRequest } from '../middleware/validationMiddleware.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// All task routes require authentication
router.use(authenticate);

/**
 * GET /api/tasks/stats/summary
 * Get task statistics
 */
router.get('/stats/summary', getTaskStats);

/**
 * DELETE /api/tasks/bulk
 * Bulk delete tasks
 * Body: { taskIds: [id1, id2, ...] }
 */
router.delete('/bulk', bulkDeleteTasks);

/**
 * PUT /api/tasks/bulk/status
 * Bulk update task status
 * Body: { taskIds: [id1, id2, ...], status: 'completed' }
 */
router.put('/bulk/status', bulkUpdateStatus);

/**
 * POST /api/tasks
 * Create a new task
 * Body: { title, description?, priority?, dueDate?, assignee?, tags? }
 */
router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 2000 })
      .withMessage('Description cannot exceed 2000 characters'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority'),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Invalid date format')
  ],
  validateRequest,
  createTask
);

/**
 * GET /api/tasks
 * Get tasks with filtering, sorting, pagination
 * Query: status?, priority?, assignee?, search?, sort?, page?, limit?
 */
router.get('/', getTasks);

/**
 * GET /api/tasks/:id
 * Get single task
 */
router.get('/:id', getTaskById);

/**
 * PUT /api/tasks/:id
 * Update task
 * Body: { title?, description?, status?, priority?, dueDate?, assignee?, tags? }
 */
router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .isLength({ max: 200 })
      .withMessage('Title cannot exceed 200 characters'),
    body('status')
      .optional()
      .isIn(['todo', 'in-progress', 'completed', 'archived'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high', 'urgent'])
      .withMessage('Invalid priority')
  ],
  validateRequest,
  updateTask
);

/**
 * DELETE /api/tasks/:id
 * Delete task (soft delete)
 */
router.delete('/:id', deleteTask);

/**
 * POST /api/tasks/:id/comments
 * Add comment to task
 * Body: { content }
 */
router.post(
  '/:id/comments',
  [
    body('content')
      .trim()
      .notEmpty()
      .withMessage('Comment content is required')
  ],
  validateRequest,
  addComment
);

export default router;
