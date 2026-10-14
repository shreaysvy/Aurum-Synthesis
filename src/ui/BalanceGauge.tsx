/**
 * The convergence gauge as an assayer's balance.
 * Z-score drives the beam's tilt. It overshoots and settles with spring
 * physics. Crossing into the golden zone strikes the brass indicator once.
 */
import { motion, useSpring, useTransform } from 'motion/react';
import { useEffect, useRef, useState } from 'react';
import { ConvergenceState } from '../types/market';
import { Odometer } from './Odometer';
import { Badge } from './primitives';
import { inr, zscore, clock, pct } from '../utils/format';

const MAX_SIGMA = 3.5;

export function BalanceGauge({ state }: { state: ConvergenceState }) {
  const clamped = Math.max(-MAX_SIGMA, Math.min(MAX_SIGMA, state.currentZScore));
  const tilt = useSpring(0, { stiffness: 180, damping: 22, mass: 1 });
  const [struck, setStruck] = useState(false);
  const prevZone = useRef(state.zone);

  useEffect(() => {
    tilt.set((clamped / MAX_SIGMA) * 11); // degrees
  }, [clamped, tilt]);

  useEffect(() => {
    if (state.zone === 'GOLDEN' && prevZone.current !== 'GOLDEN') {
      setStruck(true);
      const t = setTimeout(() => setStruck(false), 400);
      return () => clearTimeout(t);
    }
    prevZone.current = state.zone;
  }, [state.zone]);

  const rotate = useTransform(tilt, (v) => `rotate(${v}deg)`);

  const zoneTone = state.zone === 'GOLDEN' ? 'brass' : state.zone === 'WARNING' ? 'oxblood' : 'neutral';

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-baseline justify-between gap-4 px-4 pt-4">
        <div>
          <p className="t-label text-[var(--ink-tertiary)]">Convergence pair</p>
          <p className="t-data-l mt-1 text-[var(--ink)]">{state.pairName}</p>
        </div>
        <Badge tone={zoneTone}>{state.zone} zone</Badge>
      </div>

      {/* ---- The balance ---- */}
      <div className="relative mx-4 mt-8 h-44">
        {/* Sigma scale, ruled */}
        <div className="absolute inset-x-0 top-0 flex justify-between">
          {[-3, -2, -1, 0, 1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <span className="h-2 w-px" style={{ background: Math.abs(s) >= 2 ? 'var(--rule-strong)' : 'var(--rule-hair)' }} />
              <span className="t-label-s text-[var(--ink-tertiary)]">{s > 0 ? `+${s}` : s}</span>
            </div>
          ))}
        </div>

        {/* Zone bands at 1.5 and 2.5 sigma */}
        <div className="absolute inset-x-0 top-8 h-px" style={{ background: 'var(--rule-hair)' }} />
        {[1.5, 2.5].map((s) => (
          <div key={s}>
            {[-1, 1].map((dir) => (
              <span
                key={dir}
                className="absolute top-6 h-4 w-px"
                style={{
                  background: s === 2.5 ? 'var(--brass)' : 'var(--rule-strong)',
                  left: `${50 + ((dir * s) / MAX_SIGMA) * 50}%`,
                }}
              />
            ))}
          </div>
        ))}

        {/* Fulcrum */}
        <div className="absolute left-1/2 top-[88px] -translate-x-1/2">
          <svg width="26" height="30" viewBox="0 0 26 30" fill="none" aria-hidden="true">
            <path d="M13 0 L25 29 L1 29 Z" stroke="var(--rule-strong)" strokeWidth="1.25" strokeLinejoin="miter" />
          </svg>
        </div>

        {/* Beam */}
        <motion.div
          className="absolute left-1/2 top-[86px] h-0.5 w-[78%] -translate-x-1/2 origin-center"
          style={{ transform: rotate, background: 'var(--ink)' }}
        >
          <span className="absolute -left-1 -top-[7px] block h-4 w-2" style={{ background: 'var(--ink-tertiary)' }} />
          <span className="absolute -right-1 -top-[7px] block h-4 w-2" style={{ background: 'var(--ink-tertiary)' }} />
        </motion.div>

        {/* Brass indicator, struck on entry to the golden zone */}
        <div
          className={`absolute top-[108px] ${struck ? 'stamp-in' : ''}`}
          style={{ left: `calc(${50 + (clamped / MAX_SIGMA) * 39}% - 1px)` }}
        >
          <span className="block h-7 w-0.5" style={{ background: 'var(--brass)' }} />
        </div>
      </div>

      {/* ---- Readouts ---- */}
      <dl className="mt-6 grid grid-cols-2 gap-px border-t border-[var(--rule-hair)] bg-[var(--rule-hair)] sm:grid-cols-4">
        {[
          { k: 'Z-score', v: zscore(state.currentZScore), wide: false },
          { k: 'Mispricing', v: inr(state.mispricingInr, { decimals: 0, signed: true }), wide: false },
          { k: 'Half-life', v: `${state.halfLifeHours.toFixed(1)}h`, wide: false },
          { k: 'Hit rate', v: pct(state.historicalHitRate, 1, false), wide: false },
        ].map((r) => (
          <div key={r.k} className="bg-[var(--surface)] px-4 py-3">
            <dt className="t-label-s text-[var(--ink-tertiary)]">{r.k}</dt>
            <dd className="t-data-l mt-1 text-[var(--ink)]">
              <Odometer value={r.v} />
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex items-baseline justify-between border-t border-[var(--rule-hair)] px-4 py-3">
        <span className="t-label text-[var(--ink-tertiary)]">Estimated closure</span>
        <span className="t-data-m text-[var(--brass)]">
          <Odometer value={clock(state.countdownSeconds)} />
        </span>
      </div>
    </div>
  );
}
