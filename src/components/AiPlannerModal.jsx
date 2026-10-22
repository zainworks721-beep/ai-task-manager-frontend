import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  ListPlus,
  Plus,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  Wand2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cn } from '../lib/cn';
import { PRIORITY_CONFIG } from '../lib/constants';
import { generateAiPlan, createTasks } from '../api/axiosClient';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import { Badge } from './ui/Badge';
import { Skeleton } from './ui/Skeleton';

const PRESETS = [
  'JWT auth with email verification',
  'Stripe subscriptions & webhooks',
  'Launch an influencer campaign',
  'Migrate monolith to microservices',
];

const THINKING_STEPS = [
  'Reading your objective…',
  'Deconstructing into milestones…',
  'Ordering steps by dependency…',
  'Estimating effort and priority…',
];

export default function AiPlannerModal({ isOpen, onClose, onTasksAdded }) {
  const [description, setDescription] = useState('');
  const [phase, setPhase] = useState('idle'); // idle | loading | ready
  const [plan, setPlan] = useState(null);
  const [selected, setSelected] = useState([]);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [thinkingIndex, setThinkingIndex] = useState(0);

  const busy = phase === 'loading' || adding;

  useEffect(() => {
    if (!isOpen) {
      setDescription('');
      setPhase('idle');
      setPlan(null);
      setSelected([]);
      setAdding(false);
      setError(null);
      setThinkingIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (phase !== 'loading') return undefined;
    const interval = window.setInterval(() => {
      setThinkingIndex((index) => (index + 1) % THINKING_STEPS.length);
    }, 1100);
    return () => window.clearInterval(interval);
  }, [phase]);

  const allSelected = plan ? selected.length === plan.steps.length : false;

  const priority = plan?.priority ? PRIORITY_CONFIG[plan.priority] : null;

  const sortedSteps = useMemo(() => plan?.steps || [], [plan]);

  const handleGenerate = async (event) => {
    event?.preventDefault?.();

    if (!description.trim()) {
      setError('Describe what you want to achieve first.');
      return;
    }

    setPhase('loading');
    setError(null);
    setPlan(null);
    setThinkingIndex(0);

    try {
      const result = await generateAiPlan(description.trim());

      if (!result.steps.length) {
        throw new Error('The AI did not return any actionable steps. Try rephrasing.');
      }

      setPlan(result);
      setSelected(result.steps.map((_, index) => index));
      setPhase('ready');
    } catch (requestError) {
      setPhase('idle');
      setError(
        requestError?.userMessage ||
          requestError?.message ||
          'Something went wrong while planning.'
      );
    }
  };

  const toggleStep = (index) => {
    setSelected((current) =>
      current.includes(index) ? current.filter((i) => i !== index) : [...current, index]
    );
  };

  const toggleAll = () => {
    if (!plan) return;
    setSelected(allSelected ? [] : plan.steps.map((_, index) => index));
  };

  const handleAddToBoard = async () => {
    if (!plan || selected.length === 0) return;

    setAdding(true);

    try {
      const payload = selected
        .sort((a, b) => a - b)
        .map((index) => ({
          title: sortedSteps[index],
          description: `Part of AI plan: ${plan.summary}`,
          status: 'pending',
        }));

      const { created, failed } = await createTasks(payload);

      if (failed > 0) {
        toast.error(`${failed} of ${payload.length} tasks could not be added.`);
      }
      toast.success(
        `${created.length} task${created.length === 1 ? '' : 's'} added to your board`
      );

      onTasksAdded?.(created);
      onClose();
    } catch (requestError) {
      toast.error(
        requestError?.userMessage || requestError?.message || 'Could not add the tasks.'
      );
    } finally {
      setAdding(false);
    }
  };

  const handleRegenerate = () => {
    setPhase('idle');
    setPlan(null);
    setSelected([]);
    setError(null);
  };

  const handleKeyDown = (event) => {
    if ((event.metaKey || event.ctrlKey) && event.key === 'Enter' && phase !== 'loading') {
      event.preventDefault();
      if (phase === 'ready') handleAddToBoard();
      else handleGenerate(event);
    }
  };

  const footer = (
    <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="hidden text-[11.5px] text-ink-subtle sm:block">
        AI output is a starting point — review before you commit.
      </p>

      <div className="flex flex-col-reverse gap-2 sm:ml-auto sm:flex-row">
        {phase === 'ready' ? (
          <>
            <Button
              variant="secondary"
              onClick={handleRegenerate}
              disabled={adding}
              leftIcon={<RotateCcw />}
              className="w-full sm:w-auto"
            >
              Start over
            </Button>
            <Button
              variant="primary"
              onClick={handleAddToBoard}
              loading={adding}
              disabled={selected.length === 0}
              leftIcon={!adding ? <ListPlus /> : null}
              rightIcon={!adding ? <ArrowRight /> : null}
              className="w-full sm:w-auto"
            >
              Add {selected.length} {selected.length === 1 ? 'task' : 'tasks'}
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={busy}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="ai-plan-form"
              loading={phase === 'loading'}
              disabled={!description.trim() && phase !== 'loading'}
              leftIcon={phase !== 'loading' ? <Sparkles /> : null}
              className="w-full sm:w-auto"
            >
              Generate plan
            </Button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      dismissible={!busy}
      size="lg"
      title="AI task architect"
      description="Describe a goal. Get a sequenced, actionable plan you can ship."
      icon={<Sparkles />}
      footer={footer}
      bodyClassName="space-y-5"
    >
      <form id="ai-plan-form" onSubmit={handleGenerate} onKeyDown={handleKeyDown}>
        <Textarea
          label="What do you want to achieve?"
          value={description}
          onChange={(event) => {
            setDescription(event.target.value);
            if (error) setError(null);
          }}
          placeholder="e.g. Build a SaaS landing page with Stripe pricing, testimonials, and analytics…"
          autoResize
          minRows={3}
          maxRows={6}
          maxLength={500}
          disabled={busy}
          error={error}
          hint="Be specific about scope and constraints — it plans better."
        />

        {phase === 'idle' && (
          <div className="mt-4">
            <span className="mb-2 block text-[11.5px] font-semibold uppercase tracking-[0.07em] text-ink-subtle">
              Or start from a template
            </span>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setDescription(preset)}
                  className="group inline-flex items-center gap-1 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-[12px] font-medium text-ink-muted shadow-xs transition-all duration-200 ease-out-expo hover:-translate-y-px hover:border-brand-500/30 hover:bg-brand-500/10 hover:text-brand-300 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 active:translate-y-0"
                >
                  <Plus
                    className="size-3 text-ink-faint transition-colors group-hover:text-brand-400"
                    aria-hidden="true"
                  />
                  {preset}
                </button>
              ))}
            </div>
          </div>
        )}
      </form>

      <AnimatePresence mode="wait">
        {phase === 'loading' && (
          <motion.div
            key="ai-loading"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="space-y-3 rounded-2xl border border-line bg-surface-muted/70 p-4"
          >
            <div className="flex items-center gap-2.5">
              <span className="relative flex size-7 items-center justify-center">
                <span className="absolute inline-flex size-7 animate-ping rounded-full bg-brand-400/30" />
                <span className="relative flex size-7 items-center justify-center rounded-full bg-brand-600 text-white">
                  <Wand2 className="size-3.5" />
                </span>
              </span>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">Building your plan</p>
                <motion.p
                  key={thinkingIndex}
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11.5px] text-ink-subtle"
                >
                  {THINKING_STEPS[thinkingIndex]}
                </motion.p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-full rounded-xl" />
              <Skeleton className="h-9 w-4/5 rounded-xl" />
            </div>
          </motion.div>
        )}

        {phase === 'ready' && plan && (
          <motion.div
            key="ai-plan"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-4"
          >
            {/* Summary */}
            <div className="relative overflow-hidden rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-500/10 via-surface to-brand-500/[0.06] p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-8 -top-10 size-28 rounded-full bg-brand-300/20 blur-2xl" />
              <div className="relative">
                <span className="text-[11px] font-semibold uppercase tracking-[0.07em] text-brand-300">
                  Generated plan
                </span>
                <h3 className="mt-1.5 text-pretty text-[15px] font-semibold leading-snug tracking-tight text-ink-strong">
                  {plan.summary}
                </h3>

                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  {priority && (
                    <Badge variant={plan.priority === 'high' ? 'danger' : plan.priority === 'medium' ? 'warning' : 'success'} size="sm" dot>
                      {priority.label} priority
                    </Badge>
                  )}
                  {plan.estimatedHours ? (
                    <Badge variant="neutral" size="sm" icon={<Clock />}>
                      ~{plan.estimatedHours}h total
                    </Badge>
                  ) : null}
                  <Badge variant="neutral" size="sm" icon={<Check />}>
                    {plan.steps.length} steps
                  </Badge>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[12.5px] font-semibold text-ink">
                  Actionable steps
                  <span className="ml-1.5 tabular font-mono text-[11.5px] font-normal text-ink-subtle">
                    {selected.length}/{plan.steps.length}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-[11.5px] font-semibold text-brand-300 transition-colors hover:text-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50"
                >
                  {allSelected ? 'Deselect all' : 'Select all'}
                </button>
              </div>

              <div className="space-y-1.5">
                {plan.steps.map((step, index) => {
                  const checked = selected.includes(index);

                  return (
                    <motion.button
                      key={`${index}-${step.slice(0, 12)}`}
                      type="button"
                      onClick={() => toggleStep(index)}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.28 }}
                      aria-pressed={checked}
                      className={cn(
                        'flex w-full items-start gap-3 rounded-xl border p-3 text-left transition-all duration-200 ease-out-expo',
                        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50',
                        checked
                          ? 'border-brand-500/30 bg-brand-500/10 shadow-xs'
                          : 'border-line bg-surface hover:border-line-strong hover:bg-surface-muted/60'
                      )}
                    >
                      <span
                        className={cn(
                          'mt-px flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border transition-all duration-200',
                          checked
                            ? 'border-brand-600 bg-brand-600 text-white shadow-sm shadow-brand-600/30'
                            : 'border-line-strong bg-surface'
                        )}
                        aria-hidden="true"
                      >
                        {checked && <Check className="size-3" strokeWidth={3} />}
                      </span>

                      <span
                        className={cn(
                          'flex-1 text-[13px] leading-relaxed transition-colors',
                          checked ? 'text-ink' : 'text-ink-muted'
                        )}
                      >
                        <span className="mr-1.5 font-mono text-[11px] font-semibold text-ink-subtle">
                          {String(index + 1).padStart(2, '0')}
                        </span>
                        {step}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {selected.length === 0 && (
              <p className="flex items-center gap-1.5 rounded-lg bg-amber-500/10 px-3 py-2 text-[11.5px] font-medium text-amber-300">
                <TriangleAlert className="size-3.5" aria-hidden="true" />
                Select at least one step to add it to your board.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'idle' && (
        <div className="flex items-start gap-2 rounded-xl border border-line bg-surface-muted/60 px-3 py-2.5">
          <Sparkles className="mt-px size-3.5 shrink-0 text-brand-400" aria-hidden="true" />
          <p className="text-pretty text-[11.5px] leading-relaxed text-ink-subtle">
            Powered by Groq — plans are generated in seconds and never leave your board.
          </p>
        </div>
      )}
    </Modal>
  );
}
