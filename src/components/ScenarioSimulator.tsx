import React, { useState } from 'react';
import { Sliders, RefreshCw, Zap, ShieldAlert, ArrowRight, TrendingUp } from 'lucide-react';
import { MacroVariables } from '../types/market';
import { calculateSyntheticFairValue } from '../utils/pricingEngine';
import { sound } from '../utils/audioEngine';

interface ScenarioSimulatorProps {
  currentMacro: MacroVariables;
  onApplyScenario: (updated: Partial<MacroVariables>) => void;
  onReset: () => void;
}

export const ScenarioSimulator: React.FC<ScenarioSimulatorProps> = ({
  currentMacro,
  onApplyScenario,
  onReset,
}) => {
  const [comexSlider, setComexSlider] = useState<number>(currentMacro.comexGoldUsdOz);
  const [usdInrSlider, setUsdInrSlider] = useState<number>(currentMacro.usdInr);
  const [dutySlider, setDutySlider] = useState<number>(currentMacro.importDutyPercent);

  // Recalculate hypothetical SFV under user scenario
  const scenarioSFV = calculateSyntheticFairValue(
    {
      ...currentMacro,
      comexGoldUsdOz: comexSlider,
      usdInr: usdInrSlider,
      importDutyPercent: dutySlider,
    },
    999
  );

  const baselineSFV = calculateSyntheticFairValue(currentMacro, 999);
  const sfvImpactInr = scenarioSFV - baselineSFV;

  const handleApplyPreset = (
    name: string,
    comex: number,
    fx: number,
    duty: number
  ) => {
    sound.playClick();
    setComexSlider(comex);
    setUsdInrSlider(fx);
    setDutySlider(duty);
    onApplyScenario({
      comexGoldUsdOz: comex,
      usdInr: fx,
      importDutyPercent: duty,
    });
  };

  const handleApplySliders = () => {
    sound.playClick();
    onApplyScenario({
      comexGoldUsdOz: comexSlider,
      usdInr: usdInrSlider,
      importDutyPercent: dutySlider,
    });
  };

  const handleReset = () => {
    sound.playClick();
    setComexSlider(currentMacro.comexGoldUsdOz);
    setUsdInrSlider(currentMacro.usdInr);
    setDutySlider(currentMacro.importDutyPercent);
    onReset();
  };

  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#0A0D14]/80 p-8 lg:p-9 backdrop-blur-xl shadow-2xl">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-white/[0.06] pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#71717A]">
              STRESS TESTING & SCENARIO ENGINE
            </span>
            <span className="rounded-md bg-[#FFD700]/15 px-2 py-0.5 text-[11px] font-bold text-[#FFD700]">
              MACRO SHOCK RE-PRICING
            </span>
          </div>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[#F8F9FA]">
            Macroeconomic Shock & Basis Simulator
          </h2>
          <p className="mt-1 text-xs text-[#888888]">
            Simulate offshore FX moves, US CPI surprises, and statutory customs tariff shifts to test model resilience
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-[#A1A1AA] hover:text-[#F8F9FA] hover:border-white/20 transition-all backdrop-blur-md"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reset to Live Feed</span>
        </button>
      </div>

      {/* Preset Scenario Cards (Spacious & Clean) */}
      <div className="my-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <button
          onClick={() =>
            handleApplyPreset(
              'CPI Surprise',
              currentMacro.comexGoldUsdOz + 42,
              currentMacro.usdInr + 0.35,
              currentMacro.importDutyPercent
            )
          }
          className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left hover:border-[#FFD700]/50 hover:bg-white/[0.05] transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between font-bold text-[#F8F9FA] group-hover:text-[#FFD700]">
            <span>1. US CPI Hot Surprise</span>
            <Zap className="h-4 w-4 text-[#FFD700]" />
          </div>
          <p className="mt-2 text-[11px] text-[#71717A] leading-relaxed">
            COMEX +$42/oz, USD/INR +35p. Extreme upward domestic price impulse.
          </p>
        </button>

        <button
          onClick={() =>
            handleApplyPreset(
              'RBI FX Intervention',
              currentMacro.comexGoldUsdOz,
              83.95,
              currentMacro.importDutyPercent
            )
          }
          className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left hover:border-emerald-500/50 hover:bg-white/[0.05] transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between font-bold text-[#F8F9FA] group-hover:text-emerald-400">
            <span>2. RBI FX Intervention</span>
            <TrendingUp className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="mt-2 text-[11px] text-[#71717A] leading-relaxed">
            USD/INR drops to 83.95. Compresses landed SFV parity by ₹320/10g.
          </p>
        </button>

        <button
          onClick={() =>
            handleApplyPreset(
              'Tariff Reduction',
              currentMacro.comexGoldUsdOz,
              currentMacro.usdInr,
              5.0
            )
          }
          className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left hover:border-amber-500/50 hover:bg-white/[0.05] transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between font-bold text-[#F8F9FA] group-hover:text-amber-400">
            <span>3. Customs Tariff Cut (5%)</span>
            <ShieldAlert className="h-4 w-4 text-amber-400" />
          </div>
          <p className="mt-2 text-[11px] text-[#71717A] leading-relaxed">
            Import duty cuts 7% $\rightarrow$ 5%. Triggers immediate domestic basis deflation.
          </p>
        </button>

        <button
          onClick={() =>
            handleApplyPreset(
              'Safe Haven Contango',
              currentMacro.comexGoldUsdOz + 65,
              currentMacro.usdInr - 0.15,
              currentMacro.importDutyPercent
            )
          }
          className="rounded-xl border border-white/[0.08] bg-black/40 p-4 text-left hover:border-[#FFD700]/50 hover:bg-white/[0.05] transition-all group backdrop-blur-md"
        >
          <div className="flex items-center justify-between font-bold text-[#F8F9FA] group-hover:text-[#FFD700]">
            <span>4. Geopolitical Flight</span>
            <Zap className="h-4 w-4 text-[#FFD700]" />
          </div>
          <p className="mt-2 text-[11px] text-[#71717A] leading-relaxed">
            COMEX breaks out +$65/oz. Liquidity premium drives cross-contract spreads.
          </p>
        </button>
      </div>

      {/* Interactive Sliders Section */}
      <div className="rounded-xl border border-white/[0.08] bg-black/40 p-6 text-xs backdrop-blur-md">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#71717A] mb-4">
          Manual Stress Sliders
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* COMEX Gold Slider */}
          <div>
            <div className="flex items-center justify-between text-[#888888] mb-1.5">
              <span>COMEX Gold (USD/oz)</span>
              <span className="font-mono font-bold text-[#F8F9FA]">
                ${comexSlider.toFixed(1)}
              </span>
            </div>
            <input
              type="range"
              min="2400"
              max="3000"
              step="5"
              value={comexSlider}
              onChange={(e) => setComexSlider(Number(e.target.value))}
              className="w-full accent-[#FFD700]"
            />
            <div className="flex justify-between text-[10px] text-[#555] mt-1 font-mono">
              <span>$2,400</span>
              <span>$3,000</span>
            </div>
          </div>

          {/* USD/INR FX Slider */}
          <div>
            <div className="flex items-center justify-between text-[#888888] mb-1.5">
              <span>USD/INR Exchange Rate</span>
              <span className="font-mono font-bold text-[#F8F9FA]">
                ₹{usdInrSlider.toFixed(3)}
              </span>
            </div>
            <input
              type="range"
              min="82.0"
              max="86.5"
              step="0.05"
              value={usdInrSlider}
              onChange={(e) => setUsdInrSlider(Number(e.target.value))}
              className="w-full accent-[#FFD700]"
            />
            <div className="flex justify-between text-[10px] text-[#555] mt-1 font-mono">
              <span>₹82.0</span>
              <span>₹86.5</span>
            </div>
          </div>

          {/* Import Duty Slider */}
          <div>
            <div className="flex items-center justify-between text-[#888888] mb-1.5">
              <span>Import Duty (%)</span>
              <span className="font-mono font-bold text-[#F8F9FA]">
                {dutySlider.toFixed(1)}%
              </span>
            </div>
            <input
              type="range"
              min="3.0"
              max="15.0"
              step="0.5"
              value={dutySlider}
              onChange={(e) => setDutySlider(Number(e.target.value))}
              className="w-full accent-[#FFD700]"
            />
            <div className="flex justify-between text-[10px] text-[#555] mt-1 font-mono">
              <span>3.0%</span>
              <span>15.0%</span>
            </div>
          </div>
        </div>

        {/* Live Re-calculation Result */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1C1C1C] pt-4">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-[10px] uppercase text-[#71717A]">Stress-Tested SFV (999)</span>
              <div className="font-mono text-lg font-bold text-[#FFD700] tabular-nums">
                ₹{scenarioSFV.toLocaleString('en-IN', { maximumFractionDigits: 1 })} / 10g
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase text-[#71717A]">Net Price Delta vs Live</span>
              <div
                className={`font-mono text-lg font-bold tabular-nums ${
                  sfvImpactInr >= 0 ? 'text-[#10B981]' : 'text-[#EF4444]'
                }`}
              >
                {sfvImpactInr >= 0 ? '+' : ''}₹{sfvImpactInr.toFixed(1)} (
                {((sfvImpactInr / baselineSFV) * 100).toFixed(2)}%)
              </div>
            </div>
          </div>

          <button
            onClick={handleApplySliders}
            className="rounded-lg bg-[#FFD700] px-5 py-2 text-xs font-bold text-black uppercase tracking-wider hover:bg-[#FFE033] transition-colors"
          >
            Apply Scenario to Model
          </button>
        </div>
      </div>
    </div>
  );
};
