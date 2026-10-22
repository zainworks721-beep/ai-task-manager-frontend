import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, CheckCircle2, Circle, Clock, Pencil, Plus } from 'lucide-react';
import { cn } from '../lib/cn';
import { STATUS_OPTIONS } from '../lib/constants';
import { toDateInputValue } from '../lib/date';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Textarea } from './ui/Textarea';
import { SegmentedControl } from './ui/SegmentedControl';

const STATUS_ICONS = {
  pending: Circle,
  'in-progress': Clock,
  completed: CheckCircle2,
};

const QUICK_DATES = [
  { label: 'Today', days: 0 },
  { label: 'Tomorrow', days: 1 },
  { label: 'In 3 days', days: 3 },
  { label: 'Next week', days: 7 },
];

const INITIAL_FORM = {
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
};

export default function TaskModal({
  isOpen,
  onClose,
  onSubmit,
  initialTask = null,
  defaultStatus = 'pending',
}) {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const titleRef = useRef(null);

  const isEditing = Boolean(initialTask);

  useEffect(() => {
    if (!isOpen) return;
    setForm(
      initialTask
        ? {
            title: initialTask.title || '',
            description: initialTask.description || '',
            status: initialTask.status || 'pending',
            dueDate: toDateInputValue(initialTask.dueDate),
          }
        : { ...INITIAL_FORM, status: defaultStatus }
    );
    setErrors({});
    setLoading(false);
  }, [initialTask, defaultStatus, isOpen]);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((option) => ({
        ...option,
        icon: STATUS_ICONS[option.value],
      })),
    []
  );

  const updateField = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const setQuickDate = (days) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    updateField('dueDate', toDateInputValue(date));
  };

  const validate = () => {
    const next = {};
    const title = form.title.trim();

    if (!title) next.title = 'A title is required.';
    else if (title.length < 3) next.title = 'Use at least 3 characters.';
    else if (title.length > 120) next.title = 'Keep the title under 120 characters.';

    if (form.description.length > 600) {
      next.description = 'Keep the description under 600 characters.';
    }

    if (form.dueDate && Number.isNaN(new Date(form.dueDate).getTime())) {
      next.dueDate = 'That date does not look valid.';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event?.preventDefault?.();
    if (loading) return;
    if (!validate()) {
      titleRef.current?.focus();
      return;
    }

    setLoading(true);

    try {
      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        status: form.status,
        dueDate: form.dueDate ? new Date(`${form.dueDate}T12:00:00`).toISOString() : null,
      });
      onClose();
    } catch {
      // Errors are surfaced by the API layer; keep the form open for a retry.
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
      event.preventDefault();
      handleSubmit(event);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      dismissible={!loading}
      size="lg"
      title={isEditing ? 'Edit task' : 'New task'}
      description={
        isEditing
          ? 'Refine the details and keep your board accurate.'
          : 'Capture the work. You can always refine it later.'
      }
      icon={isEditing ? <Pencil /> : <Plus />}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="task-form"
            loading={loading}
            leftIcon={!loading ? <Check /> : null}
            className="w-full sm:w-auto"
          >
            {isEditing ? 'Save changes' : 'Create task'}
          </Button>
        </div>
      }
    >
      <form id="task-form" onSubmit={handleSubmit} onKeyDown={handleKeyDown} className="space-y-4">
        <Input
          ref={titleRef}
          label="Title"
          required
          value={form.title}
          onChange={(event) => updateField('title', event.target.value)}
          placeholder="e.g. Ship the new onboarding flow"
          maxLength={120}
          error={errors.title}
          autoComplete="off"
        />

        <Textarea
          label="Description"
          value={form.description}
          onChange={(event) => updateField('description', event.target.value)}
          placeholder="Add context, acceptance criteria, or useful links…"
          maxLength={600}
          autoResize
          minRows={3}
          maxRows={8}
          error={errors.description}
          hint="Optional — but the more context, the faster it ships."
        />

        <div className="space-y-2">
          <span className="block text-[13px] font-medium leading-none text-ink">Status</span>
          <SegmentedControl
            options={statusOptions}
            value={form.status}
            onChange={(value) => updateField('status', value)}
            ariaLabel="Task status"
            fullWidth
          />
        </div>

        <div className="space-y-2">
          <Input
            type="date"
            label="Due date"
            value={form.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
            error={errors.dueDate}
            hint="Optional — leave empty for no deadline."
          />

          <div className="flex flex-wrap gap-2">
            {QUICK_DATES.map((quick) => (
              <button
                key={quick.label}
                type="button"
                onClick={() => setQuickDate(quick.days)}
                className={cn(
                  'rounded-lg border px-2.5 py-1.5 text-[11.5px] font-medium leading-none transition-all duration-150',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                  'border-line bg-surface text-ink-muted hover:border-line-strong hover:bg-surface-muted hover:text-ink'
                )}
              >
                {quick.label}
              </button>
            ))}
            {form.dueDate && (
              <button
                type="button"
                onClick={() => updateField('dueDate', '')}
                className="rounded-lg px-2.5 py-1.5 text-[11.5px] font-medium leading-none text-ink-subtle transition-colors hover:text-rose-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/50"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        <p className="flex items-center gap-1.5 pt-1 text-[11.5px] text-ink-subtle">
          <kbd className="rounded border border-line bg-surface-muted px-1.5 py-0.5 font-sans text-[10.5px] font-semibold leading-none text-ink-subtle">
            ⌘
          </kbd>
          <kbd className="rounded border border-line bg-surface-muted px-1.5 py-0.5 font-sans text-[10.5px] font-semibold leading-none text-ink-subtle">
            ↵
          </kbd>
          <span>to save from anywhere in the form</span>
        </p>
      </form>
    </Modal>
  );
}
