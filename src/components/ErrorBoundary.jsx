import { Component } from 'react';
import { RefreshCw, ShieldAlert } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Replace with your observability provider (Sentry, Highlight, etc.)
    console.error('[TaskFlow] Unhandled UI error:', error, info?.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex min-h-dvh items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-7 text-center shadow-lg">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20">
            <ShieldAlert className="size-6" />
          </span>

          <h1 className="mt-4 text-lg font-semibold tracking-tightest text-ink-strong">
            Something broke unexpectedly
          </h1>
          <p className="mt-1.5 text-pretty text-[13px] leading-relaxed text-ink-muted">
            The workspace hit an unexpected error. Your data is safe — reloading usually
            fixes this instantly.
          </p>

          {this.state.error?.message && (
            <pre className="mt-4 max-h-28 overflow-auto rounded-xl border border-line bg-surface-muted p-3 text-left font-mono text-[11px] leading-relaxed text-ink-subtle">
              {this.state.error.message}
            </pre>
          )}

          <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
            <Button variant="secondary" onClick={this.handleReset} fullWidth>
              Try again
            </Button>
            <Button onClick={this.handleReload} leftIcon={<RefreshCw />} fullWidth>
              Reload workspace
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
