/**
 * Assay Office primitives.
 * Depth comes from a 1px rule, a tonal step, and spacing. Never a shadow.
 * Radius is 0 everywhere except a 2px punch on inline chips.
 */
import React from 'react';
import { Icon, IconName, Delta } from './Icon';
import { toneFor } from '../utils/format';

/* ------------------------------ Panel ------------------------------ */

export function Panel({
  children, className = '', tone = 'surface', as: Tag = 'section',
}: {
  children: React.ReactNode; className?: string;
  tone?: 'surface' | 'ground' | 'sunken'; as?: React.ElementType;
}) {
  const bg = tone === 'surface' ? 'bg-[var(--surface)]'
    : tone === 'sunken' ? 'bg-[var(--surface-sunken)]' : 'bg-[var(--ground)]';
  return (
    <Tag className={`${bg} border border-[var(--rule-hair)] ${className}`}>
      {children}
    </Tag>
  );
}

export function PanelHead({
  label, children, right,
}: { label: string; children?: React.ReactNode; right?: React.ReactNode }) {
  return (
    <header className="flex items-baseline justify-between gap-4 border-b border-[var(--rule-hair)] px-4 py-3">
      <div className="min-w-0">
        <h2 className="t-label text-[var(--ink-tertiary)]">{label}</h2>
        {children ? <div className="mt-1 t-body-m text-[var(--ink-secondary)]">{children}</div> : null}
      </div>
      {right ? <div className="flex-none">{right}</div> : null}
    </header>
  );
}

/* ------------------------------ Rule ------------------------------- */

export function Rule({ strong = false, vertical = false, className = '' }:
  { strong?: boolean; vertical?: boolean; className?: string }) {
  const c = strong ? 'var(--rule-strong)' : 'var(--rule-hair)';
  return vertical
    ? <div role="separator" aria-orientation="vertical" className={`w-px self-stretch ${className}`} style={{ background: c }} />
    : <div role="separator" className={`h-px w-full ${className}`} style={{ background: c }} />;
}

/* ----------------------------- Button ------------------------------ */

type ButtonVariant = 'brass' | 'ruled' | 'quiet';

export function Button({
  variant = 'ruled', icon, children, className = '', ...rest
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; icon?: IconName }) {
  const base =
    't-label inline-flex items-center justify-center gap-2 px-4 h-10 ' +
    'transition-colors duration-[var(--dur-hover)] disabled:opacity-40 disabled:cursor-not-allowed';
  const styles: Record<ButtonVariant, string> = {
    brass:
      'bg-[var(--brass)] text-[var(--ground)] border border-[var(--brass)] ' +
      'hover:bg-[var(--brass-pressed)] hover:border-[var(--brass-pressed)]',
    ruled:
      'bg-transparent text-[var(--ink)] border border-[var(--rule-strong)] ' +
      'hover:bg-[var(--surface-sunken)] hover:border-[var(--ink-tertiary)]',
    quiet:
      'bg-transparent text-[var(--ink-secondary)] border border-transparent px-2 ' +
      'hover:text-[var(--ink)] hover:bg-[var(--surface-sunken)]',
  };
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...rest}>
      {icon ? <Icon name={icon} size={16} /> : null}
      {children}
    </button>
  );
}

/* ------------------------------ Badge ------------------------------ */

export function Badge({
  children, tone = 'neutral',
}: { children: React.ReactNode; tone?: 'neutral' | 'brass' | 'verdigris' | 'oxblood' | 'stale' }) {
  const map = {
    neutral: 'text-[var(--ink-secondary)] border-[var(--rule-strong)]',
    brass: 'text-[var(--brass)] border-[var(--brass)]',
    verdigris: 'text-[var(--verdigris)] border-[var(--verdigris)]',
    oxblood: 'text-[var(--oxblood)] border-[var(--oxblood)]',
    stale: 'text-[var(--stale)] border-[var(--stale)]',
  } as const;
  return (
    <span className={`t-label-s inline-flex items-center border px-1.5 py-0.5 ${map[tone]}`} style={{ borderRadius: 2 }}>
      {children}
    </span>
  );
}

/* --------------------------- Signed value --------------------------- */

/** Meaning never rides on color alone: the glyph and the sign carry it too. */
export function Signed({ value, render, className = '' }:
  { value: number; render: (v: number) => string; className?: string }) {
  const tone = toneFor(value);
  const color = tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)';
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`} style={{ color }}>
      <Delta value={value} />
      <span>{render(value)}</span>
    </span>
  );
}

/* ------------------------------ Field ------------------------------ */

export function Field({
  label, hint, error, children, htmlFor,
}: { label: string; hint?: string; error?: string; children: React.ReactNode; htmlFor?: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="t-label text-[var(--ink-tertiary)]">{label}</label>
      {children}
      {error ? (
        <p className="t-label-s text-[var(--oxblood)] border-l-0 pt-1" role="alert">{error}</p>
      ) : hint ? (
        <p className="t-label-s text-[var(--ink-tertiary)] pt-1">{hint}</p>
      ) : null}
    </div>
  );
}

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className = '', ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={`t-ui h-10 w-full border border-[var(--rule-strong)] bg-[var(--ground)] px-3 text-[var(--ink)]
          placeholder:text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)]
          hover:border-[var(--ink-tertiary)] ${className}`}
        {...rest}
      />
    );
  }
);

/** Native chrome removed; the caret is ours. */
export function Select({ className = '', children, ...rest }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className="relative inline-flex items-center">
      <select
        className={`t-ui h-9 appearance-none border border-[var(--rule-strong)] bg-[var(--ground)] pl-3 pr-8
          text-[var(--ink)] transition-colors duration-[var(--dur-hover)] hover:border-[var(--ink-tertiary)] ${className}`}
        {...rest}
      >
        {children}
      </select>
      <Icon name="caret-down" size={14} className="pointer-events-none absolute right-2 text-[var(--ink-tertiary)]" />
    </span>
  );
}

/** A struck square. */
export function Checkbox({ label, id, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label htmlFor={id} className="group inline-flex cursor-pointer items-center gap-2.5">
      <span className="relative inline-flex h-4 w-4 flex-none items-center justify-center border border-[var(--rule-strong)]
        transition-colors duration-[var(--dur-hover)] group-hover:border-[var(--ink-tertiary)]">
        <input id={id} type="checkbox" className="peer absolute inset-0 cursor-pointer opacity-0" {...rest} />
        <span className="hidden h-2.5 w-2.5 bg-[var(--brass)] peer-checked:block" />
      </span>
      <span className="t-ui text-[var(--ink-secondary)]">{label}</span>
    </label>
  );
}

/** A struck circle. */
export function Radio({ label, id, ...rest }: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label htmlFor={id} className="group inline-flex cursor-pointer items-center gap-2.5">
      <span className="relative inline-flex h-4 w-4 flex-none items-center justify-center rounded-full border
        border-[var(--rule-strong)] transition-colors duration-[var(--dur-hover)] group-hover:border-[var(--ink-tertiary)]">
        <input id={id} type="radio" className="peer absolute inset-0 cursor-pointer opacity-0" {...rest} />
        <span className="hidden h-2 w-2 rounded-full bg-[var(--brass)] peer-checked:block" />
      </span>
      <span className="t-ui text-[var(--ink-secondary)]">{label}</span>
    </label>
  );
}

/* ------------------------- Universal states ------------------------- */

/** Never blank a figure. Last known value, dimmed, over a stale rule. */
export function Stale({ children, age }: { children: React.ReactNode; age: string }) {
  return (
    <span className="inline-flex flex-col items-start gap-0.5">
      <span style={{ opacity: 0.6 }}>{children}</span>
      <span className="h-px w-full" style={{ background: 'var(--stale)' }} />
      <span className="t-label-s text-[var(--stale)]">STALE {age}</span>
    </span>
  );
}

/** Determinate rule across the top of the viewport. No spinner, no skeleton. */
export function LoadRule() {
  return (
    <div className="fixed inset-x-0 top-0 z-50 h-0.5" role="progressbar" aria-label="Loading">
      <div className="load-rule h-full w-full" style={{ background: 'var(--brass)' }} />
    </div>
  );
}

export function Empty({ line, action }: { line: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-start gap-4 border border-[var(--rule-hair)] px-6 py-10">
      <p className="t-body-m text-[var(--ink-secondary)]">{line}</p>
      {action}
    </div>
  );
}

export function InlineError({ children }: { children: React.ReactNode }) {
  return (
    <div role="alert" className="flex items-start gap-2 border-t border-[var(--oxblood)] pt-2">
      <Icon name="warning" size={14} className="mt-0.5 flex-none text-[var(--oxblood)]" />
      <p className="t-label text-[var(--oxblood)]">{children}</p>
    </div>
  );
}

/* ------------------------------ Table ------------------------------ */

export function Table({ caption, children, dense = false }:
  { caption: string; children: React.ReactNode; dense?: boolean }) {
  return (
    <div className="w-full overflow-x-auto border border-[var(--rule-hair)]">
      <table className={`w-full border-collapse ${dense ? 't-data-s' : 't-data-m'}`}>
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export function Th({
  children, numeric = false, sort, onSort, scope = 'col', className = '',
}: {
  children: React.ReactNode; numeric?: boolean; className?: string;
  sort?: 'none' | 'ascending' | 'descending'; onSort?: () => void; scope?: 'col' | 'row';
}) {
  return (
    <th
      scope={scope}
      aria-sort={sort}
      className={`t-label-s sticky top-0 z-10 whitespace-nowrap border-b border-[var(--rule-strong)]
        bg-[var(--surface)] px-2 py-2 text-[var(--ink-tertiary)] ${numeric ? 'text-right' : 'text-left'} ${className}`}
    >
      {onSort ? (
        <button
          onClick={onSort}
          className={`inline-flex items-center gap-1 transition-colors duration-[var(--dur-hover)]
            hover:text-[var(--ink)] ${numeric ? 'flex-row-reverse' : ''}`}
        >
          {children}
          <Icon name={sort === 'ascending' ? 'sort-asc' : sort === 'descending' ? 'sort-desc' : 'sort'} size={12} />
        </button>
      ) : children}
    </th>
  );
}

export function Td({ children, numeric = false, className = '' }:
  { children: React.ReactNode; numeric?: boolean; className?: string }) {
  return (
    <td className={`whitespace-nowrap border-b border-[var(--rule-hair)] px-2 ${numeric ? 'text-right' : 'text-left'} ${className}`}>
      {children}
    </td>
  );
}

/** Alternating rows use the sunken tone. Hover shifts tone only. */
export function Tr({ children, onClick, selected = false, height = 36 }:
  { children: React.ReactNode; onClick?: () => void; selected?: boolean; height?: number }) {
  return (
    <tr
      onClick={onClick}
      style={{ height }}
      className={`odd:bg-[var(--surface)] even:bg-[var(--surface-sunken)]
        transition-colors duration-[var(--dur-hover)]
        ${onClick ? 'cursor-pointer hover:bg-[var(--brass-wash)]' : ''}
        ${selected ? 'bg-[var(--brass-wash)]' : ''}`}
    >
      {children}
    </tr>
  );
}
