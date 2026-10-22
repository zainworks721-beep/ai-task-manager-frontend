import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowUp,
  CornerDownLeft,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  SquarePen,
} from 'lucide-react';
import { cn } from '../lib/cn';
import { STATUS_CONFIG } from '../lib/constants';
import { Modal } from './ui/Modal';
import { Kbd } from './ui/Kbd';

export default function CommandPalette({
  open,
  onClose,
  tasks = [],
  onNewTask,
  onOpenAi,
  onRefresh,
  onSelectTask,
}) {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    if (!open) {
      setQuery('');
      setActiveIndex(0);
    }
  }, [open]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const actions = useMemo(
    () => [
      {
        id: 'new-task',
        label: 'Create a new task',
        hint: '⌘⇧N',
        icon: Plus,
        run: () => {
          onClose();
          onNewTask?.('pending');
        },
      },
      {
        id: 'ai-plan',
        label: 'Plan with AI',
        hint: '',
        icon: Sparkles,
        run: () => {
          onClose();
          onOpenAi?.();
        },
      },
      {
        id: 'refresh',
        label: 'Refresh board',
        hint: '',
        icon: RefreshCw,
        run: () => {
          onClose();
          onRefresh?.();
        },
      },
    ],
    [onClose, onNewTask, onOpenAi, onRefresh]
  );

  const matchedTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return tasks.slice(0, 5);

    return tasks
      .filter(
        (task) =>
          task.title.toLowerCase().includes(q) ||
          (task.description && task.description.toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [tasks, query]);

  const totalEntries = actions.length + matchedTasks.length;

  const runEntry = (index) => {
    if (index < actions.length) {
      actions[index].run();
      return;
    }
    const task = matchedTasks[index - actions.length];
    if (task) {
      onClose();
      onSelectTask?.(task);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % Math.max(totalEntries, 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => (index - 1 + Math.max(totalEntries, 1)) % Math.max(totalEntries, 1));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      runEntry(activeIndex);
    }
  };

  useEffect(() => {
    if (!open) return;
    const node = listRef.current?.querySelector(`[data-cmd-index="${activeIndex}"]`);
    node?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, open]);

  const renderRow = (entry, index) => {
    const Icon = entry.icon;
    const isActive = index === activeIndex;

    return (
      <button
        key={entry.id}
        type="button"
        data-cmd-index={index}
        onMouseMove={() => setActiveIndex(index)}
        onClick={() => runEntry(index)}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors duration-100',
          isActive ? 'bg-brand-500/10 text-brand-200' : 'text-ink hover:bg-surface-muted'
        )}
      >
        <span
          className={cn(
            'flex size-7 shrink-0 items-center justify-center rounded-lg border transition-colors',
            isActive
              ? 'border-brand-500/30 bg-surface text-brand-300'
              : 'border-line bg-surface text-ink-subtle'
          )}
        >
          {Icon ? <Icon className="size-3.5" /> : <SquarePen className="size-3.5" />}
        </span>

        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{entry.label}</span>

        {entry.meta && (
          <span className="shrink-0 text-[11px] font-semibold text-ink-subtle">{entry.meta}</span>
        )}
        {entry.hint ? (
          <span className="shrink-0 font-mono text-[10.5px] font-semibold text-ink-subtle">
            {entry.hint}
          </span>
        ) : null}
      </button>
    );
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      showClose={false}
      flush
      bodyClassName="p-0"
      className="sm:mt-0"
    >
      <div className="flex items-center gap-2.5 border-b border-line px-4">
        <Search className="size-4 shrink-0 text-ink-subtle" aria-hidden="true" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Search tasks or run a command…"
          aria-label="Search tasks or run a command"
          className="h-14 min-w-0 flex-1 bg-transparent text-[14px] text-ink outline-none placeholder:text-ink-faint"
          autoComplete="off"
          spellCheck="false"
        />
        <Kbd className="shrink-0">esc</Kbd>
      </div>

      <div ref={listRef} className="scroll-thin max-h-[min(58vh,26rem)] overflow-y-auto p-2">
        <p className="px-3 pb-1.5 pt-2 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
          Actions
        </p>
        {actions.map((action, index) => renderRow(action, index))}

        <p className="px-3 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-ink-subtle">
          {query.trim() ? 'Matching tasks' : 'Recent tasks'}
        </p>

        {matchedTasks.length === 0 ? (
          <p className="px-3 py-5 text-center text-[12.5px] text-ink-subtle">
            No tasks match “{query.trim()}”.
          </p>
        ) : (
          matchedTasks.map((task, index) =>
            renderRow(
              {
                id: `task-${task._id}`,
                label: task.title,
                meta: STATUS_CONFIG[task.status]?.label,
                run: () => onSelectTask?.(task),
              },
              actions.length + index
            )
          )
        )}
      </div>

      <div className="flex items-center gap-4 border-t border-line px-4 py-3 text-[11px] text-ink-subtle">
        <span className="flex items-center gap-1">
          <Kbd>
            <ArrowUp className="size-3" />
          </Kbd>
          <Kbd>
            <ArrowUp className="size-3 rotate-180" />
          </Kbd>
          navigate
        </span>
        <span className="flex items-center gap-1">
          <Kbd>
            <CornerDownLeft className="size-3" />
          </Kbd>
          select
        </span>
        <span className="ml-auto hidden sm:inline">
          {tasks.length} task{tasks.length === 1 ? '' : 's'} on this board
        </span>
      </div>
    </Modal>
  );
}
