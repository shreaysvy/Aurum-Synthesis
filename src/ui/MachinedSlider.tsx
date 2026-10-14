/**
 * A machined track with engraved tick marks and a brass indicator.
 * No rounded thumb, no gradient fill, no track glow.
 */
import { useId } from 'react';

export function MachinedSlider({
  label, value, min, max, step, onChange, format, unit,
}: {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (n: number) => void; format: (n: number) => string; unit?: string;
}) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  const ticks = 9;

  return (
    <div className="px-4 py-4">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="t-label text-[var(--ink-tertiary)]">{label}</label>
        <span className="flex items-baseline gap-1.5">
          <input
            type="number"
            value={value}
            min={min}
            max={max}
            step={step}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, n)));
            }}
            aria-label={`${label}, numeric entry`}
            className="t-data-m w-28 border border-[var(--rule-hair)] bg-[var(--ground)] px-2 py-0.5 text-right
              text-[var(--ink)] transition-colors duration-[var(--dur-hover)] hover:border-[var(--ink-tertiary)]"
          />
          {unit ? <span className="t-label-s text-[var(--ink-tertiary)]">{unit}</span> : null}
        </span>
      </div>

      <div className="relative mt-4 h-9">
        {/* Engraved ticks */}
        <div className="absolute inset-x-0 top-0 flex justify-between" aria-hidden="true">
          {Array.from({ length: ticks }, (_, i) => (
            <span key={i} className="w-px" style={{ height: i % 4 === 0 ? 9 : 5, background: i % 4 === 0 ? 'var(--rule-strong)' : 'var(--rule-hair)' }} />
          ))}
        </div>

        {/* Track */}
        <div className="absolute inset-x-0 top-[14px] h-px" style={{ background: 'var(--rule-strong)' }} aria-hidden="true" />
        {/* Filled run, a solid tone not a gradient */}
        <div className="absolute top-[13px] left-0 h-[3px]" style={{ width: `${pct}%`, background: 'var(--brass)' }} aria-hidden="true" />
        {/* Indicator */}
        <div className="absolute top-[6px] h-4 w-0.5" style={{ left: `calc(${pct}% - 1px)`, background: 'var(--brass-pressed)' }} aria-hidden="true" />

        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-x-0 top-0 h-7 w-full cursor-pointer opacity-0"
        />
      </div>

      <div className="flex items-baseline justify-between">
        <span className="t-label-s text-[var(--stale)]">{format(min)}</span>
        <span className="t-label-s text-[var(--stale)]">{format(max)}</span>
      </div>
    </div>
  );
}
