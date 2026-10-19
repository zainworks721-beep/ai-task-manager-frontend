import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Trash2, Edit3, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

const statusConfig = {
  'pending': {
    label: 'Pending',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    dot: 'bg-amber-400',
  },
  'in-progress': {
    label: 'In Progress',
    badge: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
    dot: 'bg-sky-400',
  },
  'completed': {
    label: 'Completed',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    dot: 'bg-emerald-400',
  },
};

export default function TaskCard({ task, onEdit, onDelete, onStatusChange }) {
  const currentStatus = statusConfig[task.status] || statusConfig['pending'];

  const formatDate = (dateString) => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return null;
    }
  };

  const formattedDate = formatDate(task.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="group relative bg-slate-900/80 hover:bg-slate-900 border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-4 shadow-sm hover:shadow-xl hover:shadow-black/40 transition-all duration-200"
    >
      {/* Top row: Status Badge & Action Buttons */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStatus.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${currentStatus.dot}`}></span>
          {currentStatus.label}
        </span>

        {/* Action icons */}
        <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(task._id)}
            title="Delete Task"
            className="p-1.5 rounded-md hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-semibold tracking-tight text-slate-100 mb-1.5 ${task.status === 'completed' ? 'line-through text-slate-400' : ''}`}>
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 mb-3">
          {task.description}
        </p>
      )}

      {/* Footer: Due date & status progress buttons */}
      <div className="flex items-center justify-between pt-3 mt-1 border-t border-slate-800/60 text-xs text-slate-400">
        {formattedDate ? (
          <div className="flex items-center gap-1.5 text-slate-400">
            <Calendar className="w-3.5 h-3.5 text-slate-500" />
            <span>{formattedDate}</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-600 italic">No deadline</span>
        )}

        {/* Quick status stepper buttons */}
        <div className="flex items-center gap-1">
          {task.status === 'in-progress' && (
            <button
              onClick={() => onStatusChange(task._id, 'pending')}
              title="Move back to Pending"
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {task.status === 'pending' && (
            <button
              onClick={() => onStatusChange(task._id, 'in-progress')}
              title="Start Task"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-[11px] font-medium transition"
            >
              <span>Start</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {task.status === 'in-progress' && (
            <button
              onClick={() => onStatusChange(task._id, 'completed')}
              title="Mark as Complete"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[11px] font-medium transition"
            >
              <span>Done</span>
              <CheckCircle2 className="w-3 h-3" />
            </button>
          )}

          {task.status === 'completed' && (
            <button
              onClick={() => onStatusChange(task._id, 'in-progress')}
              title="Re-open Task"
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Reopen</span>
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
