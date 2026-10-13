import React, { useState } from 'react';
import {
  FileText,
  Database,
  ShieldAlert,
  Check,
  Search,
  Download,
  AlertTriangle,
  Layers,
  ArrowRight,
  Info,
  CheckCircle2,
  Sliders,
} from 'lucide-react';
import { MOCK_BHAVCOPY_DATA } from '../data/mockMarketData';
import { BhavcopyEntry, MCXContractSymbol } from '../types/market';
import { CONTRACT_SPECS } from '../utils/pricingEngine';
import { sound } from '../utils/audioEngine';

export const BhavcopyViewer: React.FC = () => {
  const [requestedDateInput, setRequestedDateInput] = useState<string>('09/10/2026');
  const [symbolFilter, setSymbolFilter] = useState<string>('ALL');
  const [fillMode, setFillMode] = useState<'OFFICIAL_SETTLE' | 'EXECUTABLE_FILL'>('EXECUTABLE_FILL');
  const [slippageBps, setSlippageBps] = useState<number>(15);

  // Date validation simulator:
  // If requested is a holiday (e.g. 02/10/2026 Gandhi Jayanti) or Sunday (04/10/2026),
  // MCX returns the most recent trading session!
  const isHoliday = requestedDateInput === '02/10/2026';
  const isSunday = requestedDateInput === '04/10/2026';
  const isFuture = requestedDateInput === '15/12/2026';

  let returnedResponseDate = '10/09/2026'; // MM/DD/YYYY returned by MCX
  let returnedTradeDateDDMM = '09/10/2026';
  let dateValidationStatus: 'VALID' | 'FALLBACK_PRIOR_DAY' | 'FUTURE_UNAVAILABLE' = 'VALID';
  let dateValidationMessage = 'Response date strictly matches requested trading session (09/10/2026).';

  if (isHoliday) {
    returnedResponseDate = '10/01/2026'; // MCX returned 01/10/2026
    returnedTradeDateDDMM = '01/10/2026';
    dateValidationStatus = 'FALLBACK_PRIOR_DAY';
    dateValidationMessage =
      'CRITICAL EXCHANGE BEHAVIOR: Requested 02/10/2026 is an exchange holiday (Gandhi Jayanti). MCX returned the most recent trading day (01/10/2026). Discrepancy successfully trapped to prevent misattribution.';
  } else if (isSunday) {
    returnedResponseDate = '10/02/2026';
    returnedTradeDateDDMM = '02/10/2026';
    dateValidationStatus = 'FALLBACK_PRIOR_DAY';
    dateValidationMessage =
      'WEEKEND FALLBACK: Requested 04/10/2026 is a Sunday. MCX returned Friday session (02/10/2026). Corrected in validation engine.';
  } else if (isFuture) {
    returnedResponseDate = '10/09/2026';
    returnedTradeDateDDMM = '09/10/2026';
    dateValidationStatus = 'FUTURE_UNAVAILABLE';
    dateValidationMessage =
      'FUTURE DATE FALLBACK: Requested future date 15/12/2026 is not yet traded. MCX returned latest available session (09/10/2026).';
  }

  const rawEntries = MOCK_BHAVCOPY_DATA.filter((entry) => {
    if (symbolFilter !== 'ALL' && entry.symbol !== symbolFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* 1. Header & Data Engineering Principles Banner */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                MCX DAILY BHAVCOPY INGESTION PIPELINE
              </span>
              <span className="rounded-md bg-[#FFD700]/15 px-2 py-0.5 text-[11px] font-bold text-[#FFD700]">
                DATA ENGINEERING DEFENSE
              </span>
            </div>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#F8F9FA]">
              Exchange Settlement Ingestion & Executability Discipline
            </h2>
            <p className="mt-1 text-xs text-[#888888] max-w-2xl">
              Production data pipeline parsing public MCX daily Bhavcopy. Validates returned session dates against requested dates, parses compact expiry formats (e.g. 05NOV2026), trims space-padded symbols, and enforces realistic executable fill haircuts.
            </p>
          </div>

          {/* Fill Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#888888] font-medium hidden sm:inline">Pricing Model:</span>
            <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 text-xs backdrop-blur-md">
              <button
                onClick={() => {
                  sound.playClick();
                  setFillMode('OFFICIAL_SETTLE');
                }}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  fillMode === 'OFFICIAL_SETTLE'
                    ? 'bg-white/10 text-[#F8F9FA] shadow'
                    : 'text-[#71717A] hover:text-[#F8F9FA]'
                }`}
              >
                Official Settlement
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setFillMode('EXECUTABLE_FILL');
                }}
                className={`rounded-lg px-3 py-1.5 font-bold transition-all ${
                  fillMode === 'EXECUTABLE_FILL'
                    ? 'bg-[#FFD700] text-black shadow-md'
                    : 'text-[#71717A] hover:text-[#F8F9FA]'
                }`}
              >
                Executable Fill
              </button>
            </div>
          </div>
        </div>

        {/* 2. Interactive MCX Date Request & Validation Sandbox */}
        <div className="mt-6 rounded-xl border border-white/[0.08] bg-black/40 p-5 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-[#FFD700]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#F8F9FA]">
                Date Validation & Holiday Trapping Simulator
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#71717A]">Test MCX Request:</span>
              <select
                value={requestedDateInput}
                onChange={(e) => {
                  sound.playClick();
                  setRequestedDateInput(e.target.value);
                }}
                className="rounded-lg border border-white/10 bg-[#141923] px-3 py-1.5 text-xs font-mono font-semibold text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
              >
                <option value="09/10/2026">09/10/2026 (Active Trading Day)</option>
                <option value="08/10/2026">08/10/2026 (Prior Session)</option>
                <option value="02/10/2026">02/10/2026 (Exchange Holiday - Gandhi Jayanti)</option>
                <option value="04/10/2026">04/10/2026 (Weekend - Sunday)</option>
                <option value="15/12/2026">15/12/2026 (Future Malformed Query)</option>
              </select>
            </div>
          </div>

          {/* Validation Metrics Grid */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-[10px] text-[#71717A] uppercase font-bold block">
                1. MCX Request Param (DD/MM/YYYY)
              </span>
              <span className="text-sm font-bold text-[#F8F9FA] mt-1 block">
                {requestedDateInput}
              </span>
            </div>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
              <span className="text-[10px] text-[#71717A] uppercase font-bold block">
                2. MCX Response Header (MM/DD/YYYY)
              </span>
              <span className="text-sm font-bold text-[#FFD700] mt-1 block">
                {returnedResponseDate} ({returnedTradeDateDDMM})
              </span>
            </div>

            <div
              className={`rounded-lg border p-3 ${
                dateValidationStatus === 'VALID'
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : 'border-amber-500/40 bg-amber-500/10'
              }`}
            >
              <span className="text-[10px] uppercase font-bold block text-[#A1A1AA]">
                3. Date Discrepancy Status
              </span>
              <span
                className={`text-xs font-bold mt-1 block flex items-center gap-1.5 ${
                  dateValidationStatus === 'VALID' ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {dateValidationStatus === 'VALID' ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    MATCH CONFIRMED
                  </>
                ) : (
                  <>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    FALLBACK TRAPPED
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Educational Callout on MCX Date Behavior */}
          <div className="mt-3 text-[11px] text-[#A1A1AA] leading-relaxed flex items-start gap-2 pt-2 border-t border-white/[0.04]">
            <Info className="h-3.5 w-3.5 text-[#FFD700] shrink-0 mt-0.5" />
            <span>{dateValidationMessage}</span>
          </div>
        </div>

        {/* 3. Data Considerations Callout Trio */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <span className="text-[11px] font-bold text-[#FFD700] block mb-1">
              Discrete Expiry vs Continuous Splicing
            </span>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              We track contracts strictly by discrete <code className="text-[#F8F9FA]">expiry_date</code> (e.g. 05NOV2026). Continuous near-month series change contracts at expiry and create artificial price jumps that masquerade as false alpha.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <span className="text-[11px] font-bold text-amber-400 block mb-1">
              Volume is NOT Market Depth
            </span>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              High trading volume does not imply deep resting liquidity. Thin contracts like GOLDPETAL and GOLDGUINEA suffer wide bid-ask spreads. Official exchange settlement prices cannot be treated as executable fill prices.
            </p>
          </div>

          <div className="rounded-xl border border-white/[0.08] bg-black/40 p-4">
            <span className="text-[11px] font-bold text-emerald-400 block mb-1">
              Raw Payload Sanitation
            </span>
            <p className="text-[11px] text-[#888888] leading-relaxed">
              MCX raw data delivers space-padded symbols like <code className="text-[#F8F9FA]">&apos;GOLDM     &apos;</code> and compact expiries like <code className="text-[#F8F9FA]">&apos;05NOV2026&apos;</code>. Our ingestor trims whitespace and normalizes to ISO trading timestamps.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Official Bhavcopy Records Table */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/[0.06] pb-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-extrabold text-[#F8F9FA]">
              MCX Gold Futures Ingested Bhavcopy
            </h3>
            <span className="rounded bg-white/10 px-2 py-0.5 text-xs font-mono text-[#A1A1AA]">
              Session: {returnedTradeDateDDMM}
            </span>
          </div>

          {/* Symbol Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-[#71717A]">Symbol:</span>
            <select
              value={symbolFilter}
              onChange={(e) => {
                sound.playClick();
                setSymbolFilter(e.target.value);
              }}
              className="rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs font-semibold text-[#F8F9FA] focus:outline-none focus:border-[#FFD700]"
            >
              <option value="ALL">All Contracts</option>
              <option value="GOLDM">GOLDM (100g, 995)</option>
              <option value="GOLDTEN">GOLDTEN (10g, 999)</option>
              <option value="GOLDGUINEA">GOLDGUINEA (8g, 999)</option>
              <option value="GOLDPETAL">GOLDPETAL (1g, 999)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="mt-5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-[#71717A]">
                <th className="py-4 px-3 font-semibold">Raw Symbol</th>
                <th className="py-4 px-3 font-semibold">Compact Expiry</th>
                <th className="py-4 px-3 font-semibold text-right">Raw Settle</th>
                <th className="py-4 px-3 font-semibold text-right">
                  {fillMode === 'EXECUTABLE_FILL' ? 'Executable Fill Price' : 'Exchange Settle Mark'}
                </th>
                <th className="py-4 px-3 font-semibold text-right">Norm. ₹/10g 999</th>
                <th className="py-4 px-3 font-semibold text-right">Volume</th>
                <th className="py-4 px-3 font-semibold text-right">Open Interest</th>
                <th className="py-4 px-3 font-semibold text-center">Depth / Spread</th>
                <th className="py-4 px-3 font-semibold text-center">Executability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {rawEntries.map((entry) => {
                const spec = CONTRACT_SPECS[entry.symbol];

                // Compute Executable Fill vs Settle Mark
                // Thin contracts (Petal, Guinea) get larger slippage haircut
                const haircutBps = entry.symbol === 'GOLDM' ? 3 : entry.symbol === 'GOLDTEN' ? 6 : entry.symbol === 'GOLDGUINEA' ? 16 : 32;
                const fillPrice = fillMode === 'EXECUTABLE_FILL'
                  ? Math.round(entry.settlePrice * (1 + haircutBps / 10000))
                  : entry.settlePrice;

                return (
                  <tr key={`${entry.symbol}-${entry.expiryDate}`} className="hover:bg-white/[0.02] transition-colors">
                    {/* Space-padded raw symbol display */}
                    <td className="py-4 px-3">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#F8F9FA] text-sm">{entry.symbol}</span>
                        <span className="font-mono text-[10px] text-[#555] bg-white/[0.04] px-1 rounded" title="Raw space-padded exchange payload string">
                          &apos;{entry.symbol.padEnd(8, ' ')}&apos;
                        </span>
                      </div>
                      <span className="text-[11px] text-[#71717A] block mt-0.5">
                        {spec.tradingUnit} · {spec.purity} fineness
                      </span>
                    </td>

                    {/* Compact Expiry */}
                    <td className="py-4 px-3 font-mono text-[#A1A1AA]">
                      <span className="bg-white/[0.04] px-1.5 py-0.5 rounded text-xs font-bold text-[#F8F9FA]">
                        {entry.expiryDate}
                      </span>
                    </td>

                    {/* Raw Settle */}
                    <td className="py-4 px-3 text-right font-mono tabular-nums text-[#888888]">
                      ₹{entry.settlePrice.toLocaleString('en-IN')}
                    </td>

                    {/* Mode-adjusted Price */}
                    <td className="py-4 px-3 text-right font-mono font-bold tabular-nums text-[#F8F9FA]">
                      <span className={fillMode === 'EXECUTABLE_FILL' && entry.symbol !== 'GOLDM' ? 'text-amber-400' : 'text-[#F8F9FA]'}>
                        ₹{fillPrice.toLocaleString('en-IN')}
                      </span>
                      {fillMode === 'EXECUTABLE_FILL' && haircutBps > 5 && (
                        <span className="block text-[10px] text-amber-500/80 font-normal">
                          +{haircutBps} bps depth penalty
                        </span>
                      )}
                    </td>

                    {/* Normalized 10g 999 */}
                    <td className="py-4 px-3 text-right font-mono font-extrabold tabular-nums text-[#FFD700]">
                      ₹{entry.normalizedPrice10g.toLocaleString('en-IN', {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })}
                    </td>

                    {/* Volume */}
                    <td className="py-4 px-3 text-right font-mono tabular-nums text-[#A1A1AA]">
                      {entry.volume.toLocaleString('en-IN')} lots
                    </td>

                    {/* Open Interest */}
                    <td className="py-4 px-3 text-right font-mono tabular-nums text-[#A1A1AA]">
                      {entry.openInterest.toLocaleString('en-IN')} lots
                    </td>

                    {/* Depth Ratio & Bid-Ask Spread */}
                    <td className="py-4 px-3 text-center">
                      <span
                        className={`font-mono text-xs font-semibold ${
                          haircutBps <= 6 ? 'text-emerald-400' : haircutBps <= 16 ? 'text-amber-400' : 'text-rose-400'
                        }`}
                      >
                        ~{haircutBps} bps
                      </span>
                      <span className="block text-[10px] text-[#71717A]">
                        {haircutBps <= 6 ? 'Deep Book' : haircutBps <= 16 ? 'Moderate Depth' : 'Thin / Wide'}
                      </span>
                    </td>

                    {/* Executability Badge */}
                    <td className="py-4 px-3 text-center">
                      {entry.isExecutable ? (
                        <span className="rounded bg-emerald-500/15 px-2.5 py-1 text-[10px] font-bold text-emerald-400">
                          Executable Fill
                        </span>
                      ) : (
                        <span
                          className="rounded bg-rose-500/15 px-2.5 py-1 text-[10px] font-bold text-rose-400"
                          title="Thin contract: settlement price not executable at institutional scale"
                        >
                          Thin / Notional Mark
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
