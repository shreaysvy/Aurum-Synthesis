import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Layers,
  ArrowRight,
  Plus,
  Info,
  CalendarRange,
  Zap,
} from 'lucide-react';
import { MOCK_LIFECYCLE_DATA, MOCK_PLANNED_POSITIONS } from '../data/mockMarketData';
import { ContractLifecycle, MCXContractSymbol, PlannedTradePosition } from '../types/market';
import { sound } from '../utils/audioEngine';

export const ContractLifecyclePlanner: React.FC = () => {
  const [selectedSymbol, setSelectedSymbol] = useState<MCXContractSymbol>('GOLDM');
  const [plannedTrades, setPlannedTrades] = useState<PlannedTradePosition[]>(MOCK_PLANNED_POSITIONS);

  // New plan form state
  const [newSymbol, setNewSymbol] = useState<MCXContractSymbol>('GOLDTEN');
  const [newEntryDate, setNewEntryDate] = useState<string>('2026-10-20');
  const [newExitDate, setNewExitDate] = useState<string>('2026-11-15');
  const [newLots, setNewLots] = useState<number>(10);

  const activeContract = MOCK_LIFECYCLE_DATA.find((c) => c.symbol === selectedSymbol) || MOCK_LIFECYCLE_DATA[0];

  const handleAddTradePlan = (e: React.FormEvent) => {
    e.preventDefault();
    sound.playClick();

    // Check if exit date is near or inside tender period
    // Mock tender period for GOLDM is 30/10 - 05/11, for others ~23/11 - 28/11
    const exitD = new Date(newExitDate);
    const tenderD = newSymbol === 'GOLDM' ? new Date('2026-10-30') : new Date('2026-11-23');

    let tenderRisk: 'SAFE' | 'WARNING' | 'CRITICAL_TENDER_ZONE' = 'SAFE';
    let notes = 'Planned exit safely precedes physical delivery tender window.';

    if (exitD >= tenderD) {
      tenderRisk = 'CRITICAL_TENDER_ZONE';
      notes = 'CRITICAL: Planned exit falls inside 5-day tender window! 25% margin spike + physical assignment risk.';
    } else {
      const diffDays = Math.ceil((tenderD.getTime() - exitD.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 4) {
        tenderRisk = 'WARNING';
        notes = `Tender buffer is only ${diffDays} days. Consider exiting earlier to guarantee liquid order book.`;
      }
    }

    const newPlan: PlannedTradePosition = {
      id: `PLAN-${Math.floor(100 + Math.random() * 900)}`,
      contractSymbol: newSymbol,
      contractExpiry: newSymbol === 'GOLDM' ? '05/11/2026' : '28/11/2026',
      entryDate: newEntryDate,
      targetExitDate: newExitDate,
      lots: newLots,
      tenderRiskScore: tenderRisk,
      liquidityRisk: newSymbol === 'GOLDPETAL' ? 'ILLIQUID_RISK' : 'OPTIMAL',
      notes,
    };

    setPlannedTrades([newPlan, ...plannedTrades]);
  };

  return (
    <div className="space-y-8">
      {/* 1. Header Banner & Data Considerations */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                CONTRACT LIFECYCLE DISCIPLINE
              </span>
              <span className="rounded-md bg-[#FFD700]/15 px-2 py-0.5 text-[11px] font-bold text-[#FFD700]">
                TENDER PERIOD GUARDRAILS
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#F8F9FA]">
              Contract Lifecycle & Calendar Planning Engine
            </h2>
            <p className="mt-1 text-xs text-[#888888] max-w-2xl">
              Track contract listing dates, liquidity ramps, physical tender windows (5 days prior to expiry), and delivery settlement to safeguard executable entries and exits without artificial continuous roll bias.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/40 px-3.5 py-2 text-xs font-mono text-[#A1A1AA]">
            <CalendarRange className="h-4 w-4 text-[#FFD700]" />
            <span>Discrete Expiry Tracking: Active</span>
          </div>
        </div>

        {/* 2. Key Lifecycle Principles Strip */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <div className="flex items-center gap-2 text-[#FFD700] font-bold">
              <ShieldAlert className="h-4 w-4" />
              <span>5-Day Tender Margin Spike</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#888888] leading-relaxed">
              MCX gold futures require a 5-day delivery tender period before expiry. Margins spike to 25%+, physical assignment triggers, and secondary liquidity moves to the next month. All convergence exits must precede this window.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Calendar className="h-4 w-4" />
              <span>GOLDTEN Listing Window (2025+)</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#888888] leading-relaxed">
              GOLDTEN (10g, 999 fineness) was listed on MCX only from early 2025 onwards. Backtest evaluations involving GOLDTEN have a strictly shorter sample and must never look back prior to its listing inception.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <div className="flex items-center gap-2 text-emerald-400 font-bold">
              <Layers className="h-4 w-4" />
              <span>Zero Artificial Splicing Jumps</span>
            </div>
            <p className="mt-1.5 text-[11px] text-[#888888] leading-relaxed">
              Tracking contracts by discrete <code className="font-mono text-[#F8F9FA]">expiry_date</code> prevents the artificial price discontinuities and phantom roll-down yields caused by mechanical continuous near-month splicing.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Contract-Specific Lifecycle Inspector */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold text-[#F8F9FA]">
              Contract Lifecycle Specifications
            </h3>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-[#FFD700]">
              {activeContract.contractSeries}
            </span>
          </div>

          {/* Symbol Selector Buttons */}
          <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black/40 p-1 text-xs">
            {MOCK_LIFECYCLE_DATA.map((item) => (
              <button
                key={item.symbol}
                onClick={() => {
                  sound.playClick();
                  setSelectedSymbol(item.symbol);
                }}
                className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
                  selectedSymbol === item.symbol
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-[#888888] hover:text-[#F8F9FA]'
                }`}
              >
                {item.symbol}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Contract Lifecycle Timeline Bar */}
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/40 p-5">
          <div className="flex items-center justify-between text-xs font-semibold text-[#A1A1AA] mb-4">
            <span>Contract Lifecycle Progression: {activeContract.name}</span>
            <span className="font-mono text-[#FFD700]">
              Days to Expiry: {activeContract.currentDaysToExpiry}d
            </span>
          </div>

          {/* Graphical Lifecycle Stage Bar */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            {/* Stage 1: Listing */}
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
              <span className="text-[10px] text-[#71717A] uppercase font-bold">Phase 1: Listing</span>
              <div className="mt-1 font-bold text-[#F8F9FA]">{activeContract.listingDate}</div>
              <span className="text-[10px] text-[#888888] mt-1 block">Quiet order book</span>
            </div>

            {/* Stage 2: Peak Depth */}
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3">
              <span className="text-[10px] text-emerald-400 uppercase font-bold">Phase 2: Peak Depth</span>
              <div className="mt-1 font-bold text-[#F8F9FA]">{activeContract.peakLiquidityWindow}</div>
              <span className="text-[10px] text-emerald-300 mt-1 block">Maximum executability</span>
            </div>

            {/* Stage 3: Tender Window */}
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <span className="text-[10px] text-amber-400 uppercase font-bold">Phase 3: Tender Period</span>
              <div className="mt-1 font-bold text-[#F8F9FA]">{activeContract.tenderStartDate}</div>
              <span className="text-[10px] text-amber-300 mt-1 block">25% Margin / Mandatory Exit</span>
            </div>

            {/* Stage 4: Expiry Settlement */}
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-3">
              <span className="text-[10px] text-rose-400 uppercase font-bold">Phase 4: Contract Expiry</span>
              <div className="mt-1 font-bold text-[#F8F9FA]">{activeContract.expiryDate}</div>
              <span className="text-[10px] text-rose-300 mt-1 block">Physical Settlement mark</span>
            </div>
          </div>

          {/* Deep Analytics Metrics */}
          <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-white/[0.05] pt-4 text-xs">
            <div>
              <span className="text-[#71717A] text-[11px]">Avg Daily Volume:</span>
              <div className="font-mono font-bold text-[#F8F9FA] text-sm mt-0.5">
                {activeContract.dailyVolumeAvgLots.toLocaleString('en-IN')} lots
              </div>
            </div>

            <div>
              <span className="text-[#71717A] text-[11px]">Open Interest:</span>
              <div className="font-mono font-bold text-[#F8F9FA] text-sm mt-0.5">
                {activeContract.openInterestAvgLots.toLocaleString('en-IN')} lots
              </div>
            </div>

            <div>
              <span className="text-[#71717A] text-[11px]">Market Depth Score:</span>
              <div className="font-mono font-bold text-[#FFD700] text-sm mt-0.5">
                {activeContract.marketDepthScore}/100
              </div>
            </div>

            <div>
              <span className="text-[#71717A] text-[11px]">Historical Sample:</span>
              <div className="font-mono font-semibold text-[#A1A1AA] text-xs mt-0.5">
                {activeContract.historicalSampleStart}
              </div>
            </div>
          </div>

          {/* Recommended Operational Stance */}
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-white/[0.06] bg-black/30 p-3 text-xs">
            <Info className="h-4 w-4 shrink-0 text-[#FFD700]" />
            <span className="text-[#A1A1AA]">
              <strong className="text-[#F8F9FA]">Execution Directive: </strong>
              {activeContract.recommendedAction}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Trade Entry & Exit Placement Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Cols: Plan Form */}
        <div className="lg:col-span-5 rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-7 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-[#FFD700]" />
            <h3 className="text-lg font-bold text-[#F8F9FA]">
              Place Intended Entry & Exit
            </h3>
          </div>
          <p className="mt-1 text-xs text-[#888888]">
            Schedule convergence trades on the contract calendar. Automatically checks for tender period margin spikes and thin liquidity risks.
          </p>

          <form onSubmit={handleAddTradePlan} className="mt-5 space-y-4 text-xs">
            <div>
              <label className="text-[#71717A] font-semibold block mb-1.5">Contract Instrument</label>
              <select
                value={newSymbol}
                onChange={(e) => setNewSymbol(e.target.value as MCXContractSymbol)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-semibold text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
              >
                <option value="GOLDM">GOLDM (Mini 100g, Expiry 05/11/2026)</option>
                <option value="GOLDTEN">GOLDTEN (10g 999, Expiry 28/11/2026)</option>
                <option value="GOLDGUINEA">GOLDGUINEA (8g 999, Expiry 28/11/2026)</option>
                <option value="GOLDPETAL">GOLDPETAL (1g 999, Expiry 30/11/2026)</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[#71717A] font-semibold block mb-1.5">Intended Entry Date</label>
                <input
                  type="date"
                  value={newEntryDate}
                  onChange={(e) => setNewEntryDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              <div>
                <label className="text-[#71717A] font-semibold block mb-1.5">Target Exit Date</label>
                <input
                  type="date"
                  value={newExitDate}
                  onChange={(e) => setNewExitDate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-xs text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#71717A] font-semibold block mb-1.5">Position Size (Lots)</label>
              <input
                type="number"
                min="1"
                max="200"
                value={newLots}
                onChange={(e) => setNewLots(Number(e.target.value))}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 font-mono text-xs text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[#FFD700] py-3 text-xs font-bold uppercase tracking-wider text-black hover:bg-[#FFE033] transition-all shadow-[0_0_20px_rgba(255,215,0,0.2)]"
            >
              Validate Calendar Placement
            </button>
          </form>
        </div>

        {/* Right 7 Cols: Active Calendar Blotter */}
        <div className="lg:col-span-7 rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-7 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-4">
            <h3 className="text-lg font-bold text-[#F8F9FA]">
              Contract Lifecycle Validation Blotter
            </h3>
            <span className="text-xs font-mono text-[#71717A]">
              {plannedTrades.length} Active Intended Positions
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {plannedTrades.map((trade) => {
              const isTenderCritical = trade.tenderRiskScore === 'CRITICAL_TENDER_ZONE';
              const isWarning = trade.tenderRiskScore === 'WARNING';

              return (
                <div
                  key={trade.id}
                  className={`rounded-xl border p-4 transition-all ${
                    isTenderCritical
                      ? 'border-rose-500/40 bg-rose-500/10'
                      : isWarning
                      ? 'border-amber-500/30 bg-amber-500/10'
                      : 'border-white/[0.06] bg-black/30'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-[#F8F9FA] text-sm">
                        {trade.contractSymbol}
                      </span>
                      <span className="text-[11px] font-mono text-[#A1A1AA]">
                        ({trade.lots} Lots · Exp: {trade.contractExpiry})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isTenderCritical ? (
                        <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-400 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          TENDER RISK
                        </span>
                      ) : isWarning ? (
                        <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-400">
                          TIGHT BUFFER
                        </span>
                      ) : (
                        <span className="rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          CALENDAR SAFE
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 flex items-center gap-4 text-xs font-mono text-[#888888]">
                    <span>Entry: <strong className="text-[#F8F9FA]">{trade.entryDate}</strong></span>
                    <ArrowRight className="h-3 w-3 text-white/20" />
                    <span>Target Exit: <strong className="text-[#F8F9FA]">{trade.targetExitDate}</strong></span>
                  </div>

                  <p className="mt-2 text-[11px] text-[#A1A1AA] leading-relaxed">
                    {trade.notes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
