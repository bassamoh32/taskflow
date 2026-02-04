import { body } from 'express-validator';
import Task from '../models/Task.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';
import { logActivity } from './activityController.js';

/**
 * POST /api/tasks
 * Create a new task
 */
export const createTask = asyncHandler(async (req, res) => {
  const { title, description, priority, dueDate, assignee, tags } = req.body;

  if (!title) {
    throw new AppError('Task title is required', 400);
  }

  const task = await Task.create({
    title,
    description: description || '',
    priority: priority || 'medium',
    dueDate: dueDate || null,
    createdBy: req.user._id,
    assignee: assignee || null,
    tags: tags || []
  });

  // Populate references
  await task.populate(['createdBy', 'assignee']);

  // Log activity
  await logActivity(task._id, req.user._id, 'created', null, `Task created by ${req.user.name}`);

  res.status(201).json({
    success: true,
    message: 'Task created successfully',
    data: task
  });
});

/**
 * GET /api/tasks
 * Get all tasks with filtering, sorting, and pagination
 * Query params:
 *   - status: filter by status (todo, in-progress, completed)
 *   - priority: filter by priority (low, medium, high, urgent)
 *   - assignee: filter by assignee ID
 *   - search: search in title and description
 *   - sort: sort field (priority, dueDate, createdAt)
 *   - page: page number (default 1)
 *   - limit: items per page (default 10)
 */
export const getTasks = asyncHandler(async (req, res) => {
  const {
    status,
    priority,
    assignee,
    search,
    sort,
    page = 1,
    limit = 10
  } = req.query;

  // Build filter object
  const filter = {
    isDeleted: { $ne: true },
    createdBy: req.user._id // Users only see their own tasks
  };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (assignee) filter.assignee = assignee;

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Build sort object
  const sortObj = {};
  if (sort) {
    if (sort === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      // Note: MongoDB doesn't support custom sort orders directly
      // We'll use a different approach for priority sorting
    } else if (sort === 'dueDate') {
      sortObj.dueDate = 1;
    } else {
      sortObj[sort] = -1;
    }
  } else {
    sortObj.createdAt = -1; // Default: newest first
  }

  // Pagination
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * pageSize;

  // Execute query
  let query = Task.find(filter)
    .populate('createdBy', 'name email avatar')
    .populate('assignee', 'name email avatar');

  // Handle priority sorting
  if (sort === 'priority') {
    const tasks = await query.sort(sortObj);
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    tasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    const total = tasks.length;
    const paginatedTasks = tasks.slice(skip, skip + pageSize);

    return res.json({
      success: true,
      data: paginatedTasks,
      pagination: {
        total,
        page: pageNum,
        limit: pageSize,
        pages: Math.ceil(total / pageSize)
      }
    });
  }

  const total = await Task.countDocuments(filter);
  const tasks = await query
    .sort(Object.keys(sortObj).length > 0 ? sortObj : { createdAt: -1 })
    .skip(skip)
    .limit(pageSize);

  res.json({
    success: true,
    data: tasks,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      pages: Math.ceil(total / pageSize)
    }
  });
});

/**
 * GET /api/tasks/:id
 * Get a single task by ID
 */
export const getTaskById = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id)
    .populate('createdBy', 'name email avatar')
    .populate('assignee', 'name email avatar')
    .populate('comments.userId', 'name email avatar');

  if (!task || (task.isDeleted && req.user.role !== 'admin')) {
    throw new AppError('Task not found', 404);
  }

  // Check authorization - user can only see their own tasks unless admin
  if (task.createdBy._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to view this task', 403);
  }

  res.json({
    success: true,
    data: task
  });
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
export const updateTask = asyncHandler(async (req, res) => {
  const { title, description, status, priority, dueDate, assignee, tags } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check authorization
  if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to update this task', 403);
  }

  // Track changes for activity log
  const changes = new Map();
  if (title !== undefined && task.title !== title) changes.set('title', title);
  if (description !== undefined && task.description !== description) changes.set('description', description);
  if (status !== undefined && task.status !== status) changes.set('status', status);
  if (priority !== undefined && task.priority !== priority) changes.set('priority', priority);
  if (dueDate !== undefined && task.dueDate !== dueDate) changes.set('dueDate', dueDate);
  if (assignee !== undefined && task.assignee?.toString() !== assignee) changes.set('assignee', assignee);
  if (tags !== undefined && JSON.stringify(task.tags) !== JSON.stringify(tags)) changes.set('tags', JSON.stringify(tags));

  // Update fields
  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate;
  if (assignee !== undefined) task.assignee = assignee;
  if (tags !== undefined) task.tags = tags;

  await task.save();

  // Populate before sending response
  await task.populate(['createdBy', 'assignee']);

  // Log activity if changes were made
  if (changes.size > 0) {
    await logActivity(task._id, req.user._id, 'updated', changes, `Task updated by ${req.user.name}`);
  }

  res.json({
    success: true,
    message: 'Task updated successfully',
    data: task
  });
});

/**
 * DELETE /api/tasks/:id
 * Delete (soft delete) a task
 */
export const deleteTask = asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check authorization
  if (task.createdBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized to delete this task', 403);
  }

  // Soft delete
  task.isDeleted = true;
  await task.save();

  res.json({
    success: true,
    message: 'Task deleted successfully'
  });
});

/**
 * POST /api/tasks/:id/comments
 * Add a comment to a task
 */
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content || content.trim() === '') {
    throw new AppError('Comment content is required', 400);
  }

  const task = await Task.findById(req.params.id);
  if (!task) {
    throw new AppError('Task not found', 404);
  }

  // Check authorization
  if (task.createdBy.toString() !== req.user._id.toString() && 
      task.assignee?.toString() !== req.user._id.toString() && 
      req.user.role !== 'admin') {
    throw new AppError('Not authorized to comment on this task', 403);
  }

  task.comments.push({
    userId: req.user._id,
    content
  });

  await task.save();
  await task.populate('comments.userId', 'name email avatar');

  res.json({
    success: true,
    message: 'Comment added successfully',
    data: task.comments
  });
});

/**
 * DELETE /api/tasks/bulk
 * Bulk delete tasks
 */
export const bulkDeleteTasks = asyncHandler(async (req, res) => {
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new AppError('Task IDs array is required', 400);
  }

  const tasks = await Task.find({ _id: { $in: taskIds }, createdBy: req.user._id });

  if (tasks.length === 0) {
    throw new AppError('No tasks found or not authorized', 404);
  }

  // Soft delete all tasks
  await Task.updateMany(
    { _id: { $in: taskIds }, createdBy: req.user._id },
    { isDeleted: true }
  );

  // Log activity for each deleted task
  for (const task of tasks) {
    await logActivity(task._id, req.user._id, 'deleted', null, `Task deleted by ${req.user.name}`);
  }

  res.json({
    success: true,
    message: `${tasks.length} task(s) deleted successfully`,
    data: { deletedCount: tasks.length }
  });
});

/**
 * PUT /api/tasks/bulk/status
 * Bulk update task status
 */
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { taskIds, status } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new AppError('Task IDs array is required', 400);
  }

  if (!status) {
    throw new AppError('Status is required', 400);
  }

  const tasks = await Task.find({ _id: { $in: taskIds }, createdBy: req.user._id });

  if (tasks.length === 0) {
    throw new AppError('No tasks found or not authorized', 404);
  }

  // Update status for all tasks
  await Task.updateMany(
    { _id: { $in: taskIds }, createdBy: req.user._id },
    { status }
  );

  // Log activity for each updated task
  for (const task of tasks) {
    const changes = new Map();
    changes.set('status', status);
    await logActivity(task._id, req.user._id, 'status_changed', changes, `Status changed to ${status}`);
  }

  res.json({
    success: true,
    message: `${tasks.length} task(s) updated successfully`,
    data: { updatedCount: tasks.length }
  });
});

/**
 * GET /api/tasks/stats/summary
 * Get task statistics (before :id route)
 */
export const getTaskStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const stats = await Task.aggregate([
    { $match: { createdBy: userId, isDeleted: { $ne: true } } },
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        total: [
          { $count: 'count' }
        ],
        overdue: [
          {
            $match: {
              dueDate: { $lt: new Date() },
              status: { $ne: 'completed' }
            }
          },
          { $count: 'count' }
        ]
      }
    }
  ]);

  res.json({
    success: true,
    data: {
      byStatus: stats[0].byStatus,
      byPriority: stats[0].byPriority,
      total: stats[0].total[0]?.count || 0,
      overdue: stats[0].overdue[0]?.count || 0
    }
  });
});
