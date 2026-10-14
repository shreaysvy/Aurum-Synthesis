/**
 * Number formatting is a design surface in this product.
 * Indian grouping throughout. Signs are DERIVED from the value, never
 * prefixed in a template (the old build rendered "+Rs -3,300").
 */

const inr0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
const inr2 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const plain0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });

export const RUPEE = '₹';

/** Sign derived from value. Zero takes neither sign. */
export function sign(n: number): '' | '+' | '-' {
  if (n === 0 || Object.is(n, -0)) return '';
  return n > 0 ? '+' : '-';
}

/** Currency, Indian grouping, derived sign. `signed` adds + for positives. */
export function inr(n: number, opts: { decimals?: 0 | 2; signed?: boolean } = {}): string {
  const { decimals = 2, signed = false } = opts;
  const fmt = decimals === 0 ? inr0 : inr2;
  const abs = Math.abs(n);
  const s = signed ? sign(n) : n < 0 ? '-' : '';
  return `${s}${RUPEE}${fmt.format(abs)}`;
}

/** Lakh and crore abbreviation for summary contexts. Full value goes in title. */
export function inrShort(n: number, opts: { signed?: boolean } = {}): string {
  const { signed = false } = opts;
  const abs = Math.abs(n);
  const s = signed ? sign(n) : n < 0 ? '-' : '';
  if (abs >= 1e7) return `${s}${RUPEE}${(abs / 1e7).toFixed(2)}Cr`;
  if (abs >= 1e5) return `${s}${RUPEE}${(abs / 1e5).toFixed(2)}L`;
  return `${s}${RUPEE}${inr0.format(abs)}`;
}

/** Basis points. Two decimals, derived sign. Render the suffix separately. */
export function bps(n: number, signed = true): string {
  const s = signed ? sign(n) : n < 0 ? '-' : '';
  return `${s}${Math.abs(n).toFixed(2)}`;
}

/** Percent. Two decimals in analytics, one in summary. */
export function pct(n: number, decimals: 1 | 2 = 2, signed = true): string {
  const s = signed ? sign(n) : n < 0 ? '-' : '';
  return `${s}${Math.abs(n).toFixed(decimals)}%`;
}

/** Z-score. Always two decimals, always signed. */
export function zscore(n: number): string {
  return `${sign(n)}${Math.abs(n).toFixed(2)}`;
}

/** Plain integer with Indian grouping (lots, volume, open interest). */
export function count(n: number): string {
  return plain0.format(n);
}

/** HH:mm:ss IST */
export function istTime(d: Date = new Date()): string {
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    timeZone: 'Asia/Kolkata', hour12: false,
  }) + ' IST';
}

/** Elapsed, for the staleness marker. */
export function since(d: Date, now: Date = new Date()): string {
  const s = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  return `${Math.floor(s / 3600)}h`;
}

/** mm:ss countdown. */
export function clock(totalSeconds: number): string {
  const m = Math.floor(Math.max(0, totalSeconds) / 60);
  const s = Math.max(0, totalSeconds) % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

/** Semantic token name for a signed value. Never color alone: pair with Delta. */
export function toneFor(n: number): 'verdigris' | 'oxblood' | 'ink-3' {
  if (n > 0) return 'verdigris';
  if (n < 0) return 'oxblood';
  return 'ink-3';
}
