import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  Receipt,
  Scale,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { ContractPriceTick, MCXContractSymbol } from '../types/market';
import {
  calculateArbitrageOpportunity,
  CONTRACT_SPECS,
} from '../utils/pricingEngine';
import { sound } from '../utils/audioEngine';

interface ExecutionBridgeProps {
  ticks: Record<MCXContractSymbol, ContractPriceTick>;
  onExecuteTrade: (
    longSymbol: MCXContractSymbol,
    shortSymbol: MCXContractSymbol,
    lots: number
  ) => void;
}

export const ExecutionBridge: React.FC<ExecutionBridgeProps> = ({
  ticks,
  onExecuteTrade,
}) => {
  const [longSymbol, setLongSymbol] = useState<MCXContractSymbol>('GOLDTEN');
  const [shortSymbol, setShortSymbol] = useState<MCXContractSymbol>('GOLDM');
  const [lotMultiplier, setLotMultiplier] = useState<number>(2);
  const [isSuccessAnimated, setIsSuccessAnimated] = useState<boolean>(false);

  const longQuote = ticks[longSymbol].quotePrice;
  const shortQuote = ticks[shortSymbol].quotePrice;

  const opportunity = calculateArbitrageOpportunity(
    longSymbol,
    shortSymbol,
    longQuote,
    shortQuote
  );

  const scaledGross = Math.round(opportunity.grossConvergenceProfit * lotMultiplier);
  const scaledFriction = Math.round(opportunity.totalFriction * lotMultiplier);
  const scaledTaxes = Math.round(opportunity.taxes * lotMultiplier);
  const scaledExchange = Math.round(opportunity.exchangeFees * lotMultiplier);
  const scaledSlippage = Math.round(opportunity.slippage * lotMultiplier);
  const scaledNetAlpha = Math.round(opportunity.netAlphaInr * lotMultiplier);
  const scaledMargin = Math.round(opportunity.requiredMargin * lotMultiplier);

  const handleLockInAlpha = () => {
    sound.playAlphaChime();
    setIsSuccessAnimated(true);
    onExecuteTrade(longSymbol, shortSymbol, opportunity.longLots * lotMultiplier);
    setTimeout(() => {
      setIsSuccessAnimated(false);
    }, 1800);
  };

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              THE EXECUTION BRIDGE
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
              NET POSITIVE EDGE
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-[#F8F9FA] tracking-tight">
            Arbitrage Position Simulator
          </h2>
          <p className="mt-1 text-xs text-[#888888] max-w-md">
            Simulate instantaneous cross-contract pair lock-in with statutory tax deductions
          </p>
        </div>

        <div className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3.5 py-1.5 text-xs text-[#A1A1AA]">
          <Scale className="h-3.5 w-3.5 text-[#FFD700]" />
          <span>Delta-Neutral</span>
        </div>
      </div>

      {/* Contract Pair Configuration (Spacious & Clean) */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Long Leg */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold text-emerald-400">LONG LEG (UNDERVALUED)</span>
            <span className="font-mono">{opportunity.longLots * lotMultiplier} Lots</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <select
              value={longSymbol}
              onChange={(e) => setLongSymbol(e.target.value as MCXContractSymbol)}
              className="bg-[#141923] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
            >
              <option value="GOLDTEN">GOLDTEN (10g, 999)</option>
              <option value="GOLDM">GOLDM (100g, 995)</option>
              <option value="GOLDGUINEA">GOLDGUINEA (8g, 999)</option>
              <option value="GOLDPETAL">GOLDPETAL (1g, 999)</option>
            </select>
            <span className="font-mono text-base font-extrabold tabular-nums text-[#F8F9FA]">
              ₹{longQuote.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#71717A]">
            Unit: {CONTRACT_SPECS[longSymbol].tradingUnit} · Purity: {CONTRACT_SPECS[longSymbol].purity}
          </div>
        </div>

        {/* Short Leg */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4 backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-[#71717A]">
            <span className="font-bold text-rose-400">SHORT LEG (OVERVALUED)</span>
            <span className="font-mono">{opportunity.shortLots * lotMultiplier} Lots</span>
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <select
              value={shortSymbol}
              onChange={(e) => setShortSymbol(e.target.value as MCXContractSymbol)}
              className="bg-[#141923] border border-white/10 rounded-lg px-3 py-2 text-xs font-semibold text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
            >
              <option value="GOLDM">GOLDM (100g, 995)</option>
              <option value="GOLDTEN">GOLDTEN (10g, 999)</option>
              <option value="GOLDGUINEA">GOLDGUINEA (8g, 999)</option>
              <option value="GOLDPETAL">GOLDPETAL (1g, 999)</option>
            </select>
            <span className="font-mono text-base font-extrabold tabular-nums text-[#F8F9FA]">
              ₹{shortQuote.toLocaleString('en-IN', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-[#71717A]">
            Unit: {CONTRACT_SPECS[shortSymbol].tradingUnit} · Purity: {CONTRACT_SPECS[shortSymbol].purity}
          </div>
        </div>
      </div>

      {/* Sizing Multiplier Controls */}
      <div className="flex items-center justify-between border-y border-white/[0.06] py-3 text-xs">
        <span className="text-[#888888] font-medium">Position Sizing Multiplier:</span>
        <div className="flex items-center gap-2">
          {[1, 2, 5, 10].map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                setLotMultiplier(m);
              }}
              className={`rounded-lg px-3 py-1.5 font-mono text-xs font-bold transition-all ${
                lotMultiplier === m
                  ? 'border border-[#FFD700]/60 bg-[#FFD700]/20 text-[#FFD700] shadow-[0_0_12px_rgba(255,215,0,0.2)]'
                  : 'border border-white/10 bg-white/[0.03] text-[#A1A1AA] hover:text-[#F8F9FA]'
              }`}
            >
              {m}x
            </button>
          ))}
        </div>
      </div>

      {/* Financial Output Grid (Clean & Distinctive) */}
      <div className="my-5 space-y-3 text-xs">
        {/* Gross vs Net Alpha */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <span className="text-[11px] text-[#71717A] uppercase font-semibold">Pre-Tax Convergence</span>
            <div className="mt-1 font-mono text-lg font-bold tabular-nums text-[#F8F9FA]">
              +₹{scaledGross.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#71717A]">Gross Spread Profit</span>
          </div>

          <div className="rounded-xl border border-[#FFD700]/40 bg-[#161309] p-4 shadow-[0_0_20px_rgba(255,215,0,0.1)]">
            <span className="text-[11px] text-[#FFD700] uppercase font-bold">Net Alpha Realized</span>
            <div className="mt-1 font-mono text-xl font-extrabold tabular-nums text-[#FFD700] gold-text-glow">
              +₹{scaledNetAlpha.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-[#A1A1AA]">After STT, MCX & Slippage</span>
          </div>
        </div>

        {/* Breakdown of Statutory & Exchange Friction */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-3.5 text-xs">
          <div className="flex items-center justify-between text-[#A1A1AA] font-semibold mb-2">
            <span className="flex items-center gap-1.5">
              <Receipt className="h-3.5 w-3.5 text-[#71717A]" />
              Exchange & Statutory Deductions
            </span>
            <span className="font-mono text-rose-400 font-bold tabular-nums">
              -₹{scaledFriction.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-[11px] text-[#71717A] border-t border-white/[0.05] pt-2">
            <div>
              <span>STT & Stamp:</span>{' '}
              <span className="font-mono text-[#A1A1AA]">₹{scaledTaxes.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span>MCX+GST:</span>{' '}
              <span className="font-mono text-[#A1A1AA]">₹{scaledExchange.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span>Slippage:</span>{' '}
              <span className="font-mono text-[#A1A1AA]">₹{scaledSlippage.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Key Metrics: Margin and Risk-Reward */}
        <div className="flex items-center justify-between text-xs text-[#888888] px-1 pt-1">
          <span>
            Capital Required (SPAN 11.5%):{' '}
            <strong className="font-mono text-[#F8F9FA]">
              ₹{(scaledMargin / 100000).toFixed(2)} L
            </strong>
          </span>
          <span>
            Risk / Reward:{' '}
            <strong className="font-mono text-emerald-400 font-bold">
              {opportunity.riskRewardRatio}
            </strong>
          </span>
        </div>
      </div>

      {/* Action Button: Lock-In Alpha */}
      <button
        onClick={handleLockInAlpha}
        className={`relative flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl py-4 text-sm font-extrabold uppercase tracking-wider transition-all duration-300 ${
          isSuccessAnimated
            ? 'bg-[#FFD700] text-black shadow-[0_0_40px_rgba(255,215,0,0.85)] scale-[1.02]'
            : 'bg-[#FFD700] text-black hover:bg-[#FFE033] hover:shadow-[0_0_25px_rgba(255,215,0,0.35)] active:scale-[0.98]'
        }`}
      >
        {isSuccessAnimated ? (
          <>
            <CheckCircle2 className="h-5 w-5 animate-bounce" />
            <span>ALPHA LOCKED IN EXECUTION BLOTTER</span>
          </>
        ) : (
          <>
            <Lock className="h-4 w-4" />
            <span>LOCK-IN ALPHA (+₹{scaledNetAlpha.toLocaleString('en-IN')})</span>
          </>
        )}
      </button>
    </div>
  );
};
