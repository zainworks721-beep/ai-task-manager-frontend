import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, Inbox, Plus } from 'lucide-react';
import { cn } from '../lib/cn';
import { COLUMNS, STATUS_CONFIG } from '../lib/constants';
import TaskCard from './TaskCard';
import { Tooltip } from './ui/Tooltip';

const COLUMN_ICONS = {
  pending: Circle,
  'in-progress': Clock,
  completed: CheckCircle2,
};

const COLUMN_EMPTY_COPY = {
  pending: {
    title: 'Nothing queued',
    body: 'Add a task or let AI break down your next goal.',
  },
  'in-progress': {
    title: 'Nothing in motion',
    body: 'Start a task from To Do to see it here.',
  },
  completed: {
    title: 'No wins logged yet',
    body: 'Completed work will collect here.',
  },
};

export default function TaskBoard({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
  onNewTask,
  canDrag = false,
}) {
  const [dragId, setDragId] = useState(null);
  const [overColumn, setOverColumn] = useState(null);

  const handleDrop = (event, columnId) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain') || dragId;
    setOverColumn(null);
    setDragId(null);

    if (!taskId) return;
    const task = tasks.find((t) => t._id === taskId);
    if (!task || task.status === columnId) return;

    onStatusChange?.(taskId, columnId);
  };

  return (
    <div className="grid grid-cols-1 items-stretch gap-4 md:grid-cols-3 lg:gap-5">
      {COLUMNS.map((column) => {
        const Icon = COLUMN_ICONS[column.id];
        const meta = STATUS_CONFIG[column.id];
        const columnTasks = tasks.filter((task) => task.status === column.id);
        const isOver = overColumn === column.id;
        const isDragActive = Boolean(dragId);
        const empty = COLUMN_EMPTY_COPY[column.id];

        return (
          <motion.section
            key={column.id}
            layout
            data-column-id={column.id}
            aria-label={`${column.title} column`}
            onDragOver={(event) => {
              if (!canDrag) return;
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
              setOverColumn(column.id);
            }}
            onDragLeave={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget)) {
                setOverColumn((current) => (current === column.id ? null : current));
              }
            }}
            onDrop={(event) => handleDrop(event, column.id)}
            className={cn(
              'flex flex-col rounded-2xl border bg-surface/60 backdrop-blur-[2px]',
              'transition-[background-color,border-color,box-shadow] duration-250 ease-out-expo',
              isOver && isDragActive
                ? 'border-brand-500/40 bg-brand-500/10 shadow-[0_0_0_4px_rgb(99_102_241_/_0.06)]'
                : 'border-line'
            )}
          >
            {/* Status accent hairline */}
            <div
              className={cn('h-[2px] w-full rounded-t-2xl bg-gradient-to-r', meta.hairline)}
              aria-hidden="true"
            />

            {/* Column header */}
            <header className="flex items-start justify-between gap-2 px-4 pb-3 pt-3.5">
              <div className="flex min-w-0 items-center gap-2.5">
                <span
                  className={cn(
                    'flex size-8 shrink-0 items-center justify-center rounded-[10px] [&_svg]:size-4',
                    meta.iconTile
                  )}
                  aria-hidden="true"
                >
                  <Icon />
                </span>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h2 className="truncate text-[14px] font-semibold leading-tight tracking-tight text-ink-strong">
                      {column.title}
                    </h2>
                    <motion.span
                      key={columnTasks.length}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className={cn(
                        'tabular inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[11px] font-bold leading-none',
                        meta.badge
                      )}
                    >
                      {columnTasks.length}
                    </motion.span>
                  </div>
                  <p className="mt-1 hidden truncate text-[11.5px] leading-none text-ink-subtle sm:block">
                    {column.description}
                  </p>
                </div>
              </div>

              <Tooltip content={`Add task to ${column.title}`} side="left">
                <button
                  type="button"
                  onClick={() => onNewTask?.(column.id)}
                  aria-label={`Add task to ${column.title}`}
                  className="flex size-7 shrink-0 items-center justify-center rounded-lg text-ink-subtle transition-all duration-200 ease-out-expo hover:bg-surface-sunken hover:text-ink hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                >
                  <Plus className="size-4" />
                </button>
              </Tooltip>
            </header>

            <div className="mx-4 h-px bg-line-soft" />

            {/* Cards */}
            <div className="flex flex-1 flex-col gap-2.5 px-4 py-3.5">
              <AnimatePresence initial={false} mode="popLayout">
                {columnTasks.map((task) => (
                  <TaskCard
                    key={task._id}
                    task={task}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onStatusChange={onStatusChange}
                    canDrag={canDrag}
                    isDragging={dragId === task._id}
                    onDragStart={(dragged) => setDragId(dragged._id)}
                    onDragEnd={() => {
                      setDragId(null);
                      setOverColumn(null);
                    }}
                  />
                ))}
              </AnimatePresence>

              {columnTasks.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex flex-1 flex-col items-center justify-center gap-2.5 rounded-xl border border-dashed px-5 py-9 text-center',
                    'transition-colors duration-200',
                    isOver && isDragActive
                      ? 'border-brand-500/40 bg-surface/70'
                      : 'border-line-strong/70 bg-surface/50'
                  )}
                >
                  <span
                    className="flex size-9 items-center justify-center rounded-[10px] bg-surface text-ink-faint shadow-xs ring-1 ring-line-soft"
                    aria-hidden="true"
                  >
                    <Inbox className="size-4" />
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-ink-muted">{empty.title}</p>
                    <p className="mt-1 max-w-[14rem] text-pretty text-[12px] leading-relaxed text-ink-subtle">
                      {empty.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onNewTask?.(column.id)}
                    className="text-[12px] font-semibold text-brand-300 underline-offset-2 transition-colors hover:text-brand-300 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                  >
                    Add a task
                  </button>
                </motion.div>
              )}

              {/* Drop hint */}
              <AnimatePresence>
                {isOver && isDragActive && columnTasks.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 40 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="flex items-center justify-center overflow-hidden rounded-xl border border-dashed border-brand-500/40 bg-surface/60 text-[12px] font-semibold text-brand-300"
                  >
                    Drop here
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        );
      })}
    </div>
  );
}
