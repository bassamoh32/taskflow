import express from 'express';
import { getTaskActivityLog } from '../controllers/activityController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get activity log for a task
router.get('/tasks/:taskId/activity', authenticate, getTaskActivityLog);

export default router;
