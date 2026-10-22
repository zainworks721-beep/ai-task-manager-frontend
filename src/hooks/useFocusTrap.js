import { useEffect } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

/**
 * Traps keyboard focus inside `ref` while `active`, restores focus to the
 * previously focused element on close, and exposes nothing to the a11y tree
 * outside the trap.
 */
export function useFocusTrap(ref, active = true) {
  useEffect(() => {
    const node = ref.current;
    if (!active || !node) return undefined;

    const previouslyFocused = document.activeElement;

    const getFocusable = () =>
      Array.from(node.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );

    const focusTimer = window.setTimeout(() => {
      const items = getFocusable();
      if (items.length > 0) {
        items[0].focus({ preventScroll: true });
      } else {
        node.setAttribute('tabindex', '-1');
        node.focus({ preventScroll: true });
      }
    }, 50);

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;

      const items = getFocusable();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first || !node.contains(document.activeElement)) {
          event.preventDefault();
          last.focus();
        }
      } else if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      node.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused && typeof previouslyFocused.focus === 'function') {
        previouslyFocused.focus({ preventScroll: true });
      }
    };
  }, [active, ref]);
}

export default useFocusTrap;
