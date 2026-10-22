import axios from 'axios';
import toast from 'react-hot-toast';

const FALLBACK_BASE_URL =
  'https://ai-task-manager-backend-production-4622.up.railway.app/api';

/**
 * Development uses the Vite proxy (`/api`) so the app runs on any port without
 * tripping the API's CORS allowlist. Production uses VITE_API_URL when set.
 */
const ENV_BASE_URL = import.meta.env?.VITE_API_URL?.trim();

export const API_BASE_URL = (
  ENV_BASE_URL || (import.meta.env?.DEV ? '/api' : FALLBACK_BASE_URL)
).replace(/\/+$/, '');

const API = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

/* ── Error normalisation ──────────────────────────────────────────────── */

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

/* ── Response shape helpers (defensive against backend drift) ─────────── */

function unwrap(response) {
  return response?.data?.data ?? response?.data ?? null;
}

function extractList(response) {
  const data = unwrap(response);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.tasks)) return data.tasks;
  if (Array.isArray(response?.data?.tasks)) return response.data.tasks;
  return [];
}

function normaliseTask(task) {
  if (!task || typeof task !== 'object') return null;
  const fallbackId =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `task-${Date.now()}-${Math.floor(Math.random() * 1e9)}`;

  return {
    _id: task._id || task.id || fallbackId,
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

/* ── Tasks ────────────────────────────────────────────────────────────── */

export async function fetchTasks(status, { silent = false } = {}) {
  try {
    const response = await API.get('/tasks', { params: status ? { status } : {} });
    return extractList(response).map(normaliseTask).filter(Boolean);
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

/**
 * Creates many tasks in parallel (the AI planner uses this).
 * A single request for the whole batch would be better — this keeps the
 * existing API contract but removes the N-round-trip latency and N toasts.
 */
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

/** Status-only mutation, used by drag & drop and quick actions. */
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

/* ── AI planner ───────────────────────────────────────────────────────── */

function normalisePlanSteps(steps) {
  if (!Array.isArray(steps)) return [];
  return steps
    .map((step) => {
      if (typeof step === 'string') return step.trim();
      if (step && typeof step === 'object') {
        return String(step.title || step.step || step.description || '').trim();
      }
      return '';
    })
    .filter(Boolean);
}

export async function generateAiPlan(description) {
  try {
    const response = await API.post('/ai/plan-task', { description });

    if (response.data?.success === false) {
      throw new Error(response.data?.message || 'Failed to generate a plan.');
    }

    // The backend responds with { success, plan: { summary, steps, ... } }.
    // Unwrap defensively so both nested and flat shapes work.
    const payload = response?.data ?? null;
    const plan =
      payload?.plan ??
      payload?.data?.plan ??
      payload?.data ??
      payload;

    if (!plan || !Array.isArray(plan.steps)) {
      throw new Error('The AI returned an empty plan. Try rephrasing your goal.');
    }

    return {
      summary: plan.summary || plan.title || 'Your execution plan',
      priority: ['high', 'medium', 'low'].includes(String(plan.priority).toLowerCase())
        ? String(plan.priority).toLowerCase()
        : 'medium',
      estimatedHours: Number(plan.estimatedHours) || null,
      steps: normalisePlanSteps(plan.steps),
    };
  } catch (error) {
    notify(error, 'AI planning failed.');
    throw error;
  }
}

export default API;
