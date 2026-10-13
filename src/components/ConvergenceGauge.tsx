import React from 'react';
import { Clock, Target, ArrowUpRight, ShieldCheck, Zap } from 'lucide-react';
import { ConvergenceState } from '../types/market';

interface ConvergenceGaugeProps {
  state: ConvergenceState;
  onExecutePrompt: () => void;
}

export const ConvergenceGauge: React.FC<ConvergenceGaugeProps> = ({
  state,
  onExecutePrompt,
}) => {
  // Semi-circle gauge math
  const radius = 145;
  const cx = 190;
  const cy = 180;
  const strokeWidth = 14;

  const angleDeg = 180 + (state.pressurePercent / 100) * 180;
  const angleRad = (angleDeg * Math.PI) / 180;

  const needleLength = 120;
  const needleX = cx + needleLength * Math.cos(angleRad);
  const needleY = cy + needleLength * Math.sin(angleRad);

  const isGolden = state.zone === 'GOLDEN';
  const isWarning = state.zone === 'WARNING';

  return (
    <div
      className={`relative flex flex-col justify-between overflow-hidden rounded-2xl border p-8 lg:p-9 transition-all duration-300 backdrop-blur-xl ${
        isGolden
          ? 'border-[#FFD700]/40 bg-[#0C0F17]/80 shadow-[0_0_35px_rgba(255,215,0,0.12)]'
          : isWarning
          ? 'border-amber-500/30 bg-[#0C0F17]/80'
          : 'border-white/[0.08] bg-[#0A0D14]/80'
      }`}
    >
      {/* Background ambient gold aura */}
      {isGolden && (
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#FFD700]/10 blur-3xl" />
      )}

      {/* Header Info - Clean & Spacious */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              STATISTICAL ARBITRAGE ORACLE
            </span>
            <span
              className={`rounded-md px-2.5 py-0.5 text-[11px] font-bold uppercase ${
                isGolden
                  ? 'bg-[#FFD700]/15 text-[#FFD700]'
                  : isWarning
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-white/10 text-[#A1A1AA]'
              }`}
            >
              {isGolden
                ? '⚡ GOLDEN ALPHA ZONE'
                : isWarning
                ? '⚠️ TRANSITION ZONE'
                : '🔕 DEFENSIVE SILENCE (NOISE FILTER)'}
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-[#F8F9FA] tracking-tight">
            Convergence Pressure Gauge
          </h2>
          <p className="mt-1 text-xs text-[#888888] max-w-md">
            Measures cross-contract basis mispricing intensity against the historical mean-reversion corridor. Suppresses false alerts when edge is below friction.
          </p>
        </div>

        {/* Action Prompt */}
        <button
          onClick={onExecutePrompt}
          className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-bold transition-all ${
            isGolden
              ? 'border-[#FFD700] bg-[#FFD700]/10 text-[#FFD700] hover:bg-[#FFD700]/20 shadow-[0_0_15px_rgba(255,215,0,0.15)]'
              : 'border-white/[0.1] bg-white/[0.04] text-[#A1A1AA] hover:text-[#F8F9FA]'
          }`}
        >
          <span>Route Arbitrage Leg</span>
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>

      {/* Semi-circular SVG Gauge (Enlarged & Beautiful) */}
      <div className="relative my-6 flex flex-col items-center justify-center">
        <svg
          viewBox="0 0 380 230"
          className="w-full max-w-[390px] drop-shadow-lg overflow-visible"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#27272A" />
              <stop offset="50%" stopColor="#404040" />
              <stop offset="70%" stopColor="#D97706" />
              <stop offset="85%" stopColor="#FFD700" />
              <stop offset="100%" stopColor="#FFE55C" />
            </linearGradient>

            <filter id="goldNeedleGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#FFD700" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background Track */}
          <path
            d="M 45 180 A 145 145 0 0 1 335 180"
            fill="none"
            stroke="#161B26"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Value Arc */}
          <path
            d="M 45 180 A 145 145 0 0 1 335 180"
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeDasharray={Math.PI * radius}
            strokeDashoffset={(Math.PI * radius * (100 - state.pressurePercent)) / 100}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />

          {/* Ticks and Zone Indicators */}
          <line x1="126" y1="70" x2="134" y2="84" stroke="#52525B" strokeWidth="2" />
          <line x1="254" y1="70" x2="246" y2="84" stroke="#F59E0B" strokeWidth="2.5" />

          {/* Zone Labels */}
          <text x="55" y="208" fill="#71717A" fontSize="11" fontFamily="monospace" textAnchor="middle">
            0σ (NOISE)
          </text>
          <text x="190" y="120" fill="#A1A1AA" fontSize="11" fontFamily="monospace" textAnchor="middle">
            1.5σ (WARNING)
          </text>
          <text x="325" y="208" fill="#FFD700" fontSize="11" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
            3.0σ (ALPHA)
          </text>

          {/* Needle Base Hub */}
          <circle cx={cx} cy={cy} r="15" fill="#141923" stroke="#2D3748" strokeWidth="2.5" />
          <circle cx={cx} cy={cy} r="5.5" fill={isGolden ? '#FFD700' : '#A1A1AA'} />

          {/* The Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needleX}
            y2={needleY}
            stroke={isGolden ? '#FFD700' : '#E4E4E7'}
            strokeWidth={isGolden ? '3.5' : '2.5'}
            strokeLinecap="round"
            filter={isGolden ? 'url(#goldNeedleGlow)' : undefined}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Central Readout overlay */}
        <div className="mt-[-25px] flex flex-col items-center">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-4xl font-extrabold tabular-nums tracking-tight text-[#F8F9FA]">
              {state.currentZScore.toFixed(2)}σ
            </span>
            <span className="text-xs font-bold text-[#71717A]">Z-SCORE</span>
          </div>

          <div className="mt-1.5 flex items-center gap-2 text-xs">
            <span className="text-[#888888]">Mispricing Basis:</span>
            <span className="font-mono font-bold tabular-nums text-[#FFD700]">
              +₹{state.mispricingInr.toFixed(1)} / 10g
            </span>
          </div>
        </div>
      </div>

      {/* Hero Sub-Bar: Countdown Timer & Half-Life Attribution (Generous Spacing) */}
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/[0.08] pt-6">
        {/* Dynamic Countdown Timer */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#71717A]">
            <Clock className="h-3.5 w-3.5 text-[#FFD700]" />
            <span>ESTIMATED WINDOW CLOSURE</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-[#FFD700] gold-text-glow tabular-nums">
              {state.estimatedClosureTime}
            </span>
            <span className="text-xs text-[#71717A]">
              Half-Life: {state.halfLifeHours}h
            </span>
          </div>
        </div>

        {/* Historical Hit-Rate & Edge Validation */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#71717A]">
            <Target className="h-3.5 w-3.5 text-emerald-400" />
            <span>HISTORICAL CONVERGENCE HIT</span>
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <span className="font-mono text-2xl font-extrabold tracking-tight text-emerald-400 tabular-nums">
              {state.historicalHitRate}%
            </span>
            <span className="text-xs text-[#71717A]">
              N = 94 Sessions
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
