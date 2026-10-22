import { cn } from '../../lib/cn';

/**
 * Shared label / hint / error scaffolding for form controls.
 */
export function Field({
  children,
  label,
  htmlFor,
  hint,
  error,
  required = false,
  hintId,
  className,
  labelAction,
}) {
  const message = error || hint;

  return (
    <div className={cn('space-y-1.5', className)}>
      {(label || labelAction) && (
        <div className="flex items-baseline justify-between gap-3">
          {label && (
            <label
              htmlFor={htmlFor}
              className="text-[13px] font-medium leading-none text-ink"
            >
              {label}
              {required && <span className="ml-0.5 text-rose-400" aria-hidden="true">*</span>}
            </label>
          )}
          {labelAction}
        </div>
      )}

      {children}

      {message && (
        <p
          id={hintId}
          role={error ? 'alert' : undefined}
          className={cn(
            'flex items-center gap-1 text-[12px] leading-snug',
            error ? 'font-medium text-rose-300' : 'text-ink-subtle'
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
}

export default Field;
