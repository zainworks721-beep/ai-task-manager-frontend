import { AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '../../lib/cn';
import { Modal } from './Modal';
import { Button } from './Button';

/**
 * Destructive-action confirmation. Replaces window.confirm() everywhere.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete this task?',
  description = 'This action cannot be undone. The task will be permanently removed from your board.',
  confirmLabel = 'Delete task',
  cancelLabel = 'Keep task',
  loading = false,
  tone = 'danger',
}) {
  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      size="sm"
      dismissible={!loading}
      showClose={false}
      bodyClassName="px-5 py-5 sm:px-6"
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={loading} fullWidth>
            {cancelLabel}
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            loading={loading}
            leftIcon={<Trash2 />}
            fullWidth
          >
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="flex items-start gap-4">
        <span
          className={cn(
            'flex size-11 shrink-0 items-center justify-center rounded-2xl',
            tone === 'danger'
              ? 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20'
              : 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20'
          )}
          aria-hidden="true"
        >
          <AlertTriangle className="size-5" />
        </span>
        <div className="min-w-0 pt-0.5">
          <h2 className="text-[16px] font-semibold tracking-tightest text-ink-strong">
            {title}
          </h2>
          <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-ink-muted">
            {description}
          </p>
        </div>
      </div>
    </Modal>
  );
}

export default ConfirmDialog;
