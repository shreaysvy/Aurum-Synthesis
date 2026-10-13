export type MCXContractSymbol = 'GOLDM' | 'GOLDTEN' | 'GOLDGUINEA' | 'GOLDPETAL';

export interface MCXContractSpec {
  symbol: MCXContractSymbol;
  name: string;
  tradingUnit: string;
  tradingUnitGrams: number;
  quotationBase: string;
  quotationBaseGrams: number;
  purity: number; // 995 or 999
  expiryWindow: string;
  nextExpiry: string;
  tickSize: number; // in INR
  lotSize: number;
  marginPercent: number; // e.g. 11%
  typicalSlippageBps: number;
  historicalAvailability: string; // e.g. "Available since 2025" for GOLDTEN
}

export interface ContractPriceTick {
  symbol: MCXContractSymbol;
  quotePrice: number; // Current market price in its native quote unit
  normalizedPricePer10g: number; // Normalized to 10g @ 999 purity
  purityAdjustedPricePer10g: number;
  change: number;
  changePercent: number;
  syntheticFairValue: number;
  spreadToSFV: number; // Market - SFV
  spreadToSFVBps: number;
  volume: number; // Contracts traded
  openInterest: number;
  depthRatio: number; // Bid/Ask depth ratio
  liquidityTier: 'TIER-1 (High)' | 'TIER-2 (Moderate)' | 'TIER-3 (Thin)';
  status: 'FAIR' | 'OVERPRICED' | 'UNDERPRICED';
  zScore: number;
}

export interface MacroVariables {
  comexGoldUsdOz: number; // e.g. $2,684.50
  comexChangePercent: number;
  usdInr: number; // e.g. 84.32
  usdInrChangePercent: number;
  importDutyPercent: number; // 6% BCD + 1% AIDC = 7%
  clearingFeeInr10g: number; // ~₹120
  rbiRepoRate: number; // 6.50%
  carryingCostAnnualBps: number; // 7.20%
}

export interface ConvergenceState {
  currentZScore: number; // e.g. 2.45
  pressurePercent: number; // 0 - 100%
  zone: 'NOISE' | 'WARNING' | 'GOLDEN';
  targetSymbol: MCXContractSymbol;
  benchmarkSymbol: MCXContractSymbol;
  pairName: string;
  theoreticalSpreadInr: number;
  actualSpreadInr: number;
  mispricingInr: number;
  action: 'LONG' | 'SHORT' | 'NEUTRAL';
  halfLifeHours: number;
  countdownSeconds: number;
  estimatedClosureTime: string;
  historicalHitRate: number; // e.g. 82.4%
}

export interface CorrelationNode {
  id: string;
  name: string;
  value: string;
  unit: string;
  change24h: number;
  betaToMCX: number; // Sensitivity elasticity
  transmissionDelayMs: number;
  direction: 'UP' | 'DOWN' | 'NEUTRAL';
  description: string;
}

export interface ExecutionOrder {
  id: string;
  timestamp: string;
  strategy: 'CROSS_CONTRACT_RV' | 'SFV_CASH_AND_CARRY' | 'RETAIL_PREMIUM_HARVEST';
  longLeg: {
    symbol: MCXContractSymbol | 'COMEX_SYNTHETIC';
    lots: number;
    entryPrice: number;
  };
  shortLeg: {
    symbol: MCXContractSymbol | 'COMEX_SYNTHETIC';
    lots: number;
    entryPrice: number;
  };
  capitalDeployed: number;
  grossAlphaInr: number;
  exchangeFeesInr: number;
  sttInr: number;
  stampDutyInr: number;
  slippageInr: number;
  netAlphaInr: number;
  netReturnBps: number;
  riskRewardRatio: string;
  status: 'ACTIVE' | 'CONVERGED' | 'STOPPED';
}

export interface BhavcopyEntry {
  tradeDate: string; // DD/MM/YYYY
  symbol: MCXContractSymbol;
  expiryDate: string; // e.g. "05NOV2026"
  open: number;
  high: number;
  low: number;
  close: number;
  settlePrice: number;
  volume: number;
  openInterest: number;
  normalizedPrice10g: number;
  spreadVsGoldm10g: number;
  zScore: number;
  isExecutable: boolean;
}

export interface TermStructurePoint {
  tenor: string;
  expiryDate: string;
  daysToExpiry: number;
  marketPrice: number;
  annualizedCarryCost: number;
  mechanicalRollDownValue: number;
  genuineMispricingBps: number;
  curveState: 'CONTANGO' | 'BACKWARDATION' | 'FLAT';
  volumeOIratio: number;
}

export interface BacktestSummary {
  periodDays: number;
  totalTrades: number;
  winRatePercent: number;
  grossPnLInr: number;
  netPnLInr: number;
  statutoryTaxesInr: number;
  exchangeFrictionInr: number;
  sharpeRatioNet: number;
  sharpeRatioGross: number;
  maxDrawdownPercent: number;
  profitFactor: number;
  alphaAttributionPercent: number; // % from pure basis convergence
  betaAttributionPercent: number; // % from underlying gold movement (hedged to 0)
  edgeSurvivesCosts: boolean;
  equityCurve: {
    day: number;
    date: string;
    grossEquity: number;
    netEquity: number;
    underlyingGoldBench: number;
  }[];
}

export interface ContractLifecycle {
  symbol: MCXContractSymbol;
  name: string;
  contractSeries: string;
  listingDate: string;
  peakLiquidityWindow: string;
  tenderStartDate: string;
  expiryDate: string;
  tenderMarginPercent: number;
  status: 'ACTIVE' | 'TENDER_WINDOW' | 'EXPIRED' | 'UPCOMING';
  historicalSampleStart: string;
  currentDaysToExpiry: number;
  liquidityPhase: 'DEVELOPING' | 'PEAK_DEPTH' | 'TENDER_SURGE' | 'ROLLOVER_COMPLETE';
  dailyVolumeAvgLots: number;
  openInterestAvgLots: number;
  marketDepthScore: number;
  recommendedAction: string;
}

export interface PlannedTradePosition {
  id: string;
  contractSymbol: MCXContractSymbol;
  contractExpiry: string;
  entryDate: string;
  targetExitDate: string;
  lots: number;
  tenderRiskScore: 'SAFE' | 'WARNING' | 'CRITICAL_TENDER_ZONE';
  liquidityRisk: 'OPTIMAL' | 'MODERATE_SLIPPAGE' | 'ILLIQUID_RISK';
  notes: string;
}
