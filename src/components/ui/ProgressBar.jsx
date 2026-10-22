import { cn } from '../../lib/cn';

const TONES = {
  brand: 'bg-brand-500',
  amber: 'bg-amber-400',
  sky: 'bg-sky-400',
  emerald: 'bg-emerald-500',
  rose: 'bg-rose-500',
  slate: 'bg-slate-400',
};

const TRACKS = {
  brand: 'bg-brand-500/15',
  amber: 'bg-amber-500/15',
  sky: 'bg-sky-500/15',
  emerald: 'bg-emerald-500/15',
  rose: 'bg-rose-500/15',
  slate: 'bg-slate-500/15',
};

const SIZES = {
  xs: 'h-1',
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-2.5',
};

export function ProgressBar({
  value = 0,
  max = 100,
  tone = 'brand',
  size = 'sm',
  label,
  showValue = false,
  className,
  trackClassName,
}) {
  const safeMax = max > 0 ? max : 100;
  const pct = Math.min(100, Math.max(0, (value / safeMax) * 100));

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="mb-1.5 flex items-center justify-between gap-3 text-[11.5px] font-medium">
          <span className="text-ink-muted">{label}</span>
          {showValue && (
            <span className="tabular text-ink-subtle">{Math.round(pct)}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={Math.round(pct)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
        className={cn(
          'w-full overflow-hidden rounded-full',
          TRACKS[tone] || TRACKS.brand,
          SIZES[size] || SIZES.sm,
          trackClassName
        )}
      >
        <div
          className={cn(
            'h-full origin-left rounded-full transition-[width] duration-700 ease-out-expo',
            TONES[tone] || TONES.brand
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
