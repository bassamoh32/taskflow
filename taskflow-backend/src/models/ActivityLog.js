import mongoose from 'mongoose';

const ActivityLogSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    enum: ['created', 'updated', 'status_changed', 'commented', 'deleted'],
    required: true
  },
  changes: {
    type: Map,
    of: String
  },
  description: String,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false
});

ActivityLogSchema.index({ taskId: 1, timestamp: -1 });
ActivityLogSchema.index({ userId: 1 });

export default mongoose.model('ActivityLog', ActivityLogSchema);
