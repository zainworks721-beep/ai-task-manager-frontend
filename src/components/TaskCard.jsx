import { forwardRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  Pencil,
  RotateCcw,
  Trash2,
  TriangleAlert,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { getDueMeta, DUE_TONES } from '../lib/date';
import { STATUS_CONFIG } from '../lib/constants';
import { StatusBadge } from './ui/Badge';
import { Tooltip } from './ui/Tooltip';

const NEXT_ACTION = {
  pending: {
    label: 'Start',
    next: 'in-progress',
    icon: Circle,
    className:
      'bg-brand-500/10 text-brand-300 ring-brand-500/25 hover:bg-brand-500/15 hover:ring-brand-500/35',
  },
  'in-progress': {
    label: 'Complete',
    next: 'completed',
    icon: CheckCircle2,
    className:
      'bg-emerald-500/10 text-emerald-300 ring-emerald-500/25 hover:bg-emerald-500/15 hover:ring-emerald-500/35',
  },
  completed: {
    label: 'Reopen',
    next: 'in-progress',
    icon: RotateCcw,
    className:
      'bg-surface-subtle text-ink-muted ring-line-strong/50 hover:bg-surface-sunken hover:text-ink',
  },
};

const TaskCard = forwardRef(function TaskCard(
  {
    task,
    onEdit,
    onDelete,
    onStatusChange,
    canDrag = false,
    isDragging = false,
    onDragStart,
    onDragEnd,
  },
  ref
) {
  const status = STATUS_CONFIG[task.status] || STATUS_CONFIG.pending;
  const action = NEXT_ACTION[task.status] || NEXT_ACTION.pending;
  const due = getDueMeta(task.dueDate, task.status);
  const isDone = task.status === 'completed';
  const ActionIcon = action.icon;

  return (
    <motion.article
      ref={ref}
      layout
      initial={{ opacity: 0, y: 10, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.14 } }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      whileHover={isDragging ? undefined : { y: -2 }}
      draggable={canDrag}
      onDragStart={(event) => {
        event.dataTransfer.setData('text/plain', task._id);
        event.dataTransfer.effectAllowed = 'move';
        onDragStart?.(task);
      }}
      onDragEnd={() => onDragEnd?.(task)}
      className={cn(
        'group relative rounded-2xl border border-line bg-surface p-4 shadow-xs',
        'transition-[box-shadow,border-color,opacity] duration-250 ease-out-expo',
        'hover:border-line-strong hover:shadow-md',
        canDrag && 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-40 ring-2 ring-brand-400/40'
      )}
      aria-label={task.title}
    >
      {/* Status + actions */}
      <div className="flex items-center justify-between gap-2">
        <StatusBadge status={task.status} size="xs" />

        <div
          className={cn(
            'flex items-center gap-0.5',
            'max-md:opacity-100 md:opacity-0 md:transition-opacity md:duration-200 md:group-hover:opacity-100 md:group-focus-within:opacity-100'
          )}
        >
          <Tooltip content="Edit task">
            <button
              type="button"
              onClick={() => onEdit?.(task)}
              aria-label={`Edit ${task.title}`}
              className="flex size-7 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-surface-subtle hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              <Pencil className="size-3.5" />
            </button>
          </Tooltip>

          <Tooltip content="Delete task">
            <button
              type="button"
              onClick={() => onDelete?.(task)}
              aria-label={`Delete ${task.title}`}
              className="flex size-7 items-center justify-center rounded-md text-ink-subtle transition-colors duration-150 hover:bg-rose-500/10 hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
            >
              <Trash2 className="size-3.5" />
            </button>
          </Tooltip>
        </div>
      </div>

      {/* Title */}
      <h3
        className={cn(
          'mt-3 line-clamp-2 text-[14px] font-semibold leading-snug tracking-tight',
          isDone ? 'text-ink-subtle line-through decoration-ink-faint/70' : 'text-ink-strong'
        )}
      >
        {task.title}
      </h3>

      {/* Description */}
      {task.description && (
        <p
          className={cn(
            'mt-1.5 line-clamp-2 text-pretty text-[13px] leading-relaxed',
            isDone ? 'text-ink-subtle' : 'text-ink-muted'
          )}
        >
          {task.description}
        </p>
      )}

      {/* Footer */}
      <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-line-soft pt-3">
        {due ? (
          <Tooltip content={due.hint} side="bottom">
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11.5px] font-medium leading-none',
                due.tone === 'overdue' && 'bg-rose-500/10 text-rose-300',
                due.tone === 'today' && 'bg-amber-500/10 text-amber-300',
                due.tone === 'soon' && 'bg-amber-500/10 text-amber-300',
                due.tone === 'normal' && DUE_TONES.normal
              )}
            >
              {due.tone === 'overdue' ? (
                <TriangleAlert className="size-3" aria-hidden="true" />
              ) : (
                <Calendar className="size-3" aria-hidden="true" />
              )}
              {due.label}
            </span>
          </Tooltip>
        ) : (
          <span className="text-[11.5px] text-ink-subtle">No due date</span>
        )}

        <button
          type="button"
          onClick={() => onStatusChange?.(task._id, action.next)}
          aria-label={`${action.label} ${task.title}`}
          className={cn(
            'inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11.5px] font-semibold',
            'ring-1 ring-inset transition-all duration-200 ease-out-expo',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
            'active:scale-95',
            action.className
          )}
        >
          <ActionIcon className="size-3" aria-hidden="true" />
          {action.label}
          {task.status !== 'completed' && (
            <ArrowRight className="size-3 opacity-60" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Screen-reader status context */}
      <span className="sr-only">
        Status: {status.label}. {due ? due.hint : 'No due date.'}
      </span>
    </motion.article>
  );
});

export default TaskCard;

