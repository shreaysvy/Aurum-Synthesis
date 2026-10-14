/**
 * App chrome. A ruled masthead, a ledger-tab view switcher,
 * and the standing simulated-feed marker that must appear on every app view.
 */
import { NavLink, Link } from 'react-router-dom';
import { useState } from 'react';
import { Icon } from './Icon';
import { Rule } from './primitives';
import { useTheme } from './useTheme';
import { istTime } from '../utils/format';

export const APP_VIEWS = [
  { to: '/command', label: 'Command' },
  { to: '/cross-rv', label: 'Cross RV' },
  { to: '/term-structure', label: 'Term Structure' },
  { to: '/lifecycle', label: 'Lifecycle' },
  { to: '/backtest', label: 'Backtest' },
  { to: '/bhavcopy', label: 'Bhavcopy' },
  { to: '/scenario', label: 'Scenario' },
  { to: '/blotter', label: 'Blotter' },
];

/** The brass assay seal. Used as the product mark throughout. */
export function SealMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="18.25" stroke="var(--brass)" strokeWidth="1.5" />
      <circle cx="20" cy="20" r="13.5" stroke="var(--brass)" strokeWidth="1" />
      <path d="M12 24.5 L15.5 14 L24.5 14 L21 24.5 Z" stroke="var(--brass)" strokeWidth="1.25" strokeLinejoin="miter" />
      <path d="M15.5 19.25 L24.5 19.25" stroke="var(--brass)" strokeWidth="1.25" />
    </svg>
  );
}

export function SimulatedMarker() {
  return (
    <span className="t-label-s inline-flex items-center gap-1.5 text-[var(--stale)]" title="All market data in this application is generated, not received from any exchange.">
      <span className="inline-block h-1.5 w-1.5" style={{ background: 'var(--stale)' }} />
      Simulated feed
    </span>
  );
}

export function Masthead() {
  const { mode, cycle } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-[var(--ground)]">
      <div className="flex h-14 items-center gap-4 px-4">
        <Link to="/command" className="flex items-center gap-2.5">
          <SealMark size={26} />
          <span className="t-label text-[var(--ink)]">Aurum Synthesis</span>
        </Link>

        <div className="ml-auto flex items-center gap-4">
          <SimulatedMarker />
          <span className="t-data-s hidden text-[var(--ink-tertiary)] sm:inline">{istTime()}</span>
          <button
            onClick={cycle}
            className="t-label-s inline-flex h-8 items-center gap-1.5 px-2 text-[var(--ink-tertiary)]
              transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]"
            aria-label={`Theme: ${mode}. Activate to change.`}
          >
            <Icon name="theme" size={15} />
            <span className="hidden md:inline">{mode}</span>
          </button>
          <Link to="/account" className="text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]" aria-label="Account">
            <Icon name="account" size={18} />
          </Link>
          <button className="lg:hidden text-[var(--ink-tertiary)]" onClick={() => setOpen(!open)} aria-label="Views" aria-expanded={open}>
            <Icon name="menu" size={18} />
          </button>
        </div>
      </div>

      <Rule strong />

      {/* Ledger tabs. The active tab is struck in brass along its baseline. */}
      <nav aria-label="Views" className={`${open ? 'block' : 'hidden'} lg:block`}>
        <ul className="flex flex-col lg:flex-row lg:items-stretch">
          {APP_VIEWS.map((v) => (
            <li key={v.to} className="lg:border-r lg:border-[var(--rule-hair)]">
              <NavLink
                to={v.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `t-label block px-4 py-3 transition-colors duration-[var(--dur-hover)] ` +
                  (isActive
                    ? 'text-[var(--ink)] border-b-2 border-[var(--brass)]'
                    : 'text-[var(--ink-tertiary)] border-b-2 border-transparent hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)]')
                }
              >
                {v.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Rule />
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--rule-strong)] px-4 py-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex items-center gap-2.5">
          <SealMark size={22} />
          <span className="t-label text-[var(--ink-tertiary)]">Aurum Synthesis</span>
        </div>
        <nav aria-label="Legal and reference" className="flex flex-wrap gap-x-6 gap-y-2">
          {[
            { to: '/methodology', label: 'Methodology' },
            { to: '/risk', label: 'Risk disclosure' },
            { to: '/terms', label: 'Terms of service' },
            { to: '/privacy', label: 'Privacy policy' },
          ].map((l) => (
            <Link key={l.to} to={l.to} className="t-label text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
      <p className="t-label-s mt-6 max-w-prose text-[var(--stale)]">
        All market data shown is generated for demonstration. No figure represents an actual
        exchange quote. Nothing here constitutes investment advice.
      </p>
    </footer>
  );
}

export function SkipLink() {
  return (
    <a
      href="#main"
      className="t-label sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50
        focus:border focus:border-[var(--brass)] focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-[var(--ink)]"
    >
      Skip to content
    </a>
  );
}
