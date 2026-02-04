import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import { TaskCard } from '../components/TaskCard';
import { useNavigate } from 'react-router-dom';
import './TaskListPage.css';

export const TaskListPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    search: '',
    page: 1,
    limit: 12
  });
  const [pagination, setPagination] = useState({});
  const navigate = useNavigate();

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await taskService.getTasks(filters);
      console.log('Tasks response:', response);
      setTasks(response.data || []);
      setPagination(response.pagination || {});
      setError('');
    } catch (err) {
      console.error('Error loading tasks:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load tasks';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: name === 'limit' ? parseInt(value) : value,
      page: 1
    }));
  };

  const handleSearchChange = (e) => {
    setFilters((prev) => ({
      ...prev,
      search: e.target.value,
      page: 1
    }));
  };

  const handleSelectTask = (taskId) => {
    const newSelected = new Set(selectedTasks);
    if (newSelected.has(taskId)) {
      newSelected.delete(taskId);
    } else {
      newSelected.add(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTasks.size === tasks.length) {
      setSelectedTasks(new Set());
    } else {
      setSelectedTasks(new Set(tasks.map(t => t._id)));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTasks.size === 0) {
      alert('Please select tasks to delete');
      return;
    }

    if (!window.confirm(`Delete ${selectedTasks.size} task(s)?`)) return;

    try {
      await taskService.bulkDeleteTasks(Array.from(selectedTasks));
      setSelectedTasks(new Set());
      fetchTasks();
    } catch (err) {
      alert('Failed to delete tasks');
    }
  };

  const handleBulkStatus = async (status) => {
    if (selectedTasks.size === 0) {
      alert('Please select tasks');
      return;
    }

    try {
      console.log('Updating status for tasks:', Array.from(selectedTasks));
      await taskService.bulkUpdateStatus(Array.from(selectedTasks), status);
      console.log('Status update successful');
      setSelectedTasks(new Set());
      console.log('Clearing selection and fetching tasks...');
      await fetchTasks();
      console.log('Tasks fetched successfully');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update tasks: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
        <button
          onClick={() => navigate('/tasks/new')}
          className="bg-blue-600 dark:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 dark:hover:bg-blue-600 transition"
        >
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg dark:border dark:border-gray-700 p-6 mb-8 transition-colors">
        {/* Bulk Actions Toolbar */}
        {selectedTasks.size > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 mb-4 rounded-lg flex justify-between items-center transition-colors">
            <span className="font-medium text-blue-900 dark:text-blue-100">
              {selectedTasks.size} task(s) selected
            </span>
            <div className="space-x-2">
              <button
                onClick={() => handleBulkStatus('todo')}
                className="px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
              >
                To Do
              </button>
              <button
                onClick={() => handleBulkStatus('in-progress')}
                className="px-3 py-1 bg-blue-200 text-blue-800 rounded text-sm hover:bg-blue-300"
              >
                In Progress
              </button>
              <button
                onClick={() => handleBulkStatus('completed')}
                className="px-3 py-1 bg-green-200 text-green-800 rounded text-sm hover:bg-green-300"
              >
                Completed
              </button>
              <button
                onClick={handleBulkDelete}
                className="px-3 py-1 bg-red-200 text-red-800 rounded text-sm hover:bg-red-300"
              >
                Delete
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Select All Checkbox */}
          {tasks.length > 0 && (
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedTasks.size === tasks.length && tasks.length > 0}
                onChange={handleSelectAll}
                className="w-5 h-5 cursor-pointer"
                title="Select all tasks on this page"
              />
              <label className="ml-2 text-sm font-medium text-gray-700">
                All
              </label>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search
            </label>
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleSearchChange}
              placeholder="Search tasks..."
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            >
              <option value="">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Priority
            </label>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Limit
            </label>
            <select
              name="limit"
              value={filters.limit}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition"
            >
              <option value="6">6 items</option>
              <option value="12">12 items</option>
              <option value="24">24 items</option>
              <option value="50">50 items</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tasks Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-200 px-6 py-4 rounded-lg transition-colors">
          {error}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 mb-4">No tasks found</p>
          <button
            onClick={() => navigate('/tasks/new')}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline"
          >
            Create your first task
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={() => navigate(`/tasks/${task._id}`)}
                onSelect={handleSelectTask}
                isSelected={selectedTasks.has(task._id)}
              />
            ))}
          </div>

          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center items-center space-x-4">
              <button
                onClick={() => setFilters((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1)
                }))}
                disabled={filters.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                Previous
              </button>
              <span className="text-gray-600 dark:text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setFilters((prev) => ({
                  ...prev,
                  page: Math.min(pagination.pages, prev.page + 1)
                }))}
                disabled={filters.page === pagination.pages}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600 transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
