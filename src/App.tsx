import React, { useState } from 'react';
import { useMarketData } from './hooks/useMarketData';
import { Header } from './components/Header';
import { ConvergenceGauge } from './components/ConvergenceGauge';
import { CorrelationMatrix } from './components/CorrelationMatrix';
import { ExecutionBridge } from './components/ExecutionBridge';
import { CrossContractTable } from './components/CrossContractTable';
import { TermStructureCurve } from './components/TermStructureCurve';
import { BacktestEngine } from './components/BacktestEngine';
import { BhavcopyViewer } from './components/BhavcopyViewer';
import { ScenarioSimulator } from './components/ScenarioSimulator';
import { StrategyBlotterModal } from './components/StrategyBlotterModal';
import { ContractLifecyclePlanner } from './components/ContractLifecyclePlanner';
import { AmbientBackground, AmbientTheme } from './components/AmbientBackground';
import { InstitutionalAuthGateway } from './components/InstitutionalAuthGateway';
import { MCXContractSymbol } from './types/market';
import { Layers, TrendingUp, Sliders, ArrowRight, Calendar } from 'lucide-react';
import { sound } from './utils/audioEngine';

export default function App() {
  const {
    macro,
    updateMacro,
    resetMacro,
    ticks,
    convergenceState,
    correlationNodes,
    blotterOrders,
    isLive,
    setIsLive,
    tickCount,
    lastTickTime,
    lastTickDirection,
    tickDeltas,
    activeDriver,
    setActiveDriver,
    triggerVolatilityShock,
    executeSimulationTrade,
  } = useMarketData();

  const [theme, setTheme] = useState<AmbientTheme>('CELESTIAL');
  const [activeView, setActiveView] = useState<
    'COMMAND' | 'CROSS_RV' | 'TERM_STRUCTURE' | 'LIFECYCLE' | 'BACKTEST' | 'BHAVCOPY' | 'SCENARIO'
  >('COMMAND');

  const [isBlotterOpen, setIsBlotterOpen] = useState<boolean>(false);

  const handleExecuteTrade = (
    longSymbol: MCXContractSymbol,
    shortSymbol: MCXContractSymbol,
    lots: number
  ) => {
    executeSimulationTrade(longSymbol, shortSymbol, lots);
  };

  const handleSelectContractForTrade = (symbol: MCXContractSymbol) => {
    setActiveView('COMMAND');
  };

  return (
    <InstitutionalAuthGateway>
      <div className="relative min-h-screen text-[#F8F9FA] flex flex-col justify-between selection:bg-[#FFD700]/20 selection:text-[#FFD700]">
        {/* Living Atmospheric Ambient Canvas Background */}
        <AmbientBackground theme={theme} />

      {/* Top Header & Real-Time Alpha Ticker */}
      <Header
        macro={macro}
        ticks={ticks}
        goldmTick={ticks.GOLDM}
        isLive={isLive}
        setIsLive={setIsLive}
        tickCount={tickCount}
        lastTickTime={lastTickTime}
        tickDeltas={tickDeltas}
        activeView={activeView}
        setActiveView={setActiveView}
        triggerVolatilityShock={triggerVolatilityShock}
        blotterCount={blotterOrders.length}
        onOpenBlotter={() => setIsBlotterOpen(true)}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Main Spacious Viewport */}
      <main className="mx-auto w-full max-w-[1600px] flex-1 px-6 lg:px-10 py-10">
        {activeView === 'COMMAND' && (
          <div className="space-y-10">
            {/* 1. Hero 2-Column Split: Convergence Gauge (Spacious) + Execution Bridge */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* Convergence Gauge: 7 Columns for Maximum Breathability */}
              <div className="lg:col-span-7 flex">
                <div className="w-full">
                  <ConvergenceGauge
                    state={convergenceState}
                    onExecutePrompt={() => {
                      sound.playClick();
                      executeSimulationTrade('GOLDTEN', 'GOLDM', 10);
                    }}
                  />
                </div>
              </div>

              {/* Execution Bridge: 5 Columns */}
              <div className="lg:col-span-5 flex">
                <div className="w-full">
                  <ExecutionBridge
                    ticks={ticks}
                    onExecuteTrade={handleExecuteTrade}
                  />
                </div>
              </div>
            </div>

            {/* 2. Full-Width Correlation Transmission Grid (Spacious & Clean) */}
            <div>
              <CorrelationMatrix
                nodes={correlationNodes}
                activeDriver={activeDriver}
                setActiveDriver={setActiveDriver}
              />
            </div>

            {/* 3. High-Level Quick Analytics Strip with Direct Deep-Dive Portals */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Left Portal: Cross-Contract RV Preview */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                      DEEP-DIVE ANALYTICS
                    </span>
                    <span className="rounded-md bg-[#FFD700]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFD700]">
                      4 ACTIVE CONTRACTS
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#F8F9FA]">
                    Cross-Contract RV Parity
                  </h3>
                  <p className="mt-1 text-xs text-[#888888] leading-relaxed">
                    Examine normalized 10g 999 fineness pricing, liquidity depth tiers, and physical minting spreads across GOLDM, GOLDTEN, GOLDGUINEA, and GOLDPETAL.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    Benchmark Spread: <strong className="text-emerald-400 font-bold">GOLDM @ -₹72.4</strong>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveView('CROSS_RV');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-[#F8F9FA] hover:border-[#FFD700] hover:text-[#FFD700] transition-all"
                  >
                    <span>Open Suite</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Middle Portal: Term Structure Preview */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                      CURVE DYNAMICS
                    </span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                      CONTANGO REGIME
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#F8F9FA]">
                    Term Structure & Carry Roll
                  </h3>
                  <p className="mt-1 text-xs text-[#888888] leading-relaxed">
                    Distinguish mechanical roll-down toward contract expiry from genuine relative value curve dislocations across 5 forward delivery cycles.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    Cost of Carry: <strong className="text-[#FFD700] font-bold">7.20% (RBI+Vault)</strong>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveView('TERM_STRUCTURE');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-[#F8F9FA] hover:border-[#FFD700] hover:text-[#FFD700] transition-all"
                  >
                    <span>Open Curve</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              {/* Right Portal: Contract Lifecycle & Calendar Planner */}
              <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
                      LIFECYCLE PLANNING
                    </span>
                    <span className="rounded-md bg-[#FFD700]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFD700]">
                      TENDER GUARDRAILS
                    </span>
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-[#F8F9FA]">
                    Contract Lifecycle & Tender Calendar
                  </h3>
                  <p className="mt-1 text-xs text-[#888888] leading-relaxed">
                    Track listing dates, 5-day delivery tender margin surges (25%+), and discrete expiry series. Place intended entries and exits safely on the contract calendar.
                  </p>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/[0.06] pt-4">
                  <div className="font-mono text-[11px] text-[#A1A1AA]">
                    Tender Risk: <strong className="text-emerald-400 font-bold">Discrete Expiry Active</strong>
                  </div>
                  <button
                    onClick={() => {
                      sound.playClick();
                      setActiveView('LIFECYCLE');
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-bold text-[#F8F9FA] hover:border-[#FFD700] hover:text-[#FFD700] transition-all"
                  >
                    <span>Open Calendar</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dedicated Cross-Contract Relative Value View */}
        {activeView === 'CROSS_RV' && (
          <div className="space-y-10">
            <CrossContractTable
              ticks={ticks}
              onSelectForTrade={handleSelectContractForTrade}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ExecutionBridge
                ticks={ticks}
                onExecuteTrade={handleExecuteTrade}
              />
              <ConvergenceGauge
                state={convergenceState}
                onExecutePrompt={() => {
                  sound.playClick();
                  executeSimulationTrade('GOLDTEN', 'GOLDM', 10);
                }}
              />
            </div>
          </div>
        )}

        {/* Dedicated Term Structure View */}
        {activeView === 'TERM_STRUCTURE' && (
          <div className="space-y-10">
            <TermStructureCurve />
            <CrossContractTable
              ticks={ticks}
              onSelectForTrade={handleSelectContractForTrade}
            />
          </div>
        )}

        {/* Dedicated Contract Lifecycle & Tender Calendar View */}
        {activeView === 'LIFECYCLE' && (
          <div className="space-y-10">
            <ContractLifecyclePlanner />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ConvergenceGauge
                state={convergenceState}
                onExecutePrompt={() => {
                  sound.playClick();
                  executeSimulationTrade('GOLDTEN', 'GOLDM', 10);
                }}
              />
              <ExecutionBridge
                ticks={ticks}
                onExecuteTrade={handleExecuteTrade}
              />
            </div>
          </div>
        )}

        {/* Dedicated Walk-Forward Backtest & Attribution View */}
        {activeView === 'BACKTEST' && (
          <div className="space-y-10">
            <BacktestEngine />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <CorrelationMatrix
                nodes={correlationNodes}
                activeDriver={activeDriver}
                setActiveDriver={setActiveDriver}
              />
              <ExecutionBridge
                ticks={ticks}
                onExecuteTrade={handleExecuteTrade}
              />
            </div>
          </div>
        )}

        {/* Dedicated Macro Stress & Scenario Simulator View */}
        {activeView === 'SCENARIO' && (
          <div className="space-y-10">
            <ScenarioSimulator
              currentMacro={macro}
              onApplyScenario={updateMacro}
              onReset={resetMacro}
            />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ConvergenceGauge
                state={convergenceState}
                onExecutePrompt={() => {
                  sound.playClick();
                  executeSimulationTrade('GOLDTEN', 'GOLDM', 10);
                }}
              />
              <ExecutionBridge
                ticks={ticks}
                onExecuteTrade={handleExecuteTrade}
              />
            </div>
          </div>
        )}

        {/* Dedicated MCX Bhavcopy Inspector View */}
        {activeView === 'BHAVCOPY' && (
          <div className="space-y-10">
            <BhavcopyViewer />
            <CrossContractTable
              ticks={ticks}
              onSelectForTrade={handleSelectContractForTrade}
            />
          </div>
        )}
      </main>

      {/* Institutional Spacious Footer */}
      <footer className="border-t border-white/[0.06] bg-[#07090E]/80 backdrop-blur-xl px-6 lg:px-10 py-6 text-xs text-[#71717A]">
        <div className="mx-auto flex max-w-[1600px] flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-extrabold tracking-wider text-[#A1A1AA]">
              AURUM SYNTHESIS
            </span>
            <span className="text-white/20">·</span>
            <span className="text-[11px]">
              Institutional Commodity Derivatives Intelligence · MCX Gold Relative Value Oracle
            </span>
          </div>

          <div className="flex items-center gap-5 font-mono text-[11px] text-[#A1A1AA]">
            <span>Ticks Streamed: {tickCount}</span>
            <span className="text-white/20">·</span>
            <span>
              Last Sync: {lastTickTime.toLocaleTimeString('en-IN', { hour12: false })}
            </span>
            <span className="text-white/20">·</span>
            <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              SYSTEM NOMINAL
            </span>
          </div>
        </div>
      </footer>

      {/* Simulated Execution Blotter Modal */}
      <StrategyBlotterModal
        isOpen={isBlotterOpen}
        onClose={() => setIsBlotterOpen(false)}
        orders={blotterOrders}
      />
    </div>
    </InstitutionalAuthGateway>
  );
}
