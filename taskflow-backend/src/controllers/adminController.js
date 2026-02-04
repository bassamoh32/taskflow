import User from '../models/User.js';
import Task from '../models/Task.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

/**
 * GET /api/admin/users
 * Get all users (admin only)
 */
export const getAllUsers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * pageSize;

  const total = await User.countDocuments(filter);
  const users = await User.find(filter)
    .select('-password')
    .skip(skip)
    .limit(pageSize)
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users,
    pagination: {
      total,
      page: pageNum,
      limit: pageSize,
      pages: Math.ceil(total / pageSize)
    }
  });
});

/**
 * PUT /api/admin/users/:id/role
 * Update user role (admin only)
 */
export const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;

  if (!role || !['user', 'admin'].includes(role)) {
    throw new AppError('Invalid role', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User role updated successfully',
    data: user
  });
});

/**
 * PUT /api/admin/users/:id/status
 * Activate/deactivate user (admin only)
 */
export const updateUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;

  if (typeof isActive !== 'boolean') {
    throw new AppError('Invalid isActive value', 400);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  );

  if (!user) {
    throw new AppError('User not found', 404);
  }

  res.json({
    success: true,
    message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
    data: user
  });
});

/**
 * GET /api/admin/stats
 * Get system statistics (admin only)
 */
export const getSystemStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalTasks = await Task.countDocuments({ isDeleted: { $ne: true } });
  const completedTasks = await Task.countDocuments({
    status: 'completed',
    isDeleted: { $ne: true }
  });
  const activeTasks = await Task.countDocuments({
    status: { $in: ['todo', 'in-progress'] },
    isDeleted: { $ne: true }
  });

  // Get task distribution by priority
  const tasksByPriority = await Task.aggregate([
    { $match: { isDeleted: { $ne: true } } },
    { $group: { _id: '$priority', count: { $sum: 1 } } }
  ]);

  // Get recent activity
  const recentTasks = await Task.find({ isDeleted: { $ne: true } })
    .select('title status createdAt')
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('createdBy', 'name email');

  res.json({
    success: true,
    data: {
      users: {
        total: totalUsers
      },
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        active: activeTasks,
        byPriority: tasksByPriority
      },
      recent: recentTasks
    }
  });
});
