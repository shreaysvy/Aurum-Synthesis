import React, { Component, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/primitives';

/** A mis-struck assay mark. The route that failed is stated plainly. */
function MisstruckSeal() {
  return (
    <svg width="72" height="72" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <circle cx="20" cy="20" r="18.25" stroke="var(--rule-strong)" strokeWidth="1.5" strokeDasharray="3 2" />
      <circle cx="21.4" cy="18.6" r="13.5" stroke="var(--rule-hair)" strokeWidth="1" />
      <path d="M12 24.5 L15.5 14 L24.5 14 L21 24.5 Z" stroke="var(--oxblood)" strokeWidth="1.25" strokeLinejoin="miter" transform="rotate(-6 20 20)" />
      <path d="M15.5 19.25 L24.5 19.25" stroke="var(--oxblood)" strokeWidth="1.25" transform="rotate(-6 20 20)" />
    </svg>
  );
}

export function NotFound() {
  const loc = useLocation();
  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <MisstruckSeal />
      <h1 className="t-display-l mt-8 text-[var(--ink)]">No record at this address</h1>
      <p className="t-data-m mt-4 border border-[var(--rule-hair)] bg-[var(--surface)] px-3 py-1.5 text-[var(--ink-tertiary)]">
        {loc.pathname}
      </p>
      <div className="mt-8 flex gap-3">
        <Link to="/"><Button variant="ruled">Return to the front page</Button></Link>
        <Link to="/command"><Button variant="brass">Open the terminal</Button></Link>
      </div>
    </main>
  );
}

export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
        <MisstruckSeal />
        <h1 className="t-display-l mt-8 text-[var(--ink)]">Something failed to render</h1>
        <p className="t-body-l mt-4 max-w-[52ch] text-[var(--ink-secondary)]">
          The view could not be drawn. Reloading usually clears it.
        </p>
        <p className="t-data-s mt-5 max-w-[60ch] break-all border border-[var(--rule-hair)] bg-[var(--surface)] px-3 py-2 text-[var(--ink-tertiary)]">
          {this.state.error.message}
        </p>
        <div className="mt-8">
          <Button variant="brass" onClick={() => window.location.reload()}>Reload</Button>
        </div>
      </main>
    );
  }
}
