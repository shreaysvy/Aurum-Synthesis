import React, { useState } from 'react';
import {
  Activity,
  Play,
  Pause,
  Zap,
  Layers,
  TrendingUp,
  FileText,
  Sliders,
  ShieldCheck,
  Volume2,
  VolumeX,
  Compass,
  Palette,
  Calendar,
} from 'lucide-react';
import { ContractPriceTick, MacroVariables } from '../types/market';
import { calculateSyntheticFairValue } from '../utils/pricingEngine';
import { sound } from '../utils/audioEngine';
import { AmbientTheme } from './AmbientBackground';
import { OperatorBadge } from './InstitutionalAuthGateway';

interface HeaderProps {
  macro: MacroVariables;
  ticks?: Record<string, ContractPriceTick>;
  goldmTick: ContractPriceTick;
  isLive: boolean;
  setIsLive: (live: boolean) => void;
  tickCount?: number;
  lastTickTime?: Date;
  tickDeltas?: Record<string, number>;
  activeView: 'COMMAND' | 'CROSS_RV' | 'TERM_STRUCTURE' | 'LIFECYCLE' | 'BACKTEST' | 'BHAVCOPY' | 'SCENARIO';
  setActiveView: (view: 'COMMAND' | 'CROSS_RV' | 'TERM_STRUCTURE' | 'LIFECYCLE' | 'BACKTEST' | 'BHAVCOPY' | 'SCENARIO') => void;
  triggerVolatilityShock: () => void;
  blotterCount: number;
  onOpenBlotter: () => void;
  theme: AmbientTheme;
  setTheme: (theme: AmbientTheme) => void;
}

export const Header: React.FC<HeaderProps> = ({
  macro,
  ticks,
  goldmTick,
  isLive,
  setIsLive,
  tickCount = 0,
  lastTickTime = new Date(),
  tickDeltas = { GOLDM: 1.2, GOLDTEN: 1.5, GOLDGUINEA: 0.8, GOLDPETAL: 0.4, COMEX: 0.35, USDINR: 0.004 },
  activeView,
  setActiveView,
  triggerVolatilityShock,
  blotterCount,
  onOpenBlotter,
  theme,
  setTheme,
}) => {
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(true);
  const sfv995 = calculateSyntheticFairValue(macro, 995);
  const gapInr = goldmTick.quotePrice - sfv995;
  const gapPercent = (gapInr / sfv995) * 100;
  const isDiscount = gapInr < 0;

  const toggleAudio = () => {
    const nextState = !isAudioEnabled;
    setIsAudioEnabled(nextState);
    sound.enabled = nextState;
    if (nextState) sound.playClick();
  };

  const cycleTheme = () => {
    sound.playClick();
    if (theme === 'CELESTIAL') setTheme('AURUM');
    else if (theme === 'AURUM') setTheme('VELVET');
    else setTheme('CELESTIAL');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/[0.06] bg-[#07090E]/85 backdrop-blur-xl">
      {/* Top Spacious Institutional Bar */}
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-6 lg:px-10 gap-4">
        {/* Brand Lockup */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#FFD700]/30 bg-[#FFD700]/10 shadow-[0_0_15px_rgba(255,215,0,0.15)]">
            <span className="font-mono text-sm font-extrabold text-[#FFD700]">Au</span>
          </div>
          <div>
            <span className="text-sm sm:text-base font-extrabold tracking-[0.22em] text-[#F8F9FA] uppercase leading-tight">
              AURUM SYNTHESIS
            </span>
            <div className="text-[10px] sm:text-[11px] font-medium tracking-wider text-[#71717A] leading-tight">
              COMMODITY INTELLIGENCE ORACLE
            </div>
          </div>
        </div>

        {/* The Core Parity Bar: Condensed to 4 Critical Indicators */}
        <div className="hidden lg:flex items-center gap-5 xl:gap-6 rounded-xl border border-white/[0.08] bg-black/50 px-5 py-2 shadow-inner backdrop-blur-md">
          {/* 1. SFV PARITY */}
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
              SFV PARITY
            </span>
            <span className="font-mono text-sm sm:text-base font-bold tabular-nums text-[#F8F9FA]">
              ₹{sfv995.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <span className="h-4 w-px bg-white/10" aria-hidden="true" />

          {/* 2. MCX GOLDM */}
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
              MCX GOLDM
            </span>
            <div className="flex items-center gap-1.5 font-mono text-sm sm:text-base font-bold tabular-nums text-[#F8F9FA]">
              <span>
                ₹{goldmTick.quotePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition-colors ${
                  (tickDeltas?.GOLDM ?? 0) >= 0
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/20 text-rose-400'
                }`}
              >
                {(tickDeltas?.GOLDM ?? 0) >= 0 ? '+' : '-'}₹{Math.abs(tickDeltas?.GOLDM ?? 0).toFixed(2)}
              </span>
            </div>
          </div>

          <span className="h-4 w-px bg-white/10" aria-hidden="true" />

          {/* 3. ARBITRAGE GAP */}
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#71717A]">
              ARBITRAGE GAP
            </span>
            <span
              className={`font-mono text-sm sm:text-base font-bold tabular-nums ${
                isDiscount ? 'text-[#FFD700] gold-text-glow' : 'text-[#EF4444]'
              }`}
            >
              {isDiscount ? '-' : '+'}₹{Math.abs(gapInr).toFixed(2)} ({gapPercent.toFixed(2)}%)
            </span>
          </div>

          <span className="h-4 w-px bg-white/10" aria-hidden="true" />

          {/* 4. ALPHA WINDOW */}
          <div className="flex items-center gap-2 rounded-lg bg-[#FFD700]/10 border border-[#FFD700]/25 px-2.5 py-1 text-[11px] font-bold text-[#FFD700]">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFD700] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFD700]" />
            </span>
            <span className="tracking-wider">ALPHA WINDOW</span>
          </div>
        </div>

        {/* Right Primary Action & Theme Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
          {/* Background Theme Switcher */}
          <button
            onClick={cycleTheme}
            title={`Atmosphere theme: ${theme} (Click to change)`}
            className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:border-[#FFD700]/50 hover:text-[#F8F9FA] transition-all"
          >
            <Palette className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="hidden sm:inline capitalize">
              {theme === 'CELESTIAL' ? 'Celestial Noir' : theme === 'AURUM' ? 'Aurum Gold' : 'Velvet Smoke'}
            </span>
          </button>

          {/* Volatility Shock Injection Button */}
          <button
            onClick={triggerVolatilityShock}
            title="Inject US CPI volatility shock to test dynamic convergence"
            className="flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:border-[#FFD700]/50 hover:text-[#FFD700] transition-colors"
          >
            <Zap className="h-3.5 w-3.5 text-[#FFD700]" />
            <span className="hidden sm:inline">Inject Shock</span>
          </button>

          {/* Stream Pause / Play */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
              isLive
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
            }`}
          >
            {isLive ? (
              <>
                <Pause className="h-3 w-3" />
                <span className="hidden sm:inline">Live Feed</span>
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                <span className="hidden sm:inline">Paused</span>
              </>
            )}
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleAudio}
            title={isAudioEnabled ? 'Mute acoustic chime' : 'Enable acoustic chime'}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.03] text-[#A1A1AA] hover:text-[#F8F9FA] transition-colors"
          >
            {isAudioEnabled ? (
              <Volume2 className="h-3.5 w-3.5 text-[#FFD700]" />
            ) : (
              <VolumeX className="h-3.5 w-3.5 text-[#71717A]" />
            )}
          </button>

          {/* Execution Blotter Drawer Toggle */}
          <button
            onClick={onOpenBlotter}
            className="flex items-center gap-2 rounded-lg border border-[#FFD700]/30 bg-[#FFD700]/15 px-3.5 py-1.5 text-xs font-bold text-[#FFD700] hover:bg-[#FFD700]/25 transition-all shadow-[0_0_15px_rgba(255,215,0,0.12)]"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Blotter ({blotterCount})</span>
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tab Bar & Repositioned Operator Section */}
      <div className="mx-auto flex max-w-[1600px] items-center justify-between border-t border-white/[0.05] px-6 lg:px-10">
        <nav className="flex items-center gap-1.5 overflow-x-auto py-2 text-xs no-scrollbar">
          <button
            onClick={() => setActiveView('COMMAND')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'COMMAND'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <Activity className="h-3.5 w-3.5" />
            <span>Synthesis Command Center</span>
          </button>

          <button
            onClick={() => setActiveView('CROSS_RV')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'CROSS_RV'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Cross-Contract Relative Value</span>
          </button>

          <button
            onClick={() => setActiveView('TERM_STRUCTURE')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'TERM_STRUCTURE'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            <span>Term Structure & Carry Curve</span>
          </button>

          <button
            onClick={() => setActiveView('LIFECYCLE')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'LIFECYCLE'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Contract Lifecycle & Tender Calendar</span>
          </button>

          <button
            onClick={() => setActiveView('BACKTEST')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'BACKTEST'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Walk-Forward Backtesting</span>
          </button>

          <button
            onClick={() => setActiveView('SCENARIO')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'SCENARIO'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Stress Simulator</span>
          </button>

          <button
            onClick={() => setActiveView('BHAVCOPY')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-1.5 font-semibold transition-all whitespace-nowrap ${
              activeView === 'BHAVCOPY'
                ? 'border border-[#FFD700]/40 bg-[#FFD700]/10 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.15)]'
                : 'text-[#888888] hover:text-[#F8F9FA] hover:bg-white/[0.03]'
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>MCX Bhavcopy Inspector</span>
          </button>
        </nav>

        {/* Right Status Indicators & Repositioned Operator Badge */}
        <div className="flex items-center gap-4 shrink-0 pl-4 py-2 mr-4">
          {/* Muted Quiet Live Feed line */}
          <div className="hidden 2xl:flex items-center gap-2 text-[11px] font-mono text-[#71717A]">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-80" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="text-emerald-400/80 font-bold">LIVE FEED</span>
            <span>•</span>
            <span className="tabular-nums">
              {lastTickTime.toLocaleTimeString('en-IN', { hour12: false })}.{String(lastTickTime.getMilliseconds()).padStart(3, '0')} IST
            </span>
            <span>•</span>
            <span>Tick #{tickCount}</span>
          </div>

          {/* Exchange Latency Status */}
          <div className="hidden lg:flex items-center gap-2.5 text-xs font-mono text-[#71717A]">
            <span>COMEX/MCX REALTIME</span>
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              45ms
            </span>
          </div>

          {/* Operator Verified Badge repositioned to navigation tab row */}
          <OperatorBadge />
        </div>
      </div>
    </header>
  );
};
