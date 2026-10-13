import { useState, useEffect, useCallback, useRef } from 'react';
import {
  ContractPriceTick,
  ConvergenceState,
  CorrelationNode,
  ExecutionOrder,
  MacroVariables,
  MCXContractSymbol,
} from '../types/market';
import {
  calculateArbitrageOpportunity,
  calculateSyntheticFairValue,
  CONTRACT_SPECS,
  normalizePriceTo10g999,
} from '../utils/pricingEngine';
import { INITIAL_MACRO } from '../data/mockMarketData';

export function useMarketData() {
  const [macro, setMacro] = useState<MacroVariables>(INITIAL_MACRO);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [tickSpeedMs, setTickSpeedMs] = useState<number>(400); // 400ms rapid sub-second live ticks
  const [tickCount, setTickCount] = useState<number>(0);
  const [lastTickTime, setLastTickTime] = useState<Date>(new Date());
  const [lastTickDirection, setLastTickDirection] = useState<'UP' | 'DOWN'>('UP');
  const [activeDriver, setActiveDriver] = useState<string>('comex'); // 'comex' | 'usdinr' | 'duty' | 'mcx'
  const [tickDeltas, setTickDeltas] = useState<Record<MCXContractSymbol | 'COMEX' | 'USDINR', number>>({
    GOLDM: 1.45,
    GOLDTEN: 1.80,
    GOLDGUINEA: 0.90,
    GOLDPETAL: 0.35,
    COMEX: 0.40,
    USDINR: 0.0035,
  });

  const macroRef = useRef<MacroVariables>(macro);
  macroRef.current = macro;

  const countdownRef = useRef<number>(462);

  // Countdown timer for current arbitrage convergence window in seconds
  const [countdownSeconds, setCountdownSeconds] = useState<number>(462); // ~07m 42s

  // Simulated Orders Blotter
  const [blotterOrders, setBlotterOrders] = useState<ExecutionOrder[]>([
    {
      id: 'ORD-9842',
      timestamp: '14:28:12 IST',
      strategy: 'CROSS_CONTRACT_RV',
      longLeg: { symbol: 'GOLDTEN', lots: 20, entryPrice: 74610 },
      shortLeg: { symbol: 'GOLDM', lots: 2, entryPrice: 74315 },
      capitalDeployed: 1720000,
      grossAlphaInr: 14280,
      exchangeFeesInr: 724,
      sttInr: 1858,
      stampDutyInr: 297,
      slippageInr: 1120,
      netAlphaInr: 10281,
      netReturnBps: 59.8,
      riskRewardRatio: '1 : 4.6',
      status: 'CONVERGED',
    },
  ]);

  // Contract tick prices (with fractional decimal precision for live continuous fluctuation)
  const [ticks, setTicks] = useState<Record<MCXContractSymbol, ContractPriceTick>>({
    GOLDM: {
      symbol: 'GOLDM',
      quotePrice: 74310.50,
      normalizedPricePer10g: 74609.1,
      purityAdjustedPricePer10g: 74310.50,
      change: 145.5,
      changePercent: 0.20,
      syntheticFairValue: 74382.4,
      spreadToSFV: -71.9,
      spreadToSFVBps: -9.7,
      volume: 18940,
      openInterest: 32410,
      depthRatio: 1.14,
      liquidityTier: 'TIER-1 (High)',
      status: 'UNDERPRICED',
      zScore: -1.65,
    },
    GOLDTEN: {
      symbol: 'GOLDTEN',
      quotePrice: 74688.20,
      normalizedPricePer10g: 74688.20,
      purityAdjustedPricePer10g: 74688.20,
      change: 210.2,
      changePercent: 0.28,
      syntheticFairValue: 74681.1,
      spreadToSFV: 7.1,
      spreadToSFVBps: 1.0,
      volume: 5120,
      openInterest: 9680,
      depthRatio: 0.96,
      liquidityTier: 'TIER-2 (Moderate)',
      status: 'FAIR',
      zScore: 0.32,
    },
    GOLDGUINEA: {
      symbol: 'GOLDGUINEA',
      quotePrice: 59750.40,
      normalizedPricePer10g: 74688.0,
      purityAdjustedPricePer10g: 74688.0,
      change: 168.4,
      changePercent: 0.28,
      syntheticFairValue: 74681.1,
      spreadToSFV: 6.9,
      spreadToSFVBps: 0.9,
      volume: 1720,
      openInterest: 3890,
      depthRatio: 0.88,
      liquidityTier: 'TIER-2 (Moderate)',
      status: 'FAIR',
      zScore: 0.31,
    },
    GOLDPETAL: {
      symbol: 'GOLDPETAL',
      quotePrice: 7490.20,
      normalizedPricePer10g: 74902.0,
      purityAdjustedPricePer10g: 74902.0,
      change: 32.2,
      changePercent: 0.43,
      syntheticFairValue: 74681.1,
      spreadToSFV: 220.9,
      spreadToSFVBps: 29.5,
      volume: 8790,
      openInterest: 14520,
      depthRatio: 0.62,
      liquidityTier: 'TIER-3 (Thin)',
      status: 'OVERPRICED',
      zScore: 3.12,
    },
  });

  // Hero Convergence State
  const [convergenceState, setConvergenceState] = useState<ConvergenceState>({
    currentZScore: 2.38,
    pressurePercent: 79,
    zone: 'GOLDEN',
    targetSymbol: 'GOLDM',
    benchmarkSymbol: 'GOLDTEN',
    pairName: 'GOLDM / GOLDTEN Purity Spread',
    theoreticalSpreadInr: 72.5,
    actualSpreadInr: -81.4,
    mispricingInr: 153.9,
    action: 'LONG',
    halfLifeHours: 4.2,
    countdownSeconds: 462,
    estimatedClosureTime: '07m 42s',
    historicalHitRate: 83.6,
  });

  // Ticking effect for the live window countdown (1 second cadence)
  useEffect(() => {
    if (!isLive) return;
    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        const next = prev <= 1 ? 520 + Math.floor(Math.random() * 180) : prev - 1;
        countdownRef.current = next;
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isLive]);

  // Main real-time live WebSocket tick loop (400ms rapid cadence)
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setLastTickTime(new Date());
      setTickCount((c) => c + 1);

      // Micro-volatility movements on every single sub-second tick
      const comexDelta = Number(((Math.random() - 0.49) * 0.85).toFixed(2));
      const usdInrDelta = Number(((Math.random() - 0.50) * 0.0075).toFixed(4));
      const dir: 'UP' | 'DOWN' = comexDelta >= 0 ? 'UP' : 'DOWN';
      setLastTickDirection(dir);

      // 1. Update Macro Variables (COMEX Gold, USD/INR)
      const currentM = macroRef.current;
      const nextComex = Number((currentM.comexGoldUsdOz + comexDelta).toFixed(2));
      const nextUsdInr = Number((currentM.usdInr + usdInrDelta).toFixed(4));
      const nextComexPct = Number((currentM.comexChangePercent + comexDelta / 35).toFixed(2));
      const nextUsdInrPct = Number((currentM.usdInrChangePercent + usdInrDelta / 8).toFixed(3));

      const updatedMacro: MacroVariables = {
        ...currentM,
        comexGoldUsdOz: nextComex,
        usdInr: nextUsdInr,
        comexChangePercent: nextComexPct,
        usdInrChangePercent: nextUsdInrPct,
      };
      macroRef.current = updatedMacro;
      setMacro(updatedMacro);

      // 2. Compute live landed parity Synthetic Fair Value (SFV)
      const sfv999 = calculateSyntheticFairValue(updatedMacro, 999);
      const sfv995 = calculateSyntheticFairValue(updatedMacro, 995);

      // 3. Fluctuating live contract prices with continuous paise/rupee movements
      const goldmDrift = Number(((Math.random() - 0.49) * 4.2).toFixed(2));
      const goldtenDrift = Number(((Math.random() - 0.50) * 3.8).toFixed(2));
      const guineaDrift = Number(((Math.random() - 0.50) * 2.8).toFixed(2));
      const petalDrift = Number(((Math.random() - 0.51) * 1.5).toFixed(2));

      setTickDeltas({
        GOLDM: goldmDrift,
        GOLDTEN: goldtenDrift,
        GOLDGUINEA: guineaDrift,
        GOLDPETAL: petalDrift,
        COMEX: comexDelta,
        USDINR: usdInrDelta,
      });

      setTicks((prev) => {
        const newGoldm = Number((prev.GOLDM.quotePrice + goldmDrift).toFixed(2));
        const newGoldten = Number((prev.GOLDTEN.quotePrice + goldtenDrift).toFixed(2));
        const newGuinea = Number((prev.GOLDGUINEA.quotePrice + guineaDrift).toFixed(2));
        const newPetal = Number((prev.GOLDPETAL.quotePrice + petalDrift).toFixed(2));

        const normGoldm = normalizePriceTo10g999('GOLDM', newGoldm);
        const normGoldten = normalizePriceTo10g999('GOLDTEN', newGoldten);
        const normGuinea = normalizePriceTo10g999('GOLDGUINEA', newGuinea);
        const normPetal = normalizePriceTo10g999('GOLDPETAL', newPetal);

        const goldmSpread = newGoldm - sfv995;
        const goldtenSpread = newGoldten - sfv999;
        const guineaSpread = normGuinea - sfv999;
        const petalSpread = normPetal - sfv999;

        const zGoldm = Number((goldmSpread / 42.5).toFixed(2));
        const zGoldten = Number((goldtenSpread / 38.0).toFixed(2));
        const zGuinea = Number((guineaSpread / 44.0).toFixed(2));
        const zPetal = Number((petalSpread / 65.0).toFixed(2));

        return {
          GOLDM: {
            ...prev.GOLDM,
            quotePrice: newGoldm,
            normalizedPricePer10g: Number(normGoldm.toFixed(2)),
            purityAdjustedPricePer10g: newGoldm,
            change: Number((prev.GOLDM.change + goldmDrift).toFixed(2)),
            syntheticFairValue: Number(sfv995.toFixed(2)),
            spreadToSFV: Number(goldmSpread.toFixed(2)),
            spreadToSFVBps: Number(((goldmSpread / sfv995) * 10000).toFixed(1)),
            volume: prev.GOLDM.volume + (Math.random() > 0.6 ? 1 : 0),
            status: zGoldm < -1.5 ? 'UNDERPRICED' : zGoldm > 1.5 ? 'OVERPRICED' : 'FAIR',
            zScore: zGoldm,
          },
          GOLDTEN: {
            ...prev.GOLDTEN,
            quotePrice: newGoldten,
            normalizedPricePer10g: Number(normGoldten.toFixed(2)),
            purityAdjustedPricePer10g: newGoldten,
            change: Number((prev.GOLDTEN.change + goldtenDrift).toFixed(2)),
            syntheticFairValue: Number(sfv999.toFixed(2)),
            spreadToSFV: Number(goldtenSpread.toFixed(2)),
            spreadToSFVBps: Number(((goldtenSpread / sfv999) * 10000).toFixed(1)),
            volume: prev.GOLDTEN.volume + (Math.random() > 0.7 ? 1 : 0),
            status: zGoldten < -1.5 ? 'UNDERPRICED' : zGoldten > 1.5 ? 'OVERPRICED' : 'FAIR',
            zScore: zGoldten,
          },
          GOLDGUINEA: {
            ...prev.GOLDGUINEA,
            quotePrice: newGuinea,
            normalizedPricePer10g: Number(normGuinea.toFixed(2)),
            purityAdjustedPricePer10g: Number(normGuinea.toFixed(2)),
            change: Number((prev.GOLDGUINEA.change + guineaDrift).toFixed(2)),
            syntheticFairValue: Number(sfv999.toFixed(2)),
            spreadToSFV: Number(guineaSpread.toFixed(2)),
            spreadToSFVBps: Number(((guineaSpread / sfv999) * 10000).toFixed(1)),
            volume: prev.GOLDGUINEA.volume,
            status: zGuinea < -1.5 ? 'UNDERPRICED' : zGuinea > 1.5 ? 'OVERPRICED' : 'FAIR',
            zScore: zGuinea,
          },
          GOLDPETAL: {
            ...prev.GOLDPETAL,
            quotePrice: newPetal,
            normalizedPricePer10g: Number(normPetal.toFixed(2)),
            purityAdjustedPricePer10g: Number(normPetal.toFixed(2)),
            change: Number((prev.GOLDPETAL.change + petalDrift).toFixed(2)),
            syntheticFairValue: Number(sfv999.toFixed(2)),
            spreadToSFV: Number(petalSpread.toFixed(2)),
            spreadToSFVBps: Number(((petalSpread / sfv999) * 10000).toFixed(1)),
            volume: prev.GOLDPETAL.volume + (Math.random() > 0.8 ? 1 : 0),
            status: zPetal > 2.0 ? 'OVERPRICED' : 'FAIR',
            zScore: zPetal,
          },
        };
      });

      // 4. Update Hero Convergence Gauge metrics continuously
      setConvergenceState((prev) => {
        const zSpread = 2.2 + (Math.sin(Date.now() / 6000) * 0.45) + (Math.random() * 0.12 - 0.06);
        const zClamped = Math.max(0.4, Number(zSpread.toFixed(2)));
        const pressure = Math.min(98, Math.max(12, Math.round((zClamped / 3.0) * 100)));
        const zone = zClamped >= 2.2 ? 'GOLDEN' : zClamped >= 1.4 ? 'WARNING' : 'NOISE';
        const curSeconds = countdownRef.current;

        return {
          ...prev,
          currentZScore: zClamped,
          pressurePercent: pressure,
          zone,
          action: zClamped >= 2.0 ? 'LONG' : 'NEUTRAL',
          mispricingInr: Number((zClamped * 58.4).toFixed(1)),
          estimatedClosureTime: `${Math.floor(curSeconds / 60)
            .toString()
            .padStart(2, '0')}m ${(curSeconds % 60).toString().padStart(2, '0')}s`,
        };
      });
    }, tickSpeedMs);

    return () => clearInterval(interval);
  }, [isLive, tickSpeedMs]);

  // Correlation Nodes for the 3x3 Transmission Grid
  const correlationNodes: CorrelationNode[] = [
    {
      id: 'usdinr',
      name: 'USD / INR Reference',
      value: `₹${macro.usdInr.toFixed(4)}`,
      unit: 'FX Rate (RBI Ref)',
      change24h: macro.usdInrChangePercent,
      betaToMCX: 0.98,
      transmissionDelayMs: 120,
      direction: macro.usdInrChangePercent >= 0 ? 'UP' : 'DOWN',
      description: 'Primary FX pass-through. +10 paise translates to +₹88/10g domestic impact.',
    },
    {
      id: 'comex',
      name: 'COMEX Gold (GC)',
      value: `$${macro.comexGoldUsdOz.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'USD / Troy Oz',
      change24h: macro.comexChangePercent,
      betaToMCX: 1.02,
      transmissionDelayMs: 45,
      direction: macro.comexChangePercent >= 0 ? 'UP' : 'DOWN',
      description: 'Global price discovery benchmark. Drives 84% of intraday variance.',
    },
    {
      id: 'duty',
      name: 'Import Duty & Port Parity',
      value: `${macro.importDutyPercent.toFixed(1)}%`,
      unit: '6% BCD + 1% AIDC',
      change24h: 0.0,
      betaToMCX: 0.94,
      transmissionDelayMs: 0,
      direction: 'NEUTRAL',
      description: 'Statutory tariff barrier creating structural domestic premium wedge.',
    },
    {
      id: 'sfv',
      name: 'Synthetic Fair Value (SFV)',
      value: `₹${calculateSyntheticFairValue(macro, 999).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'Landed 10g Parity (999)',
      change24h: Number((macro.comexChangePercent + macro.usdInrChangePercent).toFixed(2)),
      betaToMCX: 1.0,
      transmissionDelayMs: 15,
      direction: 'UP',
      description: 'Theoretical landed parity price. Basis anchor for convergence trades.',
    },
    {
      id: 'goldm',
      name: 'MCX GOLDM (Mini 100g)',
      value: `₹${ticks.GOLDM.quotePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'Native 10g (995 Purity)',
      change24h: ticks.GOLDM.changePercent,
      betaToMCX: 1.0,
      transmissionDelayMs: 10,
      direction: 'UP',
      description: 'Highest institutional volume and tightest bid-ask liquidity in Indian bullion.',
    },
    {
      id: 'goldten',
      name: 'MCX GOLDTEN (10g)',
      value: `₹${ticks.GOLDTEN.quotePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'Native 10g (999 Purity)',
      change24h: ticks.GOLDTEN.changePercent,
      betaToMCX: 0.96,
      transmissionDelayMs: 80,
      direction: 'UP',
      description: 'New 999 contract listed 2025. Frequent micro-basis opportunities vs GOLDM.',
    },
    {
      id: 'goldguinea',
      name: 'MCX GOLDGUINEA (8g)',
      value: `₹${ticks.GOLDGUINEA.quotePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'Native 8g (999 Purity)',
      change24h: ticks.GOLDGUINEA.changePercent,
      betaToMCX: 0.91,
      transmissionDelayMs: 140,
      direction: 'UP',
      description: 'Physical coin quotation unit with slight coin delivery handling premium.',
    },
    {
      id: 'goldpetal',
      name: 'MCX GOLDPETAL (1g)',
      value: `₹${ticks.GOLDPETAL.quotePrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      unit: 'Native 1g (999 Purity)',
      change24h: ticks.GOLDPETAL.changePercent,
      betaToMCX: 0.85,
      transmissionDelayMs: 320,
      direction: 'UP',
      description: 'Micro-retail contract showing persistent retail packaging/minting premium.',
    },
    {
      id: 'carry',
      name: 'Cost of Carry Parity',
      value: `${(macro.carryingCostAnnualBps / 100).toFixed(2)}%`,
      unit: 'RBI 6.5% + Vault 0.7%',
      change24h: 0.0,
      betaToMCX: 0.42,
      transmissionDelayMs: 0,
      direction: 'NEUTRAL',
      description: 'Term structure curvature governing roll-down decay across forward tenors.',
    },
  ];

  // Manual market shock simulator for interactive demo
  const triggerVolatilityShock = useCallback(() => {
    setMacro((prev) => ({
      ...prev,
      comexGoldUsdOz: prev.comexGoldUsdOz + 18.5,
      comexChangePercent: prev.comexChangePercent + 0.68,
      usdInr: prev.usdInr + 0.18,
    }));
    setTicks((prev) => ({
      ...prev,
      GOLDM: {
        ...prev.GOLDM,
        quotePrice: prev.GOLDM.quotePrice + 120, // laggard, widens arbitrage
      },
      GOLDTEN: {
        ...prev.GOLDTEN,
        quotePrice: prev.GOLDTEN.quotePrice + 310,
      },
    }));
    setConvergenceState((prev) => ({
      ...prev,
      currentZScore: 2.89,
      pressurePercent: 94,
      zone: 'GOLDEN',
      mispricingInr: 184.2,
      countdownSeconds: 380,
    }));
  }, []);

  // Lock In Alpha Execution Handler
  const executeSimulationTrade = useCallback(
    (longSymbol: MCXContractSymbol, shortSymbol: MCXContractSymbol, lots: number) => {
      const opp = calculateArbitrageOpportunity(
        longSymbol,
        shortSymbol,
        ticks[longSymbol].quotePrice,
        ticks[shortSymbol].quotePrice
      );

      const newOrder: ExecutionOrder = {
        id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false }) + ' IST',
        strategy: 'CROSS_CONTRACT_RV',
        longLeg: {
          symbol: longSymbol,
          lots: opp.longLots,
          entryPrice: ticks[longSymbol].quotePrice,
        },
        shortLeg: {
          symbol: shortSymbol,
          lots: opp.shortLots,
          entryPrice: ticks[shortSymbol].quotePrice,
        },
        capitalDeployed: opp.requiredMargin,
        grossAlphaInr: Math.round(opp.grossConvergenceProfit),
        exchangeFeesInr: Math.round(opp.exchangeFees),
        sttInr: Math.round(opp.taxes),
        stampDutyInr: Math.round(opp.taxes * 0.15),
        slippageInr: Math.round(opp.slippage),
        netAlphaInr: Math.round(opp.netAlphaInr),
        netReturnBps: Number((opp.netReturnPercent * 100).toFixed(1)),
        riskRewardRatio: opp.riskRewardRatio,
        status: 'ACTIVE',
      };

      setBlotterOrders((prev) => [newOrder, ...prev]);
      return newOrder;
    },
    [ticks]
  );

  const updateMacro = useCallback((updated: Partial<MacroVariables>) => {
    setMacro((prev) => ({ ...prev, ...updated }));
  }, []);

  const resetMacro = useCallback(() => {
    setMacro(INITIAL_MACRO);
  }, []);

  return {
    macro,
    updateMacro,
    resetMacro,
    ticks,
    convergenceState,
    correlationNodes,
    blotterOrders,
    isLive,
    setIsLive,
    tickSpeedMs,
    setTickSpeedMs,
    tickCount,
    lastTickTime,
    lastTickDirection,
    tickDeltas,
    countdownSeconds,
    activeDriver,
    setActiveDriver,
    triggerVolatilityShock,
    executeSimulationTrade,
  };
}
