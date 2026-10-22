import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Gauge,
  Inbox,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';

import {
  fetchTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from './api/axiosClient';
import { STATUS_CONFIG } from './lib/constants';
import { isOverdue } from './lib/date';
import { cn } from './lib/cn';
import { useHotkey } from './hooks/useHotkey';
import { useMediaQuery } from './hooks/useMediaQuery';

import TaskBoard from './components/TaskBoard';
import TaskModal from './components/TaskModal';
import AiPlannerModal from './components/AiPlannerModal';
import CommandPalette from './components/CommandPalette';

import { Button } from './components/ui/Button';
import { IconButton } from './components/ui/IconButton';
import { Input } from './components/ui/Input';
import { Kbd } from './components/ui/Kbd';
import { StatCard } from './components/ui/StatCard';
import { BoardSkeleton } from './components/ui/Skeleton';
import { EmptyState } from './components/ui/EmptyState';
import { ConfirmDialog } from './components/ui/ConfirmDialog';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastSynced, setLastSynced] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const searchRef = useRef(null);

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultColumnStatus, setDefaultColumnStatus] = useState('pending');

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');

  /* ── Data ─────────────────────────────────────────────────────────── */

  const loadTasks = useCallback(async (mode = 'initial') => {
    if (mode === 'initial') setLoading(true);
    if (mode === 'refresh') setRefreshing(true);

    try {
      const data = await fetchTasks(undefined, { silent: true });
      setTasks(data);
      setError(null);
      setLastSynced(new Date());
    } catch (requestError) {
      const message =
        requestError?.userMessage || 'Could not reach the TaskFlow API.';
      setError(message);
      if (mode === 'refresh') toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadTasks('initial');
  }, [loadTasks]);

  /* ── Mutations ────────────────────────────────────────────────────── */

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
      setTasks((current) =>
        current.map((task) =>
          task._id === editingTask._id ? { ...task, ...updated } : task
        )
      );
    } else {
      const created = await createTask(taskData);
      setTasks((current) => [created, ...current]);
    }
    setLastSynced(new Date());
  };

  const handleStatusChange = async (id, newStatus) => {
    const previousStatus = tasks.find((task) => task._id === id)?.status;
    if (!previousStatus || previousStatus === newStatus) return;

    setTasks((current) =>
      current.map((task) =>
        task._id === id ? { ...task, status: newStatus } : task
      )
    );

    try {
      await updateTaskStatus(id, newStatus, { silent: true });
      toast.success(`Moved to ${STATUS_CONFIG[newStatus].label}`, {
        id: 'task-status',
        duration: 1600,
      });
      setLastSynced(new Date());
    } catch {
      setTasks((current) =>
        current.map((task) =>
          task._id === id ? { ...task, status: previousStatus } : task
        )
      );
      toast.error('Could not move that task — change reverted.', {
        id: 'task-status',
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);

    try {
      await deleteTask(deleteTarget._id);
      setTasks((current) =>
        current.filter((task) => task._id !== deleteTarget._id)
      );
      setDeleteTarget(null);
      setLastSynced(new Date());
    } catch {
      // Toast is raised by the API layer.
    } finally {
      setDeleting(false);
    }
  };

  const handleAiTasksAdded = (created) => {
    if (Array.isArray(created) && created.length > 0) {
      setTasks((current) => [...created, ...current]);
      setLastSynced(new Date());
    } else {
      loadTasks('silent');
    }
  };

  /* ── Derived data ─────────────────────────────────────────────────── */

  const filteredTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return tasks;

    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    );
  }, [tasks, searchQuery]);

  const counts = useMemo(() => {
    const base = { pending: 0, 'in-progress': 0, completed: 0 };
    tasks.forEach((task) => {
      if (base[task.status] !== undefined) base[task.status] += 1;
    });
    return base;
  }, [tasks]);

  const total = tasks.length;
  const openCount = total - counts.completed;
  const overdueCount = useMemo(
    () => tasks.filter((task) => isOverdue(task.dueDate, task.status)).length,
    [tasks]
  );
  const completionRate = total > 0 ? Math.round((counts.completed / total) * 100) : 0;

  const isInitialLoad = loading && tasks.length === 0;
  const showGlobalEmpty = !isInitialLoad && filteredTasks.length === 0;

  /* ── Shortcuts ────────────────────────────────────────────────────── */

  useHotkey('mod+k', () => setIsPaletteOpen((open) => !open));
  useHotkey('mod+shift+n', () => handleOpenCreate('pending'));
  useHotkey('/', (event) => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    const isTyping =
      tag === 'input' || tag === 'textarea' || document.activeElement?.isContentEditable;
    if (isTyping) return;
    event.preventDefault();
    searchRef.current?.focus();
  });

  /* ── Render ───────────────────────────────────────────────────────── */

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Skip link */}
      <a
        href="#board"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:rounded-lg focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-lg focus:ring-2 focus:ring-brand-500"
      >
        Skip to board
      </a>

      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <header className="glass-panel sticky top-0 z-40 rounded-none border-x-0 border-t-0 border-b-line/70 shadow-none">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          {/* Brand */}
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="relative flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-glow">
              <Check className="size-[18px]" strokeWidth={3} />
              <span className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-white/25 to-transparent" />
            </span>
            <span className="min-w-0">
              <span className="flex items-baseline gap-1 text-[15px] font-semibold leading-none tracking-tightest text-ink-strong">
                TaskFlow
                <span className="text-brand-300">AI</span>
              </span>
              <span className="mt-1 hidden text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-subtle sm:block">
                Workspace
              </span>
            </span>
          </div>

          <div className="mx-1 hidden h-6 w-px bg-line lg:block" />

          <div className="hidden items-center gap-1.5 lg:flex">
            <span className="rounded-md bg-surface-subtle px-2 py-1 text-[11.5px] font-semibold text-ink-muted">
              Product board
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            {/* Connection state */}
            <span
              className={cn(
                'hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold sm:flex',
                error
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-300'
                  : 'border-line bg-surface text-ink-muted'
              )}
              title={error || 'Connected to the TaskFlow API'}
            >
              <span
                className={cn(
                  'size-1.5 rounded-full',
                  error ? 'bg-amber-500' : 'bg-emerald-500'
                )}
                aria-hidden="true"
              />
              {error ? 'Offline' : 'Live'}
            </span>

            {/* Command palette trigger */}
            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="hidden h-9 w-52 items-center gap-2 rounded-[10px] border border-line bg-surface/70 px-3 text-[13px] text-ink-subtle shadow-xs transition-all duration-200 ease-out-expo hover:border-line-strong hover:bg-surface-sunken hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 md:flex xl:w-60"
              aria-label="Open command palette"
            >
              <Search className="size-3.5 shrink-0" aria-hidden="true" />
              <span className="flex-1 text-left">Search or jump to…</span>
              <span className="flex shrink-0 items-center gap-0.5">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>

            <IconButton
              label="Search (⌘K)"
              icon={<Search />}
              onClick={() => setIsPaletteOpen(true)}
              variant="outlined"
              className="md:hidden"
            />

            <Button
              variant="subtle"
              size="sm"
              onClick={() => setIsAiModalOpen(true)}
              leftIcon={<Sparkles />}
              className="hidden sm:inline-flex"
            >
              Plan with AI
            </Button>
            <IconButton
              label="Plan with AI"
              icon={<Sparkles />}
              onClick={() => setIsAiModalOpen(true)}
              variant="brand"
              className="sm:hidden"
            />

            <Button
              size="sm"
              onClick={() => handleOpenCreate('pending')}
              leftIcon={<Plus />}
            >
              <span className="hidden sm:inline">New task</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main
        id="board"
        aria-busy={loading || undefined}
        className="mx-auto w-full max-w-[1600px] flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-8 lg:py-10"
      >
        {/* Hero */}
        <section className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-1.5 text-[11.5px] font-medium text-ink-subtle"
            >
              <span>Workspace</span>
              <span aria-hidden="true" className="text-ink-faint">/</span>
              <span className="text-ink-muted">Board</span>
            </nav>

            <h1 className="mt-2.5 text-[26px] font-semibold leading-[1.1] tracking-tightest text-ink-strong sm:text-[30px]">
              Project board
            </h1>

            <p className="mt-2.5 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[13.5px] leading-relaxed text-ink-muted">
              <span className="tabular font-medium text-ink">{openCount}</span>
              <span>open {openCount === 1 ? 'task' : 'tasks'}</span>
              <span aria-hidden="true" className="text-ink-faint">·</span>
              <span className="tabular font-medium text-ink">{counts['in-progress']}</span>
              <span>in progress</span>
              {overdueCount > 0 && (
                <>
                  <span aria-hidden="true" className="text-ink-faint">·</span>
                  <span className="inline-flex items-center gap-1 font-medium text-rose-300">
                    <TriangleAlert className="size-3.5" aria-hidden="true" />
                    {overdueCount} overdue
                  </span>
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11.5px] text-ink-subtle lg:pb-1">
            <span className="hidden items-center gap-1.5 sm:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {lastSynced ? 'Up to date' : 'Syncing…'}
            </span>
            <span className="hidden sm:inline" aria-hidden="true">·</span>
            <span className="hidden sm:inline">Drag cards to move them</span>
            <span className="sm:hidden">{lastSynced ? 'Up to date' : 'Syncing…'}</span>
          </div>
        </section>

        {/* KPI row */}
        <section
          aria-label="Board summary"
          className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4"
        >
          <StatCard
            label="To do"
            value={counts.pending}
            total={total}
            tone="slate"
            icon={<Circle />}
            delay={0}
          />
          <StatCard
            label="In progress"
            value={counts['in-progress']}
            total={total}
            tone="brand"
            icon={<Clock />}
            delay={0.04}
          />
          <StatCard
            label="Completed"
            value={counts.completed}
            total={total}
            tone="emerald"
            icon={<CheckCircle2 />}
            delay={0.08}
          />
          <StatCard
            label="Completion"
            value={`${completionRate}%`}
            percent={completionRate}
            tone="ink"
            icon={<Gauge />}
            hint={total > 0 ? `${counts.completed} of ${total} tasks done` : 'No tasks yet'}
            delay={0.12}
          />
        </section>

        {/* Toolbar */}
        <section className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Input
            ref={searchRef}
            size="sm"
            type="search"
            placeholder="Search tasks…"
            aria-label="Search tasks"
            leftIcon={<Search />}
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            clearable
            onClear={() => setSearchQuery('')}
            containerClassName="w-full sm:w-72"
          />

          <div className="flex items-center justify-between gap-3 sm:justify-end">
            <p className="text-[12px] font-medium text-ink-subtle" aria-live="polite">
              {searchQuery.trim()
                ? `${filteredTasks.length} ${filteredTasks.length === 1 ? 'result' : 'results'} for “${searchQuery.trim()}”`
                : `${total} ${total === 1 ? 'task' : 'tasks'} total`}
            </p>

            <IconButton
              label="Refresh board"
              icon={<RefreshCw className={refreshing ? 'animate-spin' : ''} />}
              variant="outlined"
              onClick={() => loadTasks('refresh')}
              disabled={refreshing}
            />
          </div>
        </section>

        {/* Board */}
        <section className="mt-5" aria-label="Task board">
          {isInitialLoad ? (
            <BoardSkeleton />
          ) : error && tasks.length === 0 ? (
            <div className="rounded-2xl border border-line bg-surface/60">
              <EmptyState
                icon={<TriangleAlert />}
                title="We couldn’t reach your board"
                description={
                  error ||
                  'The TaskFlow API did not respond. Check your connection and try again.'
                }
                action={
                  <Button
                    onClick={() => loadTasks('initial')}
                    leftIcon={<RefreshCw />}
                    loading={loading}
                  >
                    Try again
                  </Button>
                }
              />
            </div>
          ) : showGlobalEmpty ? (
            <div className="rounded-2xl border border-line bg-surface/60">
              {searchQuery.trim() ? (
                <EmptyState
                  icon={<Search />}
                  title={`No tasks match “${searchQuery.trim()}”`}
                  description="Try a different keyword, or clear the search to see the whole board."
                  action={
                    <Button
                      variant="secondary"
                      onClick={() => setSearchQuery('')}
                      leftIcon={<X />}
                    >
                      Clear search
                    </Button>
                  }
                />
              ) : (
                <EmptyState
                  icon={<Inbox />}
                  title="Your board is clear"
                  description="Create your first task, or let the AI architect turn a goal into a sequenced plan."
                  action={
                    <Button onClick={() => handleOpenCreate('pending')} leftIcon={<Plus />}>
                      Create a task
                    </Button>
                  }
                  secondaryAction={
                    <Button
                      variant="secondary"
                      onClick={() => setIsAiModalOpen(true)}
                      leftIcon={<Sparkles />}
                    >
                      Plan with AI
                    </Button>
                  }
                />
              )}
            </div>
          ) : (
            <TaskBoard
              tasks={filteredTasks}
              onEdit={handleOpenEdit}
              onDelete={setDeleteTarget}
              onStatusChange={handleStatusChange}
              onNewTask={handleOpenCreate}
              canDrag={canDrag}
            />
          )}
        </section>

        {/* Search result hint when board has columns but zero matches */}
        {!isInitialLoad && !showGlobalEmpty && searchQuery.trim() && (
          <p className="mt-3 text-center text-[11.5px] text-ink-subtle">
            Showing tasks matching “{searchQuery.trim()}”
          </p>
        )}
      </main>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-line/70 bg-surface/40">
        <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-3 px-4 py-6 text-[12px] text-ink-subtle sm:flex-row sm:px-6 lg:px-8">
          <p className="text-center sm:text-left">
            <span className="font-semibold text-ink-muted">TaskFlow AI</span>
            <span className="mx-1.5 text-ink-faint" aria-hidden="true">·</span>
            Built for teams that ship.
          </p>

          <div className="flex items-center gap-4">
            <span className="hidden items-center gap-1.5 md:flex">
              <span className="size-1.5 rounded-full bg-emerald-500" aria-hidden="true" />
              {error ? 'Connection issue' : 'All changes saved'}
            </span>

            <button
              type="button"
              onClick={() => setIsPaletteOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
            >
              Shortcuts
              <span className="flex items-center gap-0.5">
                <Kbd>⌘</Kbd>
                <Kbd>K</Kbd>
              </span>
            </button>
          </div>
        </div>
      </footer>

      {/* ── Overlays ────────────────────────────────────────────────── */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleTaskSubmit}
        initialTask={editingTask}
        defaultStatus={defaultColumnStatus}
      />

      <AiPlannerModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        onTasksAdded={handleAiTasksAdded}
      />

      <CommandPalette
        open={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        tasks={tasks}
        onNewTask={handleOpenCreate}
        onOpenAi={() => setIsAiModalOpen(true)}
        onRefresh={() => loadTasks('refresh')}
        onSelectTask={handleOpenEdit}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete this task?"
        description={
          deleteTarget
            ? `“${deleteTarget.title}” will be permanently removed from your board. This can’t be undone.`
            : ''
        }
      />
    </div>
  );
}
