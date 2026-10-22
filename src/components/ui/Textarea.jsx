import { forwardRef, useEffect, useId, useRef } from 'react';
import { cn } from '../../lib/cn';
import { Field } from './Field';

/**
 * Auto-growing textarea with optional character counter.
 */
const Textarea = forwardRef(function Textarea(
  {
    label,
    hint,
    error,
    className,
    containerClassName,
    id,
    required,
    disabled,
    value,
    onChange,
    autoResize = false,
    maxLength,
    minRows = 3,
    maxRows = 10,
    labelAction,
    ...props
  },
  forwardedRef
) {
  const autoId = useId();
  const textareaId = id || `textarea-${autoId}`;
  const hintId = `${textareaId}-hint`;
  const innerRef = useRef(null);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof forwardedRef === 'function') forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  useEffect(() => {
    if (!autoResize || !innerRef.current) return;
    const el = innerRef.current;
    el.style.height = 'auto';
    const lineHeight = 22;
    const min = minRows * lineHeight;
    const max = maxRows * lineHeight;
    el.style.height = `${Math.min(Math.max(el.scrollHeight, min), max)}px`;
  }, [value, autoResize, minRows, maxRows]);

  const charCount = typeof value === 'string' ? value.length : 0;

  return (
    <Field
      label={label}
      htmlFor={textareaId}
      hint={hint}
      error={error}
      hintId={hintId}
      required={required}
      labelAction={labelAction}
      className={containerClassName}
    >
      <div className="relative">
        <textarea
          ref={setRefs}
          id={textareaId}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          rows={autoResize ? minRows : undefined}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? hintId : undefined}
          className={cn(
            'w-full resize-none border border-line bg-surface-muted px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink shadow-xs outline-none',
            'placeholder:text-ink-faint',
            'transition-colors duration-200 ease-out-expo',
            'hover:border-line-strong',
            'focus:outline-none focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-subtle',
            error ? 'border-rose-500/40' : 'border-line',
            autoResize ? 'overflow-y-auto' : 'resize-y',
            'rounded-xl',
            maxLength && 'pb-7',
            className
          )}
          {...props}
        />

        {maxLength && (
          <span
            className={cn(
              'pointer-events-none absolute bottom-2.5 right-3 font-mono text-[10px] tabular-nums',
              charCount > maxLength * 0.9 ? 'text-amber-300' : 'text-ink-subtle'
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}
      </div>
    </Field>
  );
});

export { Textarea };
export default Textarea;
