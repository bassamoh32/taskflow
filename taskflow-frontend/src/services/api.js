import apiClient from './apiClient';

/**
 * Authentication service
 */
export const authService = {
  // Register new user
  register: async (name, email, password, confirmPassword) => {
    const response = await apiClient.post('/auth/register', {
      name,
      email,
      password,
      confirmPassword
    });
    return response.data;
  },

  // Login user
  login: async (email, password) => {
    const response = await apiClient.post('/auth/login', {
      email,
      password
    });
    return response.data;
  },

  // Get current user profile
  getProfile: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  // Update profile
  updateProfile: async (name, avatar) => {
    const response = await apiClient.put('/auth/profile', {
      name,
      avatar
    });
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword, newPassword, confirmPassword) => {
    const response = await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
      confirmPassword
    });
    return response.data;
  },

  // Logout (client-side only)
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
};

/**
 * Task service
 */
export const taskService = {
  // Get all tasks
  getTasks: async (filters = {}) => {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.priority) params.append('priority', filters.priority);
    if (filters.assignee) params.append('assignee', filters.assignee);
    if (filters.search) params.append('search', filters.search);
    if (filters.sort) params.append('sort', filters.sort);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const queryString = params.toString();
    const url = `/tasks${queryString ? '?' + queryString : ''}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  // Get task statistics
  getStats: async () => {
    const response = await apiClient.get('/tasks/stats/summary');
    return response.data;
  },

  // Get single task
  getTask: async (taskId) => {
    const response = await apiClient.get(`/tasks/${taskId}`);
    // Backend returns: { success: true, data: {...task}, message: '...' }
    // apiClient returns response.data which is: { success: true, data: {...task}, message: '...' }
    // So we need response.data (from axios).data (from our api response)
    return response.data.data;
  },

  // Create task
  createTask: async (taskData) => {
    const response = await apiClient.post('/tasks', taskData);
    return response.data;
  },

  // Update task
  updateTask: async (taskId, updates) => {
    const response = await apiClient.put(`/tasks/${taskId}`, updates);
    return response.data;
  },

  // Delete task
  deleteTask: async (taskId) => {
    const response = await apiClient.delete(`/tasks/${taskId}`);
    return response.data;
  },

  // Add comment
  addComment: async (taskId, content) => {
    const response = await apiClient.post(`/tasks/${taskId}/comments`, {
      content
    });
    return response.data;
  },

  // Bulk delete tasks
  bulkDeleteTasks: async (taskIds) => {
    const response = await apiClient.delete('/tasks/bulk', {
      data: { taskIds }
    });
    return response.data;
  },

  // Bulk update task status
  bulkUpdateStatus: async (taskIds, status) => {
    const response = await apiClient.put('/tasks/bulk/status', {
      taskIds,
      status
    });
    return response.data;
  }
};

/**
 * Admin service
 */
export const adminService = {
  // Get all users
  getUsers: async (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.search) params.append('search', filters.search);
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiClient.get(`/admin/users?${params.toString()}`);
    return response.data;
  },

  // Update user role
  updateUserRole: async (userId, role) => {
    const response = await apiClient.put(`/admin/users/${userId}/role`, {
      role
    });
    return response.data;
  },

  // Update user status
  updateUserStatus: async (userId, isActive) => {
    const response = await apiClient.put(`/admin/users/${userId}/status`, {
      isActive
    });
    return response.data;
  },

  // Get system statistics
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  }
};

/**
 * Activity service
 */
export const activityService = {
  // Get task activity log
  getTaskActivity: async (taskId, limit = 50, skip = 0) => {
    const response = await apiClient.get(`/tasks/${taskId}/activity?limit=${limit}&skip=${skip}`);
    return response.data;
  }
};
