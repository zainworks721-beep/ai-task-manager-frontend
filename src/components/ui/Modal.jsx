import { useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/cn';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { IconButton } from './IconButton';

const SIZES = {
  sm: 'sm:max-w-md',
  md: 'sm:max-w-xl',
  lg: 'sm:max-w-2xl',
  xl: 'sm:max-w-3xl',
  full: 'sm:max-w-5xl',
};

/**
 * Accessible dialog: portal, focus trap, scroll lock, Escape to dismiss,
 * and a native-feeling bottom sheet on phones.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  icon = null,
  children,
  footer,
  size = 'md',
  dismissible = true,
  showClose = true,
  className,
  bodyClassName,
  headerClassName,
  initialFocusRef,
  flush = false,
}) {
  const panelRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 640px)');
  const titleId = useId();
  const descriptionId = useId();

  useLockBodyScroll(open);
  useFocusTrap(panelRef, open);

  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape' && dismissible) {
        event.preventDefault();
        event.stopPropagation();
        onClose?.();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose, dismissible]);

  useEffect(() => {
    if (!open || !initialFocusRef?.current) return;
    const timer = window.setTimeout(() => initialFocusRef.current?.focus(), 90);
    return () => window.clearTimeout(timer);
  }, [open, initialFocusRef]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-6">
          <motion.div
            key="tf-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => dismissible && onClose?.()}
            className="absolute inset-0 bg-black/60 backdrop-blur-[3px]"
            aria-hidden="true"
          />

          <motion.div
            key="tf-modal-panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-describedby={description ? descriptionId : undefined}
            initial={isDesktop ? { opacity: 0, scale: 0.97, y: 10 } : { y: '100%' }}
            animate={isDesktop ? { opacity: 1, scale: 1, y: 0 } : { y: 0 }}
            exit={isDesktop ? { opacity: 0, scale: 0.985, y: 6 } : { y: '100%' }}
            transition={{ type: 'spring', bounce: 0, duration: 0.38 }}
            className={cn(
              'relative z-10 flex w-full flex-col overflow-hidden border border-line bg-surface',
              'shadow-2xl shadow-black/50',
              'max-h-[92dvh] sm:max-h-[calc(100dvh-3rem)]',
              'rounded-t-3xl sm:rounded-2xl',
              SIZES[size] || SIZES.md,
              className
            )}
          >
            {/* Mobile drag affordance */}
            <div className="flex justify-center pt-2.5 sm:hidden" aria-hidden="true">
              <span className="h-1 w-9 rounded-full bg-line-strong" />
            </div>

            {(title || showClose) && (
              <header
                className={cn(
                  'flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-6',
                  headerClassName
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  {icon && (
                    <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-brand-500/10 text-brand-300 ring-1 ring-inset ring-brand-500/20 [&_svg]:size-[18px]">
                      {icon}
                    </span>
                  )}
                  <div className="min-w-0">
                    {title && (
                      <h2
                        id={titleId}
                        className="text-[18px] font-semibold leading-tight tracking-tightest text-ink-strong"
                      >
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p
                        id={descriptionId}
                        className="mt-1.5 text-[13.5px] leading-relaxed text-ink-muted"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                </div>

                {showClose && (
                  <IconButton
                    label="Close dialog"
                    icon={<X />}
                    onClick={onClose}
                    variant="ghost"
                    size="sm"
                    className="-mr-1 -mt-0.5"
                    disabled={!dismissible}
                  />
                )}
              </header>
            )}

            <div
              className={cn(
                'scroll-thin min-h-0 flex-1 overflow-y-auto',
                !flush && 'px-5 py-5 sm:px-6 sm:py-6',
                bodyClassName
              )}
            >
              {children}
            </div>

            {footer && (
              <footer className="border-t border-line bg-surface-muted/60 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
                {footer}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}

export default Modal;
