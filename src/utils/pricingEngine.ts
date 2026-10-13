import {
  MCXContractSpec,
  MCXContractSymbol,
  MacroVariables,
} from '../types/market';

export const TROY_OUNCE_TO_GRAMS = 31.1034768;

export const CONTRACT_SPECS: Record<MCXContractSymbol, MCXContractSpec> = {
  GOLDM: {
    symbol: 'GOLDM',
    name: 'Gold Mini (100g)',
    tradingUnit: '100 grams',
    tradingUnitGrams: 100,
    quotationBase: '10 grams',
    quotationBaseGrams: 10,
    purity: 995,
    expiryWindow: '3rd–5th of expiry month',
    nextExpiry: '05NOV2026',
    tickSize: 1.0,
    lotSize: 10, // 10 units of 10g = 100g
    marginPercent: 0.11, // 11%
    typicalSlippageBps: 1.2,
    historicalAvailability: 'Full historical continuous series',
  },
  GOLDTEN: {
    symbol: 'GOLDTEN',
    name: 'Gold Ten (10g)',
    tradingUnit: '10 grams',
    tradingUnitGrams: 10,
    quotationBase: '10 grams',
    quotationBaseGrams: 10,
    purity: 999,
    expiryWindow: '27th–31st of expiry month',
    nextExpiry: '28NOV2026',
    tickSize: 1.0,
    lotSize: 1, // 1 unit of 10g
    marginPercent: 0.115,
    typicalSlippageBps: 3.5,
    historicalAvailability: 'Listed 2025 onwards (Shorter historical sample)',
  },
  GOLDGUINEA: {
    symbol: 'GOLDGUINEA',
    name: 'Gold Guinea (8g)',
    tradingUnit: '8 grams',
    tradingUnitGrams: 8,
    quotationBase: '8 grams',
    quotationBaseGrams: 8,
    purity: 999,
    expiryWindow: '27th–31st of expiry month',
    nextExpiry: '28NOV2026',
    tickSize: 1.0,
    lotSize: 1,
    marginPercent: 0.12,
    typicalSlippageBps: 6.8,
    historicalAvailability: 'Full historical series with physical retail bias',
  },
  GOLDPETAL: {
    symbol: 'GOLDPETAL',
    name: 'Gold Petal (1g)',
    tradingUnit: '1 gram',
    tradingUnitGrams: 1,
    quotationBase: '1 gram',
    quotationBaseGrams: 1,
    purity: 999,
    expiryWindow: '27th–31st of expiry month',
    nextExpiry: '28NOV2026',
    tickSize: 1.0,
    lotSize: 1,
    marginPercent: 0.13,
    typicalSlippageBps: 14.2,
    historicalAvailability: 'Full historical series (High retail minting premium)',
  },
};

/**
 * Calculates Synthetic Fair Value (SFV) for Gold in INR per 10g (999 purity benchmark)
 * Formula:
 * (COMEX / 31.1034768 * 10 * USDINR) * (1 + Import Duty) + Freight & Port Handling
 */
export function calculateSyntheticFairValue(
  macro: MacroVariables,
  purity: number = 999
): number {
  const usdPerGram = macro.comexGoldUsdOz / TROY_OUNCE_TO_GRAMS;
  const inrPer10gRaw = usdPerGram * 10 * macro.usdInr;
  const landedWithDuty =
    inrPer10gRaw * (1 + macro.importDutyPercent / 100) + macro.clearingFeeInr10g;

  if (purity === 995) {
    return landedWithDuty * (995 / 999);
  }
  return landedWithDuty;
}

/**
 * Normalizes any MCX Gold contract market quote to 10g @ 999 purity equivalent
 */
export function normalizePriceTo10g999(
  symbol: MCXContractSymbol,
  quotePrice: number
): number {
  switch (symbol) {
    case 'GOLDM':
      // GOLDM is quoted per 10g for 995 purity.
      // 999 equivalent = Quote * (999 / 995)
      return quotePrice * (999 / 995);
    case 'GOLDTEN':
      // GOLDTEN is quoted per 10g for 999 purity directly.
      return quotePrice;
    case 'GOLDGUINEA':
      // GOLDGUINEA is quoted per 8g for 999 purity.
      // Price per 10g = (Quote / 8) * 10
      return (quotePrice / 8) * 10;
    case 'GOLDPETAL':
      // GOLDPETAL is quoted per 1g for 999 purity.
      // Price per 10g = Quote * 10
      return quotePrice * 10;
    default:
      return quotePrice;
  }
}

/**
 * Converts a normalized 10g 999 price back into native quotation unit
 */
export function denormalizeFrom10g999(
  symbol: MCXContractSymbol,
  normalized10gPrice: number
): number {
  switch (symbol) {
    case 'GOLDM':
      return normalized10gPrice * (995 / 999);
    case 'GOLDTEN':
      return normalized10gPrice;
    case 'GOLDGUINEA':
      return (normalized10gPrice * 8) / 10;
    case 'GOLDPETAL':
      return normalized10gPrice / 10;
    default:
      return normalized10gPrice;
  }
}

/**
 * MCX Statutory and Transaction Cost Engine
 * Accurately models SEBI/MCX institutional cost structure
 */
export interface TradeCostBreakdown {
  turnoverInr: number;
  mcxTurnoverFee: number; // 0.0021%
  stt: number; // 0.0125% on sell leg
  stampDuty: number; // 0.002% on buy leg
  sebiTurnoverFee: number; // 0.0001%
  gstOnCharges: number; // 18% on (mcx + sebi)
  slippageCost: number; // Bid-ask depth friction
  totalCostInr: number;
  costInBps: number;
}

export function computeTradeCosts(
  symbol: MCXContractSymbol,
  quotePrice: number,
  lots: number,
  isSell: boolean,
  isCrossSpread: boolean = false
): TradeCostBreakdown {
  const spec = CONTRACT_SPECS[symbol];
  // Calculate total turnover in INR
  let totalGrams = 0;
  if (symbol === 'GOLDM') totalGrams = lots * 100;
  else if (symbol === 'GOLDTEN') totalGrams = lots * 10;
  else if (symbol === 'GOLDGUINEA') totalGrams = lots * 8;
  else if (symbol === 'GOLDPETAL') totalGrams = lots * 1;

  // Turnover = (Price / quotationBaseGrams) * totalGrams
  const turnoverInr = (quotePrice / spec.quotationBaseGrams) * totalGrams;

  const mcxTurnoverFee = turnoverInr * 0.000021; // 0.0021%
  const sebiTurnoverFee = turnoverInr * 0.000001; // 0.0001%
  const stt = isSell ? turnoverInr * 0.000125 : 0; // 0.0125% on sell only
  const stampDuty = !isSell ? turnoverInr * 0.00002 : 0; // 0.002% on buy only
  const gstOnCharges = (mcxTurnoverFee + sebiTurnoverFee) * 0.18; // 18% GST

  // Slippage modeled by liquidity tier
  const slippageBps = spec.typicalSlippageBps;
  const slippageCost = turnoverInr * (slippageBps / 10000);

  const totalCostInr =
    mcxTurnoverFee +
    sebiTurnoverFee +
    stt +
    stampDuty +
    gstOnCharges +
    slippageCost;

  const costInBps = (totalCostInr / turnoverInr) * 10000;

  return {
    turnoverInr,
    mcxTurnoverFee,
    stt,
    stampDuty,
    sebiTurnoverFee,
    gstOnCharges,
    slippageCost,
    totalCostInr,
    costInBps,
  };
}

/**
 * Calculates multi-leg arbitrage position economics
 */
export function calculateArbitrageOpportunity(
  longSymbol: MCXContractSymbol,
  shortSymbol: MCXContractSymbol,
  longQuote: number,
  shortQuote: number,
  baseCapitalInr: number = 2500000 // ₹25 Lakhs institutional margin
) {
  const longNorm = normalizePriceTo10g999(longSymbol, longQuote);
  const shortNorm = normalizePriceTo10g999(shortSymbol, shortQuote);

  // Spread per 10g in normalized terms
  const grossMispricingPer10g = shortNorm - longNorm;

  // Standard deviation of normalized spread between these two contracts
  const historicalMeanSpread = 12.5; // Theoretical parity drift due to delivery mechanics
  const historicalStdDev = 28.0;

  const zScore = (grossMispricingPer10g - historicalMeanSpread) / historicalStdDev;

  // Sizing: based on 100g equivalent chunks
  const targetGrams = 200; // 200 grams notional test sizing
  const longLots = Math.max(1, Math.round(targetGrams / CONTRACT_SPECS[longSymbol].tradingUnitGrams));
  const shortLots = Math.max(1, Math.round(targetGrams / CONTRACT_SPECS[shortSymbol].tradingUnitGrams));

  const longCost = computeTradeCosts(longSymbol, longQuote, longLots, false);
  const shortCost = computeTradeCosts(shortSymbol, shortQuote, shortLots, true);

  const totalNotional = longCost.turnoverInr + shortCost.turnoverInr;
  const requiredMargin = totalNotional * 0.115; // ~11.5% SPAN + Exposure

  // Gross profit if normalized prices converge to mean
  const grossConvergenceProfit =
    ((grossMispricingPer10g - historicalMeanSpread) / 10) * targetGrams;

  const totalFriction = longCost.totalCostInr + shortCost.totalCostInr;
  const netAlphaInr = grossConvergenceProfit - totalFriction;
  const netReturnPercent = (netAlphaInr / requiredMargin) * 100;

  // Max drawdown risk assumption (spread widening to 3.5 sigma)
  const maxRiskLoss = Math.abs((3.5 - Math.abs(zScore)) * historicalStdDev * (targetGrams / 10)) + totalFriction;
  const riskRewardRatio = Math.max(0.1, grossConvergenceProfit / (maxRiskLoss || 1));

  return {
    zScore,
    longLots,
    shortLots,
    grossMispricingPer10g,
    grossConvergenceProfit,
    totalFriction,
    taxes: longCost.stt + shortCost.stt + longCost.stampDuty + shortCost.stampDuty,
    exchangeFees: longCost.mcxTurnoverFee + shortCost.mcxTurnoverFee + longCost.gstOnCharges + shortCost.gstOnCharges,
    slippage: longCost.slippageCost + shortCost.slippageCost,
    netAlphaInr,
    requiredMargin,
    netReturnPercent,
    riskRewardRatio: `1 : ${riskRewardRatio.toFixed(1)}`,
    isProfitableAfterCosts: netAlphaInr > 0,
  };
}
