import axios from 'axios';
import toast from 'react-hot-toast';


const API = axios.create({
  baseURL: 'https://ai-task-manager-backend-production-4622.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, 
});

/**
 * Fetch all tasks from backend
 * @param {string} [status] 
 */
export const fetchTasks = async (status) => {
  try {
    const params = status ? { status } : {};
    const response = await API.get('/tasks', { params });
    return response.data?.data || [];
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to fetch tasks';
    toast.error(`Error: ${message}`);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData { title, description, status, dueDate }
 */
export const createTask = async (taskData) => {
  try {
    const response = await API.post('/tasks', taskData);
    toast.success('Task created successfully');
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to create task';
    toast.error(`Error: ${message}`);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string} id Task ID
 * @param {Object} taskData Updated fields
 */
export const updateTask = async (id, taskData) => {
  try {
    const response = await API.put(`/tasks/${id}`, taskData);
    toast.success('Task updated successfully');
    return response.data?.data;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update task';
    toast.error(`Error: ${message}`);
    throw error;
  }
};

/**
 * Delete a task by ID
 * @param {string} id Task ID
 */
export const deleteTask = async (id) => {
  try {
    await API.delete(`/tasks/${id}`);
    toast.success('Task deleted');
    return true;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to delete task';
    toast.error(`Error: ${message}`);
    throw error;
  }
};

/**
 * Generate AI Execution Plan using Groq
 * @param {string} description Task description
 */
export const generateAiPlan = async (description) => {
  try {
    const response = await API.post('/ai/plan-task', { description });
    if (!response.data?.success) {
      throw new Error(response.data?.message || 'Failed to generate plan');
    }
    toast.success('AI Plan generated successfully! ✨');
    return response.data.plan;
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'AI planning failed';
    toast.error(`AI Error: ${message}`);
    throw error;
  }
};

export default API;
