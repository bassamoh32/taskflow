import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { taskService } from '../services/api';
import { ActivityLog } from '../components/ActivityLog';
import './TaskDetailPage.css';
import { format } from 'date-fns';

export const TaskDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const task = await taskService.getTask(id);
        console.log('Task loaded:', task);
        if (!task || !task._id) {
          setError('Task data is invalid');
          setLoading(false);
          return;
        }
        setTask(task);
      } catch (err) {
        console.error('Error loading task:', err);
        setError(err.response?.data?.message || 'Failed to load task details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchTask();
    }
  }, [id]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setSubmittingComment(true);
    try {
      const response = await taskService.addComment(id, comment);
      setTask((prev) => ({
        ...prev,
        comments: response.data
      }));
      setComment('');
    } catch (err) {
      alert('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
          {error || 'Task not found'}
        </div>
        <button
          onClick={() => navigate('/tasks')}
          className="text-blue-600 font-medium hover:underline"
        >
          Back to Tasks
        </button>
      </div>
    );
  }

  const statusColors = {
    'todo': 'bg-gray-100 text-gray-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    'completed': 'bg-green-100 text-green-800',
    'archived': 'bg-gray-300 text-gray-800'
  };

  const priorityColors = {
    'low': 'text-gray-500',
    'medium': 'text-yellow-600',
    'high': 'text-orange-600',
    'urgent': 'text-red-600'
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/tasks')}
        className="text-blue-600 dark:text-blue-400 font-medium hover:underline mb-6 transition-colors"
      >
        ← Back to Tasks
      </button>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl dark:border dark:border-gray-700 p-8 mb-8 transition-colors">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">{task.title}</h1>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[task.status]}`}>
                {task.status}
              </span>
              <span className={`text-sm font-semibold uppercase ${priorityColors[task.priority]}`}>
                {task.priority}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(`/tasks/${id}/edit`)}
            className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            Edit
          </button>
        </div>

        <hr className="my-6 dark:border-gray-700" />

        <div className="grid grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Created By</h3>
            <p className="text-gray-900 dark:text-white">{task.createdBy?.name}</p>
          </div>
          {task.assignee && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Assigned To</h3>
              <p className="text-gray-900 dark:text-white">{task.assignee?.name}</p>
            </div>
          )}
          {task.dueDate && (
            <div>
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Due Date</h3>
              <p className="text-gray-900 dark:text-white">{format(new Date(task.dueDate), 'PPpp')}</p>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">Created</h3>
            <p className="text-gray-900 dark:text-white">{format(new Date(task.createdAt), 'PPpp')}</p>
          </div>
        </div>

        {task.description && (
          <>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Description</h3>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap mb-8">{task.description}</p>
          </>
        )}

        {task.tags && task.tags.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {task.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-3 py-1 rounded-full text-sm transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comments Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl dark:border dark:border-gray-700 p-8 mb-8 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Activity Log</h2>
        <ActivityLog taskId={id} />
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Comments</h2>

        {/* Add Comment Form */}
        <form onSubmit={handleAddComment} className="mb-8">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 mb-3 resize-none"
            rows="3"
          />
          <button
            type="submit"
            disabled={!comment.trim() || submittingComment}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submittingComment ? 'Posting...' : 'Post Comment'}
          </button>
        </form>

        {/* Comments List */}
        {task.comments && task.comments.length > 0 ? (
          <div className="space-y-4">
            {task.comments.map((comment, index) => (
              <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold text-gray-900">
                    {comment.userId?.name || 'Unknown User'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {format(new Date(comment.createdAt), 'PPpp')}
                  </span>
                </div>
                <p className="text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No comments yet</p>
        )}
      </div>
    </div>
  );
};
