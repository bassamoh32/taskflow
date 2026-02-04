import React, { useState, useEffect } from 'react';
import { activityService } from '../services/api';
import { format } from 'date-fns';

export const ActivityLog = ({ taskId }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await activityService.getTaskActivity(taskId);
        setActivities(data.data || []);
      } catch (err) {
        setError('Failed to load activity log');
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [taskId]);

  const getActionDescription = (activity) => {
    switch (activity.action) {
      case 'created':
        return `Created by ${activity.userId?.name}`;
      case 'updated':
        const changes = [];
        if (activity.changes && typeof activity.changes === 'object') {
          Object.entries(activity.changes).forEach(([key, value]) => {
            changes.push(`${key} changed to "${value}"`);
          });
        }
        return `Updated by ${activity.userId?.name}: ${changes.join(', ')}`;
      case 'status_changed':
        const status = activity.changes?.status || activity.description;
        return `Status changed to ${status} by ${activity.userId?.name}`;
      case 'commented':
        return `Commented by ${activity.userId?.name}`;
      default:
        return activity.description || activity.action;
    }
  };

  if (loading) {
    return <div className="text-center py-4">Loading activity...</div>;
  }

  if (error) {
    return <div className="text-red-600 py-4">{error}</div>;
  }

  if (activities.length === 0) {
    return <div className="text-gray-500 py-4">No activity yet</div>;
  }

  return (
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={activity._id || index} className="flex items-start space-x-4 border-l-2 border-blue-500 pl-4 pb-4">
          <div className="flex-shrink-0">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-blue-100">
              {activity.action === 'created' && <span className="text-blue-600">+</span>}
              {activity.action === 'updated' && <span className="text-blue-600">✎</span>}
              {activity.action === 'commented' && <span className="text-blue-600">💬</span>}
              {activity.action === 'status_changed' && <span className="text-blue-600">✓</span>}
            </div>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">
              {getActionDescription(activity)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {format(new Date(activity.timestamp), 'PPp')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
