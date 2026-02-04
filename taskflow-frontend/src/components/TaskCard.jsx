import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import './TaskCard.css';

export const TaskCard = ({ task, onClick, onSelect, isSelected }) => {
  const statusColors = {
    'todo': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200',
    'in-progress': 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200',
    'completed': 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200',
    'archived': 'bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-100'
  };

  const priorityColors = {
    'low': 'text-gray-500 dark:text-gray-400',
    'medium': 'text-yellow-600 dark:text-yellow-400',
    'high': 'text-orange-600 dark:text-orange-400',
    'urgent': 'text-red-600 dark:text-red-400'
  };

  const handleCheckboxChange = (e) => {
    e.stopPropagation();
    onSelect && onSelect(task._id);
  };

  return (
    <div
      onClick={onClick}
      className={`border rounded-lg p-4 hover:shadow-md dark:hover:shadow-lg transition cursor-pointer flex ${
        isSelected ? 'bg-blue-50 dark:bg-blue-900 border-blue-400 dark:border-blue-500' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
      }`}
    >
      {onSelect && (
        <input
          type="checkbox"
          checked={isSelected || false}
          onChange={handleCheckboxChange}
          className="mr-3 mt-1 dark:bg-gray-700 dark:border-gray-600"
          onClick={(e) => e.stopPropagation()}
        />
      )}
      <div className="flex-1">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-900 dark:text-white flex-1 text-sm line-clamp-2">
            {task.title}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[task.status]}`}>
            {task.status}
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{task.description}</p>

        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs font-semibold uppercase ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Due: {format(new Date(task.dueDate), 'MMM dd')}
            </span>
          )}
        </div>

        {task.assignee && (
          <div className="text-xs text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-2">
            Assigned to: <span className="font-medium">{task.assignee?.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};
