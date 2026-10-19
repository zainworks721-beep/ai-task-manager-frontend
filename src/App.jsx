import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, RefreshCw, Layers, CheckCircle2, Clock } from 'lucide-react';
import { fetchTasks, createTask, updateTask, deleteTask } from './api/axiosClient';
import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import AiPlannerModal from './components/AiPlannerModal';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState('pending');

  const loadTasks = async () => {
    setLoading(true);
    try {
      const data = await fetchTasks();
      setTasks(data);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // CRUD Handlers
  const handleOpenCreate = (status = 'pending') => {
    setEditingTask(null);
    setDefaultColumnStatus(status);
    setIsTaskModalOpen(true);
  };

  const handleOpenEdit = (task) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const handleTaskSubmit = async (taskData) => {
    if (editingTask) {
      const updated = await updateTask(editingTask._id, taskData);
      setTasks((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
    } else {
      const created = await createTask(taskData);
      setTasks((prev) => [created, ...prev]);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const handleStatusChange = async (id, newStatus) => {
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, status: newStatus } : t))
    );
    try {
      await updateTask(id, { status: newStatus });
    } catch {
      loadTasks(); // revert on failure
    }
  };

  // Filter tasks by search query
  const filteredTasks = tasks.filter((t) => {
    const q = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      (t.description && t.description.toLowerCase().includes(q))
    );
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const inProgressCount = tasks.filter((t) => t.status === 'in-progress').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-500 flex items-center justify-center shadow-lg shadow-brand-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  TaskFlow<span className="text-brand-400 font-bold ml-1">AI</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-300 border border-brand-500/20">
                  v1.0 Pro
                </span>
              </div>
            </div>
          </div>

          {/* Center Quick Stats (desktop only) */}
          <div className="hidden lg:flex items-center gap-6 text-xs text-slate-400 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>Pending: <strong className="text-slate-200 font-mono">{pendingCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span>In Progress: <strong className="text-slate-200 font-mono">{inProgressCount}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Completed: <strong className="text-slate-200 font-mono">{completedCount}</strong></span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {/* AI Generator Button with Glowing Gradient Border */}
            <button
              onClick={() => setIsAiModalOpen(true)}
              className="relative group p-[1px] rounded-xl overflow-hidden focus:outline-none transition"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-brand-500 via-indigo-500 to-purple-500 rounded-xl group-hover:opacity-100 transition duration-300 animate-pulse" />
              <div className="relative px-3.5 sm:px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 transition flex items-center gap-2 text-xs sm:text-sm font-semibold text-white">
                <Sparkles className="w-4 h-4 text-brand-400 group-hover:rotate-12 transition-transform" />
                <span className="hidden sm:inline">Plan with AI</span>
                <span className="sm:hidden">AI</span>
              </div>
            </button>

            {/* + New Task Button */}
            <button
              onClick={() => handleOpenCreate('pending')}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs sm:text-sm font-semibold shadow-lg shadow-brand-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Task</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Sub-header / Filters */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Project Board</h1>
            <p className="text-xs text-slate-400 mt-0.5">Manage tasks, track progress, or let Groq AI architect your next sprint.</p>
          </div>

          {/* Search Bar & Refresh */}
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500 transition"
              />
            </div>

            <button
              onClick={loadTasks}
              title="Refresh Tasks"
              className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-brand-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Task Board */}
        {loading && tasks.length === 0 ? (
          <div className="h-96 flex flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin text-brand-500" />
            <p className="text-sm font-medium">Connecting to Backend API...</p>
          </div>
        ) : (
          <TaskBoard
            tasks={filteredTasks}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteTask}
            onStatusChange={handleStatusChange}
            onNewTask={handleOpenCreate}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
        <p>TaskFlow AI • Powered by Node.js, Express, MongoDB Atlas & Groq Cloud</p>
      </footer>

      {/* Task Create/Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
        defaultStatus={defaultColumnStatus}
      />

      {/* AI Planner Modal */}
      <AiPlannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onTasksAdded={loadTasks}
      />
    </div>
  );
}
