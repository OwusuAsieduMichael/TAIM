import { AlertTriangle } from 'lucide-react';
import { Component, type ErrorInfo, type ReactNode } from 'react';

type Props = { children: ReactNode };

type State = { err: Error | null };

export class StudentErrorBoundary extends Component<Props, State> {
  state: State = { err: null };

  static getDerivedStateFromError(err: Error): State {
    return { err };
  }

  componentDidCatch(err: Error, info: ErrorInfo) {
    console.error('[StudentErrorBoundary]', err, info.componentStack);
  }

  render() {
    if (this.state.err) {
      return (
        <div className="mx-auto max-w-lg px-4 py-16 sm:max-w-2xl sm:px-6">
          <div className="rounded-2xl border border-[var(--color-warning)]/40 bg-[var(--color-card)] p-6 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-warning)]/15">
              <AlertTriangle className="h-7 w-7 text-[var(--color-warning)]" strokeWidth={1.75} />
            </div>
            <h1 className="mt-4 text-lg font-semibold text-[var(--color-foreground)]">Something went wrong</h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted)]">
              This section hit an unexpected error. Your data is still safe — try loading again.
            </p>
            <button
              type="button"
              onClick={() => this.setState({ err: null })}
              className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--color-primary)] px-6 text-sm font-semibold text-[var(--color-primary-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Try again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
