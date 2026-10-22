import axios from 'axios';
import toast from 'react-hot-toast';

/* ── User Session / Header Management ────────────────────────────────── */

const getUserId = () => {
  let userId = localStorage.getItem('app_user_id');
  localStorage.getItem('app_user_id')
  if (!userId) {
    userId = `user_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    localStorage.setItem('app_user_id', userId);
  }
  return userId;
};


const FALLBACK_BASE_URL =
  'https://ai-task-manager-backend-production-4622.up.railway.app/api';

const ENV_BASE_URL = import.meta.env?.VITE_API_URL?.trim();

export const API_BASE_URL = (
  ENV_BASE_URL || (import.meta.env?.DEV ? '/api' : FALLBACK_BASE_URL)
).replace(/\/+$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

API.interceptors.request.use((config) => {
  config.headers['x-user-id'] = getUserId();
  return config;
});



function normaliseError(error) {
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return 'The request timed out. Please try again.';
  }

  if (!error?.response) {
    return 'Cannot reach the server. Check your connection and try again.';
  }

  const payload = error.response.data;
  const message =
    payload?.message ||
    payload?.error?.message ||
    payload?.error ||
    (Array.isArray(payload?.errors) ? payload.errors[0]?.msg : null);

  if (typeof message === 'string' && message.trim()) return message.trim();

  if (error.response.status === 404) return 'That resource could not be found.';
  if (error.response.status === 429) return 'Too many requests. Please slow down.';
  if (error.response.status >= 500) return 'The server had a problem. Please try again.';

  return 'Something went wrong. Please try again.';
}

API.interceptors.response.use(
  (response) => response,
  (error) => {
    error.userMessage = normaliseError(error);
    return Promise.reject(error);
  }
);

function notify(error, fallback = 'Something went wrong.') {
  toast.error(error?.userMessage || fallback);
}

/* ── Data Helpers ─────────────────────────────────────────────────────── */

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function normaliseTask(task) {
  if (!task || typeof task !== 'object') return null;

  return {
    _id: task._id || task.id,
    title: typeof task.title === 'string' ? task.title : 'Untitled task',
    description: typeof task.description === 'string' ? task.description : '',
    status: ['pending', 'in-progress', 'completed'].includes(task.status)
      ? task.status
      : 'pending',
    priority: ['high', 'medium', 'low'].includes(task.priority) ? task.priority : null,
    dueDate: task.dueDate || null,
    createdAt: task.createdAt || null,
    updatedAt: task.updatedAt || null,
  };
}

/* ── Task API Methods ─────────────────────────────────────────────────── */

export async function fetchTasks(status, { silent = false } = {}) {
  try {
    const response = await API.get('/tasks', { params: status ? { status } : {} });
    const list = unwrap(response);
    return Array.isArray(list) ? list.map(normaliseTask).filter(Boolean) : [];
  } catch (error) {
    if (!silent) notify(error, 'Could not load your tasks.');
    throw error;
  }
}

export async function createTask(taskData, { silent = false } = {}) {
  try {
    const response = await API.post('/tasks', taskData);
    if (!silent) toast.success('Task created');
    return normaliseTask(unwrap(response) || taskData);
  } catch (error) {
    if (!silent) notify(error, 'Could not create the task.');
    throw error;
  }
}

export async function createTasks(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) return { created: [], failed: 0 };

  const results = await Promise.allSettled(
    tasks.map((task) => API.post('/tasks', task))
  );

  const created = [];
  let failed = 0;

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      const normalised = normaliseTask(unwrap(result.value));
      if (normalised) created.push(normalised);
    } else {
      failed += 1;
    }
  });

  if (created.length === 0) {
    throw new Error('No tasks could be added. Please try again.');
  }

  return { created, failed };
}

export async function updateTask(id, taskData, { silent = false } = {}) {
  try {
    const response = await API.put(`/tasks/${id}`, taskData);
    if (!silent) toast.success('Task updated');
    return normaliseTask(unwrap(response) || { ...taskData, _id: id });
  } catch (error) {
    if (!silent) notify(error, 'Could not update the task.');
    throw error;
  }
}

export async function updateTaskStatus(id, status, { silent = true } = {}) {
  try {
    const response = await API.put(`/tasks/${id}`, { status });
    if (!silent) toast.success('Status updated');
    return normaliseTask(unwrap(response) || { _id: id, status });
  } catch (error) {
    if (!silent) notify(error, 'Could not move the task.');
    throw error;
  }
}

export async function deleteTask(id, { silent = false } = {}) {
  try {
    await API.delete(`/tasks/${id}`);
    if (!silent) toast.success('Task deleted');
    return true;
  } catch (error) {
    if (!silent) notify(error, 'Could not delete the task.');
    throw error;
  }
}

/* ── AI Planner API ───────────────────────────────────────────────────── */

export async function generateAiPlan(description) {
  try {
    const response = await API.post('/ai/plan-task', { description });

    if (response.data?.success === false) {
      throw new Error(response.data?.message || 'Failed to generate a plan.');
    }

    const plan = response?.data?.plan || response?.data?.data?.plan || response?.data;

    if (!plan || !Array.isArray(plan.steps)) {
      throw new Error('The AI returned an empty plan. Try rephrasing your goal.');
    }

    return {
      summary: plan.summary || 'Your execution plan',
      priority: ['high', 'medium', 'low'].includes(String(plan.priority).toLowerCase())
        ? String(plan.priority).toLowerCase()
        : 'medium',
      estimatedHours: Number(plan.estimatedHours) || null,
      steps: plan.steps.map((step) =>
        typeof step === 'string' ? step.trim() : String(step.title || step.step || '').trim()
      ).filter(Boolean),
    };
  } catch (error) {
    notify(error, 'AI planning failed.');
    throw error;
  }
}

export default API;