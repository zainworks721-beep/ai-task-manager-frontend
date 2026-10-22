import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn';

const OFFSET = 8;
const PADDING = 8;

function getPosition(rect, side, tooltipRect) {
  const w = tooltipRect?.width ?? 0;
  const h = tooltipRect?.height ?? 0;

  let top = 0;
  let left = 0;

  if (side === 'top') {
    top = rect.top - h - OFFSET;
    left = rect.left + rect.width / 2 - w / 2;
  } else if (side === 'bottom') {
    top = rect.bottom + OFFSET;
    left = rect.left + rect.width / 2 - w / 2;
  } else if (side === 'left') {
    top = rect.top + rect.height / 2 - h / 2;
    left = rect.left - w - OFFSET;
  } else {
    top = rect.top + rect.height / 2 - h / 2;
    left = rect.right + OFFSET;
  }

  const vw = window.innerWidth;
  const vh = window.innerHeight;
  left = Math.min(Math.max(PADDING, left), Math.max(PADDING, vw - w - PADDING));
  top = Math.min(Math.max(PADDING, top), Math.max(PADDING, vh - h - PADDING));

  return { top, left };
}

/**
 * Portal-rendered tooltip so it is never clipped by scroll containers
 * (kanban columns, modals, tables).
 */
export function Tooltip({
  content,
  side = 'top',
  delay = 140,
  disabled = false,
  className,
  children,
}) {
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);
  const timerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const hide = useCallback(() => {
    window.clearTimeout(timerRef.current);
    setOpen(false);
  }, []);

  const show = useCallback(() => {
    if (disabled || !content) return;
    window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => setOpen(true), delay);
  }, [content, delay, disabled]);

  const reposition = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current?.getBoundingClientRect();
    setCoords(getPosition(rect, side, tooltipRect));
  }, [side]);

  useEffect(() => {
    if (!open) return undefined;
    reposition();
    const frame = requestAnimationFrame(reposition);

    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
    };
  }, [open, reposition, hide]);

  useEffect(() => () => window.clearTimeout(timerRef.current), []);

  if (!content) return children;

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex"
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocusCapture={show}
        onBlurCapture={hide}
        onPointerDown={hide}
      >
        {children}
      </span>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={tooltipRef}
                role="tooltip"
                initial={{ opacity: 0, scale: 0.95, y: side === 'top' ? 3 : -3 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, transition: { duration: 0.1 } }}
                transition={{ duration: 0.14, ease: [0.16, 1, 0.3, 1] }}
                style={{ top: coords.top, left: coords.left }}
                className={cn(
                  'pointer-events-none fixed z-[90] max-w-[16rem] rounded-lg',
                  'bg-surface-sunken px-2.5 py-1.5 text-center text-[11.5px] font-medium leading-snug text-ink ring-1 ring-line-strong',
                  'shadow-lg shadow-black/50',
                  className
                )}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

export default Tooltip;
