import { MarketData } from '../hooks/useMarketData';
import { Panel, PanelHead, Button, Rule, Badge } from '../ui/primitives';
import { MachinedSlider } from '../ui/MachinedSlider';
import { Odometer } from '../ui/Odometer';
import { Delta } from '../ui/Icon';
import { calculateSyntheticFairValue } from '../utils/pricingEngine';
import { INITIAL_MACRO } from '../data/mockMarketData';
import { inr, bps, pct, toneFor } from '../utils/format';

export function Scenario({ m }: { m: MarketData }) {
  const sfv999 = calculateSyntheticFairValue(m.macro, 999);
  const sfv995 = calculateSyntheticFairValue(m.macro, 995);
  const baseline = calculateSyntheticFairValue(INITIAL_MACRO, 999);
  const drift = sfv999 - baseline;

  return (
    <div className="wipe-in">
      <div className="grid grid-cols-1 gap-px bg-[var(--rule-hair)] lg:grid-cols-12">
        {/* ---- Inputs ---- */}
        <Panel className="border-0 lg:col-span-5">
          <PanelHead label="Macro inputs" right={
            <Button variant="quiet" onClick={m.resetMacro}>Reset</Button>
          }>
            Move an input and the fair value recomputes against every contract.
          </PanelHead>

          <div className="divide-y divide-[var(--rule-hair)]">
            <MachinedSlider
              label="COMEX gold" unit="USD / oz"
              value={m.macro.comexGoldUsdOz} min={2200} max={3200} step={0.1}
              onChange={(n) => m.updateMacro({ comexGoldUsdOz: n })}
              format={(n) => `$${n.toFixed(0)}`}
            />
            <MachinedSlider
              label="USD / INR" unit="INR"
              value={m.macro.usdInr} min={78} max={92} step={0.005}
              onChange={(n) => m.updateMacro({ usdInr: n })}
              format={(n) => n.toFixed(2)}
            />
            <MachinedSlider
              label="Import duty" unit="percent"
              value={m.macro.importDutyPercent} min={0} max={15} step={0.25}
              onChange={(n) => m.updateMacro({ importDutyPercent: n })}
              format={(n) => `${n.toFixed(1)}%`}
            />
            <MachinedSlider
              label="Clearing and vault fee" unit="INR / 10g"
              value={m.macro.clearingFeeInr10g} min={0} max={400} step={5}
              onChange={(n) => m.updateMacro({ clearingFeeInr10g: n })}
              format={(n) => `${n.toFixed(0)}`}
            />
          </div>

          <Rule />
          <div className="px-4 py-4">
            <Button variant="ruled" icon="warning" onClick={m.triggerVolatilityShock} className="w-full">
              Trigger volatility shock
            </Button>
          </div>
        </Panel>

        {/* ---- Output ---- */}
        <Panel className="border-0 lg:col-span-7">
          <PanelHead label="Synthetic fair value" right={
            <Badge tone={Math.abs(drift) < 1 ? 'neutral' : 'brass'}>
              {Math.abs(drift) < 1 ? 'At baseline' : 'Shifted'}
            </Badge>
          } />

          <div className="px-4 py-6">
            <p className="t-label text-[var(--ink-tertiary)]">Per 10 grams at 999 purity</p>
            <p className="t-data-xl mt-2 text-[var(--brass)]">
              <Odometer value={inr(sfv999, { decimals: 2 })} />
            </p>
            <p className="mt-2 inline-flex items-center gap-2 t-data-s"
              style={{ color: toneFor(drift) === 'verdigris' ? 'var(--verdigris)' : toneFor(drift) === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}>
              <Delta value={drift} />
              {inr(drift, { decimals: 2, signed: true })} against baseline
            </p>

            <Rule className="my-5" />

            <dl className="grid grid-cols-2 gap-5">
              <div>
                <dt className="t-label-s text-[var(--ink-tertiary)]">995 purity equivalent</dt>
                <dd className="t-data-l mt-1 text-[var(--ink)]"><Odometer value={inr(sfv995, { decimals: 2 })} /></dd>
              </div>
              <div>
                <dt className="t-label-s text-[var(--ink-tertiary)]">Landed duty component</dt>
                <dd className="t-data-l mt-1 text-[var(--ink)]">
                  <Odometer value={inr(sfv999 - sfv999 / (1 + m.macro.importDutyPercent / 100), { decimals: 2 })} />
                </dd>
              </div>
            </dl>
          </div>

          <Rule />
          <PanelHead label="Contract response" />
          <ul className="divide-y divide-[var(--rule-hair)]">
            {Object.values(m.ticks).map((t) => {
              const spread = t.normalizedPricePer10g - sfv999;
              const spreadBps = (spread / sfv999) * 10000;
              const tone = toneFor(spreadBps);
              return (
                <li key={t.symbol} className="flex items-baseline justify-between gap-4 px-4 py-3">
                  <span className="t-label text-[var(--ink)]">{t.symbol}</span>
                  <span className="t-data-m text-[var(--ink-tertiary)]">
                    <Odometer value={inr(t.normalizedPricePer10g, { decimals: 2 })} />
                  </span>
                  <span className="inline-flex w-28 items-center justify-end gap-1.5 t-data-m"
                    style={{ color: tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}>
                    <Delta value={spreadBps} />
                    <Odometer value={bps(spreadBps)} />
                    <span className="t-label-s text-[var(--ink-tertiary)]">bps</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="t-label-s px-4 py-3 text-[var(--stale)]">
            Repo rate {pct(m.macro.rbiRepoRate, 2, false)}. Carry {m.macro.carryingCostAnnualBps} bps annualized.
          </p>
        </Panel>
      </div>
    </div>
  );
}
