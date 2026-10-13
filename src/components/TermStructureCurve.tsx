import React, { useState } from 'react';
import { TrendingUp, Layers, HelpCircle, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { MOCK_TERM_STRUCTURE } from '../data/mockMarketData';
import { TermStructurePoint } from '../types/market';
import { sound } from '../utils/audioEngine';

export const TermStructureCurve: React.FC = () => {
  const [selectedPoint, setSelectedPoint] = useState<TermStructurePoint>(
    MOCK_TERM_STRUCTURE[1]
  );

  // SVG Chart Geometry
  const width = 640;
  const height = 240;
  const padding = { top: 30, right: 30, bottom: 40, left: 60 };

  const minPrice = 74000;
  const maxPrice = 77800;

  const points = MOCK_TERM_STRUCTURE.map((item, idx) => {
    const x =
      padding.left +
      (idx / (MOCK_TERM_STRUCTURE.length - 1)) *
        (width - padding.left - padding.right);
    const yMarket =
      height -
      padding.bottom -
      ((item.marketPrice - minPrice) / (maxPrice - minPrice)) *
        (height - padding.top - padding.bottom);
    const yMechanical =
      height -
      padding.bottom -
      ((item.mechanicalRollDownValue - minPrice) / (maxPrice - minPrice)) *
        (height - padding.top - padding.bottom);
    return { ...item, x, yMarket, yMechanical };
  });

  const marketPath = points.reduce(
    (acc, p, i) => (i === 0 ? `M ${p.x} ${p.yMarket}` : `${acc} L ${p.x} ${p.yMarket}`),
    ''
  );

  const mechanicalPath = points.reduce(
    (acc, p, i) =>
      i === 0 ? `M ${p.x} ${p.yMechanical}` : `${acc} L ${p.x} ${p.yMechanical}`,
    ''
  );

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              TERM STRUCTURE & CARRY ANALYTICS
            </span>
            <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-400">
              CONTANGO (+7.2% CARRY)
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#F8F9FA]">
            Futures Curve & Roll Decomposition
          </h2>
          <p className="mt-1 text-xs text-[#888888]">
            Isolating mechanical financing roll-down from genuine relative value curve dislocations
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-5 text-xs">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-4 rounded-sm bg-[#FFD700]" />
            <span className="text-[#A1A1AA] font-medium">Market Curve</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-0.5 w-4 border-b border-dashed border-[#71717A]" />
            <span className="text-[#71717A]">Financing Parity</span>
          </div>
        </div>
      </div>

      {/* Interactive Visual Curve (Spacious Layout) */}
      <div className="my-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
        {/* Left 2 Cols: SVG Canvas */}
        <div className="lg:col-span-2 overflow-x-auto">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full min-w-[500px]">
            {/* Gridlines */}
            {[74000, 75000, 76000, 77000].map((level) => {
              const y =
                height -
                padding.bottom -
                ((level - minPrice) / (maxPrice - minPrice)) *
                  (height - padding.top - padding.bottom);
              return (
                <g key={level}>
                  <line
                    x1={padding.left}
                    y1={y}
                    x2={width - padding.right}
                    y2={y}
                    stroke="#1E2330"
                    strokeWidth="1"
                  />
                  <text
                    x={padding.left - 10}
                    y={y + 3}
                    fill="#71717A"
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="end"
                  >
                    ₹{(level / 1000).toFixed(0)}k
                  </text>
                </g>
              );
            })}

            {/* Mechanical Financing Parity */}
            <path
              d={mechanicalPath}
              fill="none"
              stroke="#52525B"
              strokeWidth="2"
              strokeDasharray="4 4"
            />

            {/* Observed Market Curve */}
            <path
              d={marketPath}
              fill="none"
              stroke="#FFD700"
              strokeWidth="3"
            />

            {/* Interactive Data Points */}
            {points.map((p) => {
              const isSelected = selectedPoint.tenor === p.tenor;
              return (
                <g
                  key={p.tenor}
                  className="cursor-pointer group"
                  onClick={() => {
                    sound.playClick();
                    setSelectedPoint(p);
                  }}
                >
                  <line
                    x1={p.x}
                    y1={padding.top}
                    x2={p.x}
                    y2={height - padding.bottom}
                    stroke={isSelected ? '#FFD700' : 'transparent'}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                    opacity={isSelected ? 0.6 : 0.2}
                  />

                  <circle cx={p.x} cy={p.yMechanical} r="3.5" fill="#52525B" />

                  <circle
                    cx={p.x}
                    cy={p.yMarket}
                    r={isSelected ? '6.5' : '5'}
                    fill="#050505"
                    stroke="#FFD700"
                    strokeWidth={isSelected ? '3' : '2'}
                  />

                  <text
                    x={p.x}
                    y={height - padding.bottom + 18}
                    fill={isSelected ? '#FFD700' : '#A1A1AA'}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    textAnchor="middle"
                  >
                    {p.tenor.split(' ')[0]}
                  </text>
                  <text
                    x={p.x}
                    y={height - padding.bottom + 28}
                    fill="#666"
                    fontSize="9"
                    fontFamily="monospace"
                    textAnchor="middle"
                  >
                    {p.daysToExpiry}d
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Right 1 Col: Selected Tenor Analytics Card */}
        <div className="rounded-xl border border-white/[0.08] bg-black/40 p-5 text-xs backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#71717A]">
                SELECTED TENOR
              </span>
              <h3 className="text-base font-bold text-[#F8F9FA] mt-0.5">
                {selectedPoint.tenor}
              </h3>
            </div>
            <span className="font-mono text-xs rounded-md bg-[#FFD700]/10 px-2.5 py-1 text-[#FFD700] font-bold">
              {selectedPoint.daysToExpiry}d Expiry
            </span>
          </div>

          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Market Settlement:</span>
              <span className="font-mono font-bold text-[#F8F9FA] tabular-nums text-sm">
                ₹{selectedPoint.marketPrice.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-[#888888]">Financing Carry Cost:</span>
              <span className="font-mono text-[#A1A1AA] tabular-nums">
                +₹{selectedPoint.annualizedCarryCost} (7.2% p.a.)
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-white/[0.05] pt-2.5">
              <span className="text-[#888888]">Fair Roll Value:</span>
              <span className="font-mono font-semibold text-[#A1A1AA] tabular-nums">
                ₹{selectedPoint.mechanicalRollDownValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-white/[0.03] p-2.5">
              <span className="font-semibold text-[#F8F9FA]">Genuine Mispricing:</span>
              <span
                className={`font-mono font-bold tabular-nums ${
                  selectedPoint.genuineMispricingBps > 5
                    ? 'text-[#FFD700]'
                    : selectedPoint.genuineMispricingBps < 0
                    ? 'text-emerald-400'
                    : 'text-[#A1A1AA]'
                }`}
              >
                {selectedPoint.genuineMispricingBps > 0 ? '+' : ''}
                {selectedPoint.genuineMispricingBps.toFixed(1)} bps
              </span>
            </div>

            <div className="text-[11px] text-[#71717A] leading-relaxed pt-1">
              {selectedPoint.genuineMispricingBps > 5 ? (
                <span>
                  Contract is trading at a premium exceeding physical vault financing. Favors calendar roll short into M1.
                </span>
              ) : (
                <span>
                  Curve basis is within nominal frictionless bounds. Mechanical roll-down accounts for 96% of forward premium.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
