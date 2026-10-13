import React, { useState } from 'react';
import { GitCommit, TrendingUp, TrendingDown, ArrowRight, Info } from 'lucide-react';
import { CorrelationNode } from '../types/market';
import { sound } from '../utils/audioEngine';

interface CorrelationMatrixProps {
  nodes: CorrelationNode[];
  activeDriver: string;
  setActiveDriver: (id: string) => void;
}

export const CorrelationMatrix: React.FC<CorrelationMatrixProps> = ({
  nodes,
  activeDriver,
  setActiveDriver,
}) => {
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  const focusedId = hoveredNode || activeDriver;
  const focusedNode = nodes.find((n) => n.id === focusedId) || nodes[0];

  const handleNodeClick = (id: string) => {
    sound.playClick();
    setActiveDriver(id);
  };

  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0A0D14]/85 p-8 sm:p-10 lg:p-12 backdrop-blur-xl shadow-2xl">
      {/* Background Transmission Path Glow when focused */}
      <div className="pointer-events-none absolute inset-0 bg-radial from-[#FFD700]/5 to-transparent opacity-60" />

      {/* Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              TRANSMISSION MATRIX · 3x3
            </span>
            <span className="rounded-md bg-[#FFD700]/15 px-2.5 py-0.5 text-[11px] font-bold text-[#FFD700] whitespace-nowrap">
              DRIVER: {focusedNode.name.toUpperCase()}
            </span>
          </div>
          <h2 className="mt-2 text-2xl sm:text-3xl font-extrabold text-[#F8F9FA] tracking-tight truncate">
            Arbitrage Correlation Grid
          </h2>
          <p className="mt-1.5 text-xs text-[#888888] leading-relaxed">
            Landed parity transmission: USD/INR $\rightarrow$ COMEX $\rightarrow$ Duty $\rightarrow$ MCX contracts
          </p>
        </div>

        {/* Transmission Chain Badge */}
        <div className="flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs text-[#A1A1AA] shrink-0">
          <GitCommit className="h-4 w-4 text-[#FFD700]" />
          <span>Elasticity β = {focusedNode.betaToMCX.toFixed(2)}</span>
        </div>
      </div>

      {/* Dynamic Animated Gold Transmission Ribbon (Wrapped cleanly on small screens) */}
      <div className="relative z-10 my-6 flex flex-wrap items-center justify-between rounded-xl border border-white/[0.08] bg-black/40 px-5 py-3 text-xs backdrop-blur-md gap-3">
        <div className="flex flex-wrap items-center gap-2 font-mono text-[#71717A]">
          <span className={focusedId === 'usdinr' ? 'text-[#FFD700] font-bold' : ''}>USD/INR</span>
          <ArrowRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
          <span className={focusedId === 'comex' ? 'text-[#FFD700] font-bold' : ''}>COMEX</span>
          <ArrowRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
          <span className={focusedId === 'sfv' ? 'text-[#FFD700] font-bold' : ''}>SFV Parity</span>
          <ArrowRight className="h-3.5 w-3.5 text-white/20 shrink-0" />
          <span className={['goldm', 'goldten', 'goldguinea', 'goldpetal'].includes(focusedId) ? 'text-[#FFD700] font-bold' : ''}>
            MCX Gold Suite
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#FFD700] font-semibold shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FFD700] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#FFD700]"></span>
          </span>
          <span>{focusedNode.transmissionDelayMs}ms propagation</span>
        </div>
      </div>

      {/* 3x3 Grid of Data Tiles (Spacious & Clean with Guaranteed Box Boundaries) */}
      <div className="relative z-10 my-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {nodes.map((node) => {
          const isFocused = focusedId === node.id;
          const isDirectDriver = ['usdinr', 'comex', 'duty'].includes(node.id);

          return (
            <div
              key={node.id}
              onMouseEnter={() => setHoveredNode(node.id)}
              onMouseLeave={() => setHoveredNode(null)}
              onClick={() => handleNodeClick(node.id)}
              className={`group relative cursor-pointer rounded-xl border p-5 transition-all duration-200 overflow-hidden flex flex-col justify-between ${
                isFocused
                  ? 'border-[#FFD700] bg-white/[0.08] gold-glow-subtle scale-[1.01]'
                  : hoveredNode
                  ? 'border-white/[0.04] bg-black/20 opacity-40'
                  : 'border-white/[0.08] bg-black/40 hover:border-white/20'
              }`}
            >
              {/* Subtle top indicator for primary drivers */}
              {isDirectDriver && (
                <div className="absolute right-3.5 top-3.5 h-2 w-2 rounded-full bg-[#FFD700]" />
              )}

              {/* Title & Direction */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <span className="text-xs font-semibold text-[#A1A1AA] group-hover:text-[#F8F9FA] transition-colors truncate flex-1 min-w-0">
                  {node.name}
                </span>
                <span className="shrink-0 ml-1">
                  {node.direction === 'UP' ? (
                    <TrendingUp className="h-4 w-4 text-emerald-400" />
                  ) : node.direction === 'DOWN' ? (
                    <TrendingDown className="h-4 w-4 text-rose-400" />
                  ) : null}
                </span>
              </div>

              {/* Price / Value */}
              <div className="mt-3.5 flex items-baseline justify-between gap-2">
                <span className="font-mono text-xl font-bold tabular-nums text-[#F8F9FA] group-hover:text-white truncate">
                  {node.value}
                </span>
                <span
                  className={`font-mono text-xs font-semibold tabular-nums shrink-0 ${
                    node.change24h > 0
                      ? 'text-emerald-400'
                      : node.change24h < 0
                      ? 'text-rose-400'
                      : 'text-[#71717A]'
                  }`}
                >
                  {node.change24h > 0 ? '+' : ''}
                  {node.change24h.toFixed(2)}%
                </span>
              </div>

              {/* Bottom Metadata: Unit & Sensitivity Beta */}
              <div className="mt-3.5 flex items-center justify-between border-t border-white/[0.05] pt-3 text-[11px] text-[#71717A] gap-2 min-w-0">
                <span className="truncate flex-1 min-w-0">{node.unit}</span>
                <span className="font-mono text-[#A1A1AA] font-semibold shrink-0">
                  β: {node.betaToMCX.toFixed(2)}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Driver Sensitivity Explanation Panel */}
      <div className="relative z-10 mt-6 flex items-start sm:items-center gap-3.5 rounded-xl border border-white/[0.08] bg-black/40 p-4 text-xs backdrop-blur-md">
        <Info className="h-4 w-4 shrink-0 text-[#FFD700] mt-0.5 sm:mt-0" />
        <div className="flex-1 text-[#888888] leading-relaxed">
          <strong className="text-[#F8F9FA]">{focusedNode.name}: </strong>
          <span>{focusedNode.description}</span>
        </div>
      </div>
    </div>
  );
};
