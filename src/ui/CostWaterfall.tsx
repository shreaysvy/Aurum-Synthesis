/**
 * The deduction waterfall. The asymmetries are the point: STT lands on the
 * sell leg only, stamp duty on the buy leg only. Never collapse into "fees".
 */
import { Odometer } from './Odometer';
import { Rule } from './primitives';
import { inr } from '../utils/format';

export interface WaterfallStep {
  label: string;
  value: number;
  note?: string;
  emphasis?: boolean;
}

export function CostWaterfall({ gross, steps, net }:
  { gross: number; steps: WaterfallStep[]; net: number }) {
  const max = Math.max(Math.abs(gross), ...steps.map((s) => Math.abs(s.value)), Math.abs(net)) || 1;

  return (
    <div className="flex flex-col">
      <Row label="Gross spread" value={gross} max={max} tone="ink" />
      <Rule />
      {steps.map((s) => (
        <Row key={s.label} label={s.label} value={-Math.abs(s.value)} note={s.note} max={max} tone="oxblood" />
      ))}
      <Rule strong />
      <Row label="Net alpha" value={net} max={max} tone="brass" emphasis />
    </div>
  );
}

function Row({ label, value, note, max, tone, emphasis = false }:
  { label: string; value: number; note?: string; max: number; tone: 'ink' | 'oxblood' | 'brass'; emphasis?: boolean }) {
  const color = tone === 'brass' ? 'var(--brass)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink)';
  const width = `${(Math.abs(value) / max) * 100}%`;
  return (
    <div className="relative px-4 py-2.5">
      {/* Magnitude bar sits behind the row as a tonal wash, not a chart */}
      <span
        className="absolute inset-y-0 left-0 -z-0"
        style={{ width, background: tone === 'brass' ? 'var(--brass-wash)' : 'transparent' }}
        aria-hidden="true"
      />
      <div className="relative flex items-baseline justify-between gap-4">
        <span className="flex flex-col">
          <span className={emphasis ? 't-label text-[var(--ink)]' : 't-label text-[var(--ink-tertiary)]'}>{label}</span>
          {note ? <span className="t-label-s mt-0.5 text-[var(--stale)]">{note}</span> : null}
        </span>
        <span className={emphasis ? 't-data-l' : 't-data-m'} style={{ color }}>
          <Odometer value={inr(value, { decimals: 0, signed: true })} />
        </span>
      </div>
    </div>
  );
}
