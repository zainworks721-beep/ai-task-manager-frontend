import { cn } from '../../lib/cn';

/**
 * Calm, confident empty state. Never a sad grey box.
 */
export function EmptyState({
  icon = null,
  title,
  description,
  action = null,
  secondaryAction = null,
  className,
  compact = false,
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        compact ? 'gap-2 px-4 py-8' : 'gap-3 px-6 py-14',
        className
      )}
    >
      {icon && (
        <div
          className={cn(
            'relative flex items-center justify-center rounded-2xl border border-line-soft bg-surface text-ink-subtle shadow-xs',
            'ring-1 ring-white/10',
            compact ? 'size-10 [&_svg]:size-[18px]' : 'size-12 [&_svg]:size-5'
          )}
          aria-hidden="true"
        >
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-brand-500/10 to-transparent" />
          <span className="relative">{icon}</span>
        </div>
      )}

      <div className="max-w-[19rem] space-y-1">
        <p
          className={cn(
            'font-semibold tracking-tight text-ink',
            compact ? 'text-[13.5px]' : 'text-[15px]'
          )}
        >
          {title}
        </p>
        {description && (
          <p className="text-pretty text-[13px] leading-relaxed text-ink-subtle">
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

export default EmptyState;
