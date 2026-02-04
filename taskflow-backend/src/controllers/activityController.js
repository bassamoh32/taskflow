import ActivityLog from '../models/ActivityLog.js';
import { AppError, asyncHandler } from '../utils/errorHandler.js';

export const getTaskActivityLog = asyncHandler(async (req, res) => {
  try {
    const { taskId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const activities = await ActivityLog.find({ taskId })
      .populate('userId', 'name email avatar')
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ActivityLog.countDocuments({ taskId });

    res.json({
      data: activities,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
  } catch (error) {
    throw new AppError(error.message, 500);
  }
});

export const logActivity = async (taskId, userId, action, changes = null, description = null) => {
  try {
    const activity = new ActivityLog({
      taskId,
      userId,
      action,
      changes,
      description
    });
    await activity.save();
  } catch (error) {
    console.error('Error logging activity:', error);
  }
};
