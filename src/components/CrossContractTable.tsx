import React, { useState } from 'react';
import {
  Filter,
  Info,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';
import { ContractPriceTick, MCXContractSymbol } from '../types/market';
import { CONTRACT_SPECS } from '../utils/pricingEngine';
import { sound } from '../utils/audioEngine';

interface CrossContractTableProps {
  ticks: Record<MCXContractSymbol, ContractPriceTick>;
  onSelectForTrade: (symbol: MCXContractSymbol) => void;
}

export const CrossContractTable: React.FC<CrossContractTableProps> = ({
  ticks,
  onSelectForTrade,
}) => {
  const [filterLiquidity, setFilterLiquidity] = useState<string>('ALL');

  const contractsList = (Object.keys(ticks) as MCXContractSymbol[]).filter((sym) => {
    if (filterLiquidity === 'ALL') return true;
    if (filterLiquidity === 'HIGH') return ticks[sym].liquidityTier.includes('High');
    return true;
  });

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              MCX BULLION SUITE · RELATIVE VALUE
            </span>
            <span className="rounded-md bg-[#FFD700]/15 px-2 py-0.5 text-[11px] font-bold text-[#FFD700]">
              PURITY & UNIT NORMALIZED
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#F8F9FA]">
            Relative Value Parity Engine
          </h2>
          <p className="mt-1 text-xs text-[#888888]">
            Normalized to 10 grams at 999 purity equivalent. Identifies cross-contract mispricings across GOLDM, GOLDTEN, GOLDGUINEA, and GOLDPETAL.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 text-xs backdrop-blur-md">
            <button
              onClick={() => {
                sound.playClick();
                setFilterLiquidity('ALL');
              }}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
                filterLiquidity === 'ALL'
                  ? 'bg-white/10 text-[#F8F9FA] shadow'
                  : 'text-[#71717A] hover:text-[#F8F9FA]'
              }`}
            >
              All Contracts
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setFilterLiquidity('HIGH');
              }}
              className={`rounded-lg px-3.5 py-1.5 font-semibold transition-all ${
                filterLiquidity === 'HIGH'
                  ? 'bg-white/10 text-[#F8F9FA] shadow'
                  : 'text-[#71717A] hover:text-[#F8F9FA]'
              }`}
            >
              Tier-1 Liquid Only
            </button>
          </div>
        </div>
      </div>

      {/* Contract Table (Spacious & Clean) */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-white/[0.06] text-[11px] uppercase tracking-wider text-[#71717A]">
              <th className="py-4 px-4 font-semibold">Contract</th>
              <th className="py-4 px-4 font-semibold">Trading Unit</th>
              <th className="py-4 px-4 font-semibold">Purity</th>
              <th className="py-4 px-4 font-semibold text-right">Native Quote</th>
              <th className="py-4 px-4 font-semibold text-right">
                Normalized (₹/10g 999)
              </th>
              <th className="py-4 px-4 font-semibold text-right">Spread vs Parity</th>
              <th className="py-4 px-4 font-semibold text-center">Z-Score</th>
              <th className="py-4 px-4 font-semibold text-center">Liquidity</th>
              <th className="py-4 px-4 font-semibold text-center">Signal</th>
              <th className="py-4 px-4 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {contractsList.map((symbol) => {
              const tick = ticks[symbol];
              const spec = CONTRACT_SPECS[symbol];
              const isOver = tick.status === 'OVERPRICED';
              const isUnder = tick.status === 'UNDERPRICED';

              return (
                <tr
                  key={symbol}
                  className="hover:bg-white/[0.03] transition-colors group"
                >
                  {/* Contract Symbol & Expiry */}
                  <td className="py-4.5 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-[#F8F9FA] text-sm group-hover:text-[#FFD700] transition-colors">
                        {spec.name}
                      </span>
                      <span className="text-[11px] text-[#71717A] mt-0.5">
                        {spec.symbol} · Expiry: {spec.nextExpiry}
                      </span>
                    </div>
                  </td>

                  {/* Unit */}
                  <td className="py-4.5 px-4 text-[#A1A1AA]">
                    {spec.tradingUnit} <span className="text-[#666]">(per {spec.quotationBase})</span>
                  </td>

                  {/* Purity */}
                  <td className="py-4.5 px-4">
                    <span
                      className={`font-mono text-xs font-semibold ${
                        spec.purity === 999 ? 'text-[#FFD700]' : 'text-[#A1A1AA]'
                      }`}
                    >
                      {spec.purity} Fineness
                    </span>
                    {spec.purity === 995 && (
                      <span className="block text-[10px] text-[#71717A]">
                        Factor: 0.995995
                      </span>
                    )}
                  </td>

                  {/* Raw Quote */}
                  <td className="py-4.5 px-4 text-right font-mono font-bold tabular-nums text-[#F8F9FA] text-sm">
                    ₹{tick.quotePrice.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Normalized (999 10g) */}
                  <td className="py-4.5 px-4 text-right font-mono font-extrabold tabular-nums text-[#FFD700] text-sm">
                    ₹{tick.normalizedPricePer10g.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>

                  {/* Spread vs SFV */}
                  <td className="py-4.5 px-4 text-right font-mono tabular-nums">
                    <span
                      className={`font-bold text-xs ${
                        isUnder
                          ? 'text-emerald-400'
                          : isOver
                          ? 'text-rose-400'
                          : 'text-[#A1A1AA]'
                      }`}
                    >
                      {tick.spreadToSFV > 0 ? '+' : ''}
                      ₹{tick.spreadToSFV.toFixed(1)}
                    </span>
                    <span className="block text-[10px] text-[#71717A]">
                      {tick.spreadToSFVBps > 0 ? '+' : ''}
                      {tick.spreadToSFVBps.toFixed(1)} bps
                    </span>
                  </td>

                  {/* Z-score */}
                  <td className="py-4.5 px-4 text-center font-mono font-semibold tabular-nums">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs ${
                        Math.abs(tick.zScore) >= 2.0
                          ? 'bg-[#FFD700]/15 text-[#FFD700] font-bold'
                          : 'text-[#A1A1AA]'
                      }`}
                    >
                      {tick.zScore > 0 ? '+' : ''}
                      {tick.zScore.toFixed(2)}σ
                    </span>
                  </td>

                  {/* Liquidity Tier */}
                  <td className="py-4.5 px-4 text-center">
                    <span
                      className={`text-xs font-semibold ${
                        tick.liquidityTier.includes('High')
                          ? 'text-emerald-400'
                          : tick.liquidityTier.includes('Moderate')
                          ? 'text-amber-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {tick.liquidityTier.split(' ')[0]}
                    </span>
                    <span className="block text-[10px] text-[#71717A]">
                      {tick.volume.toLocaleString('en-IN')} lots
                    </span>
                  </td>

                  {/* Signal */}
                  <td className="py-4.5 px-4 text-center">
                    {isUnder ? (
                      <span className="rounded-md border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                        BUY ARB
                      </span>
                    ) : isOver ? (
                      <span className="rounded-md border border-rose-500/30 bg-rose-500/15 px-2.5 py-1 text-[11px] font-bold text-rose-400">
                        SELL ARB
                      </span>
                    ) : (
                      <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-[#71717A]">
                        NEUTRAL
                      </span>
                    )}
                  </td>

                  {/* Action */}
                  <td className="py-4.5 px-4 text-right">
                    <button
                      onClick={() => {
                        sound.playClick();
                        onSelectForTrade(symbol);
                      }}
                      className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-[#F8F9FA] hover:border-[#FFD700] hover:text-[#FFD700] transition-colors"
                    >
                      Simulate
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Institutional Callouts (Clean & Uncluttered) */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 border-t border-white/[0.06] pt-6 text-xs">
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-black/40 p-4">
          <Info className="h-4 w-4 shrink-0 text-[#FFD700] mt-0.5" />
          <div className="text-[#888888] leading-relaxed">
            <strong className="text-[#F8F9FA]">Contract Mechanical Separation:</strong>{' '}
            GOLDM (100g, 995 purity) expires between the 3rd–5th, while GOLDTEN (10g, 999 purity) expires on the 27th–31st. Because GOLDTEN was listed only from 2025 onwards, backtest comparisons have a shorter sample history.
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-black/40 p-4">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
          <div className="text-[#888888] leading-relaxed">
            <strong className="text-[#F8F9FA]">Fill Executability Discipline:</strong>{' '}
            Settlement prices on MCX Bhavcopy are official exchange settlement marks and must never automatically be treated as executable fill prices, especially on thin retail contracts like GOLDPETAL and GOLDGUINEA.
          </div>
        </div>
      </div>
    </div>
  );
};
