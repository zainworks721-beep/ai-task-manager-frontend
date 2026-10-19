import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Clock, AlertTriangle, ArrowRight, CheckCircle2, Loader2, ListPlus } from 'lucide-react';
import { generateAiPlan, createTask } from '../api/axiosClient';
import toast from 'react-hot-toast';

const PRESETS = [
  'Build user authentication with JWT and email verification',
  'Integrate Stripe subscription payments and checkout webhooks',
  'Launch an Instagram and TikTok influencer marketing campaign',
  'Migrate monolith database to microservices with zero downtime',
];

export default function AiPlannerModal({ isOpen, onClose, onTasksAdded }) {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [addingToBoard, setAddingToBoard] = useState(false);

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('Please enter what you want to achieve');
      return;
    }
    setLoading(true);
    setPlan(null);
    try {
      const result = await generateAiPlan(description.trim());
      setPlan(result);
    } catch {
      // Error handled in axiosClient toast
    } finally {
      setLoading(false);
    }
  };

  const handleAddAllToBoard = async () => {
    if (!plan || !plan.steps || plan.steps.length === 0) return;

    setAddingToBoard(true);
    try {
      const addedTasks = [];
      for (const step of plan.steps) {
        const newTask = await createTask({
          title: step,
          description: `Part of AI Plan: ${plan.summary}`,
          status: 'pending',
        });
        if (newTask) addedTasks.push(newTask);
      }
      toast.success(`Added ${addedTasks.length} tasks to board! 🚀`);
      onTasksAdded();
      handleClose();
    } catch {
      toast.error('Failed to add some tasks to board');
    } finally {
      setAddingToBoard(false);
    }
  };

  const handleClose = () => {
    setPlan(null);
    setDescription('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Blurred Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/30">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    AI Task Architect
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30">
                      Groq Powered
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Describe your goal. AI will structure it into an actionable roadmap.</p>
                </div>
              </div>

              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Input Form */}
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                  What do you want to build or achieve?
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. Build a SaaS landing page with Next.js, Stripe pricing table, and testimonials..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-brand-500 rounded-2xl p-4 text-sm text-slate-100 placeholder-slate-600 focus:outline-none transition shadow-inner resize-none"
                />
              </div>

              {/* Preset Chips */}
              <div>
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block mb-2">
                  Try an idea:
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setDescription(preset)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-slate-950/70 hover:bg-slate-800 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition text-left"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={loading || !description.trim()}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:from-brand-500 hover:to-purple-500 shadow-lg shadow-brand-500/25 transition disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>AI is thinking & planning...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Action Plan</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-6 pt-6 border-t border-slate-800/80 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-brand-400 animate-ping" />
                  <span className="text-xs font-medium text-brand-300">Deconstructing goals into execution steps...</span>
                </div>
                <div className="h-12 bg-slate-800/50 rounded-xl animate-pulse" />
                <div className="h-8 bg-slate-800/40 rounded-xl animate-pulse w-3/4" />
                <div className="space-y-2 pt-2">
                  <div className="h-6 bg-slate-800/30 rounded-lg animate-pulse" />
                  <div className="h-6 bg-slate-800/30 rounded-lg animate-pulse" />
                  <div className="h-6 bg-slate-800/30 rounded-lg animate-pulse w-5/6" />
                </div>
              </motion.div>
            )}

            {/* Plan Display Card */}
            {plan && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-6 pt-6 border-t border-slate-800 space-y-5"
              >
                {/* Plan Meta Badges */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                      Generated Plan
                    </span>
                    <h3 className="text-sm font-bold text-slate-100 mt-0.5">{plan.summary}</h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Priority Badge */}
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                        plan.priority === 'high'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : plan.priority === 'medium'
                          ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {plan.priority} Priority
                    </span>

                    {/* Estimated Hours */}
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {plan.estimatedHours} Hours
                    </span>
                  </div>
                </div>

                {/* Steps Checklist */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-brand-400" />
                      Actionable Steps ({plan.steps?.length || 0})
                    </span>
                  </div>

                  <div className="space-y-2">
                    {plan.steps?.map((step, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-start gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-200"
                      >
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="pt-0.5 leading-relaxed">{step}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Add to Board Button */}
                <div className="pt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddAllToBoard}
                    disabled={addingToBoard}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 transition disabled:opacity-50"
                  >
                    {addingToBoard ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Adding tasks to board...</span>
                      </>
                    ) : (
                      <>
                        <ListPlus className="w-4 h-4" />
                        <span>Add all {plan.steps?.length} tasks to board</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
