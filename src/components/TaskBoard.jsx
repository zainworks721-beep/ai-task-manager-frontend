import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Circle, Clock, CheckCircle, Plus } from 'lucide-react';
import TaskCard from './TaskCard';

const COLUMNS = [
  {
    id: 'pending',
    title: 'To Do',
    description: 'Tasks waiting to be started',
    icon: Circle,
    color: 'text-amber-400',
    border: 'border-amber-500/20',
    countBg: 'bg-amber-500/10 text-amber-300',
  },
  {
    id: 'in-progress',
    title: 'In Progress',
    description: 'Tasks currently in development',
    icon: Clock,
    color: 'text-sky-400',
    border: 'border-sky-500/20',
    countBg: 'bg-sky-500/10 text-sky-300',
  },
  {
    id: 'completed',
    title: 'Completed',
    description: 'Done and verified tasks',
    icon: CheckCircle,
    color: 'text-emerald-400',
    border: 'border-emerald-500/20',
    countBg: 'bg-emerald-500/10 text-emerald-300',
  },
];

export default function TaskBoard({ tasks, onEdit, onDelete, onStatusChange, onNewTask }) {
  // Group tasks by status
  const getTasksByStatus = (status) => tasks.filter((t) => t.status === status);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {COLUMNS.map((col) => {
        const columnTasks = getTasksByStatus(col.id);
        const Icon = col.icon;

        return (
          <div
            key={col.id}
            className="flex flex-col bg-slate-900/40 rounded-2xl border border-slate-800/60 p-4 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800/60">
              <div className="flex items-center gap-2.5">
                <div className={`p-1.5 rounded-lg bg-slate-800/80 ${col.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-100">{col.title}</h2>
                  <span className="text-[11px] text-slate-500 hidden sm:inline">{col.description}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold font-mono ${col.countBg}`}>
                  {columnTasks.length}
                </span>
                {col.id === 'pending' && (
                  <button
                    onClick={() => onNewTask('pending')}
                    title="Add task to this column"
                    className="p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Task Cards Container with AnimatePresence */}
            <div className="flex-1 space-y-3 overflow-y-auto pr-1">
              <AnimatePresence mode="popLayout">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                  />
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-48 flex flex-col items-center justify-center text-center p-4 rounded-xl border border-dashed border-slate-800/80 text-slate-500 text-xs"
                >
                  <p className="font-medium text-slate-400">No tasks here</p>
                  <p className="text-[11px] mt-0.5">Click "+ New Task" or use AI Assistant</p>
                </motion.div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
