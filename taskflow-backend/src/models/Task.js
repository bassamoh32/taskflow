import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a task title'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
      type: String,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'completed', 'archived'],
      default: 'todo'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    dueDate: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    tags: {
      type: [String],
      default: []
    },
    attachment: {
      filename: String,
      url: String,
      uploadedAt: Date
    },
    comments: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        content: String,
        createdAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      select: false
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Index for common queries
taskSchema.index({ createdBy: 1, status: 1 });
taskSchema.index({ assignee: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ createdAt: -1 });

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function() {
  if (!this.dueDate) return null;
  const now = new Date();
  const daysLeft = Math.ceil((this.dueDate - now) / (1000 * 60 * 60 * 24));
  return daysLeft;
});

export default mongoose.model('Task', taskSchema);
