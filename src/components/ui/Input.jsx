import { forwardRef, useId, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Field } from './Field';

const SIZES = {
  sm: 'h-9 text-[13px] rounded-[10px]',
  md: 'h-10 text-[13.5px] rounded-xl',
  lg: 'h-11 text-sm rounded-xl',
};

/**
 * Polished text input with optional leading icon, clear button, hint and error.
 */
const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    leftIcon,
    rightSlot,
    size = 'md',
    className,
    containerClassName,
    id,
    required,
    disabled,
    value,
    onChange,
    clearable = false,
    onClear,
    labelAction,
    ...props
  },
  ref
) {
  const autoId = useId();
  const inputId = id || `input-${autoId}`;
  const hintId = `${inputId}-hint`;
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState('');
  const currentValue = isControlled ? value : internalValue;
  const showClear = clearable && Boolean(currentValue);

  const handleChange = (event) => {
    if (!isControlled) setInternalValue(event.target.value);
    onChange?.(event);
  };

  const handleClear = () => {
    onClear?.();
    if (!isControlled) setInternalValue('');
    onChange?.({ target: { value: '' } });
  };

  return (
    <Field
      label={label}
      htmlFor={inputId}
      hint={hint}
      error={error}
      hintId={hintId}
      required={required}
      labelAction={labelAction}
      className={containerClassName}
    >
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint [&_svg]:size-4">
            {leftIcon}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          value={currentValue}
          onChange={handleChange}
          disabled={disabled}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error || hint ? hintId : undefined}
          className={cn(
            'peer w-full border bg-surface-muted text-ink shadow-xs outline-none',
            'placeholder:text-ink-faint',
            'transition-colors duration-200 ease-out-expo',
            'hover:border-line-strong',
            'focus:outline-none focus-visible:outline-none',
            'disabled:cursor-not-allowed disabled:bg-surface-subtle disabled:text-ink-subtle disabled:shadow-none',
            error ? 'border-rose-500/40' : 'border-line',
            leftIcon ? 'pl-9' : 'pl-3.5',
            showClear || rightSlot ? 'pr-10' : 'pr-3.5',
            SIZES[size] || SIZES.md,
            className
          )}
          {...props}
        />

        {showClear && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear input"
            tabIndex={-1}
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-md text-ink-subtle transition-colors hover:bg-surface-subtle hover:text-ink"
          >
            <X className="size-3.5" />
          </button>
        )}

        {rightSlot && !showClear && (
          <span className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center">
            {rightSlot}
          </span>
        )}
      </div>
    </Field>
  );
});

export { Input };
export default Input;
