import React, { useState, useEffect } from 'react';
import { taskService } from '../services/api';
import './DashboardPage.css';

export const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await taskService.getStats();
        setStats(response.data);
      } catch (err) {
        console.error('Failed to load stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const StatCard = ({ label, value, color }) => {
    const bgColorMap = {
      blue: 'bg-blue-50 dark:bg-blue-900',
      red: 'bg-red-50 dark:bg-red-900',
      yellow: 'bg-yellow-50 dark:bg-yellow-900',
      green: 'bg-green-50 dark:bg-green-900',
      gray: 'bg-gray-50 dark:bg-gray-800'
    };
    const borderColorMap = {
      blue: 'border-blue-200 dark:border-blue-700',
      red: 'border-red-200 dark:border-red-700',
      yellow: 'border-yellow-200 dark:border-yellow-700',
      green: 'border-green-200 dark:border-green-700',
      gray: 'border-gray-200 dark:border-gray-700'
    };
    const textColorMap = {
      blue: 'text-blue-600 dark:text-blue-300',
      red: 'text-red-600 dark:text-red-300',
      yellow: 'text-yellow-600 dark:text-yellow-300',
      green: 'text-green-600 dark:text-green-300',
      gray: 'text-gray-600 dark:text-gray-300'
    };
    const valueColorMap = {
      blue: 'text-blue-900 dark:text-blue-100',
      red: 'text-red-900 dark:text-red-100',
      yellow: 'text-yellow-900 dark:text-yellow-100',
      green: 'text-green-900 dark:text-green-100',
      gray: 'text-gray-900 dark:text-gray-100'
    };

    return (
      <div className={`${bgColorMap[color]} border ${borderColorMap[color]} rounded-lg p-6 transition-colors`}>
        <p className={`${textColorMap[color]} text-sm font-semibold mb-2`}>{label}</p>
        <p className={`${valueColorMap[color]} text-3xl font-bold`}>{value}</p>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {/* Statistics Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard label="Total Tasks" value={stats.total} color="blue" />
          <StatCard label="Overdue" value={stats.overdue} color="red" />

          {stats.byStatus && stats.byStatus.length > 0 && (
            <>
              {stats.byStatus.map((item) => {
                const statusLabels = {
                  'todo': 'To Do',
                  'in-progress': 'In Progress',
                  'completed': 'Completed'
                };
                const colorMap = {
                  'todo': 'gray',
                  'in-progress': 'yellow',
                  'completed': 'green'
                };
                return (
                  <StatCard
                    key={item._id}
                    label={statusLabels[item._id] || item._id}
                    value={item.count}
                    color={colorMap[item._id] || 'gray'}
                  />
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Welcome Message */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900 border border-blue-200 dark:border-blue-700 rounded-lg p-8 transition-colors">
        <h2 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-3">Welcome to TaskFlow!</h2>
        <p className="text-blue-800 dark:text-blue-200 mb-4">
          Manage your tasks efficiently with TaskFlow. Create, organize, and track tasks with
          priorities, due dates, and team assignments.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📋 Organize Tasks</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Create and organize tasks with priorities, due dates, and custom tags.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">👥 Team Collaboration</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Assign tasks to team members and track progress in real-time.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📊 Track Progress</h3>
            <p className="text-blue-700 dark:text-blue-300 text-sm">
              Monitor task completion with detailed statistics and filters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
