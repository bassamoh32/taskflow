import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

export const HomePage = () => {
  return (
    <div className="bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 transition-colors">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          TaskFlow
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
          A modern task management platform for individuals and teams. Stay organized, boost
          productivity, and achieve your goals.
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            to="/login"
            className="px-8 py-3 bg-blue-600 dark:bg-blue-700 text-white rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-8 py-3 border-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-700 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center mb-12">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-8 dark:border dark:border-gray-700">
            <div className="text-4xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Organize Tasks</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Create tasks with priorities, due dates, descriptions, and custom tags to keep
              everything organized.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-8 dark:border dark:border-gray-700">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Collaborate</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Assign tasks to team members, add comments, and track progress together in real-time.
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow dark:shadow-lg p-8 dark:border dark:border-gray-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Track Progress</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Get detailed statistics and analytics to monitor task completion and team productivity.
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-blue-600 dark:bg-blue-800 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of users who are already using TaskFlow to manage their projects
            efficiently.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-3 bg-white dark:bg-gray-200 text-blue-600 dark:text-blue-800 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-300 transition"
          >
            Create Free Account
          </Link>
        </div>
      </div>
    </div>
  );
};
