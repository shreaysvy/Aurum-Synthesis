import { useState } from 'react';
import { MarketData } from '../hooks/useMarketData';
import { MCXContractSymbol } from '../types/market';
import { BalanceGauge } from '../ui/BalanceGauge';
import { ContractLedger } from '../ui/ContractLedger';
import { CostWaterfall } from '../ui/CostWaterfall';
import { Panel, PanelHead, Button, Rule, Badge } from '../ui/primitives';
import { Odometer } from '../ui/Odometer';
import { Icon, Delta } from '../ui/Icon';
import { calculateArbitrageOpportunity, CONTRACT_SPECS } from '../utils/pricingEngine';
import { inr, pct, count, toneFor } from '../utils/format';

export function Command({ m }: { m: MarketData }) {
  const [longSym, setLongSym] = useState<MCXContractSymbol>(m.convergenceState.targetSymbol);
  const [shortSym, setShortSym] = useState<MCXContractSymbol>(m.convergenceState.benchmarkSymbol);
  const [mult, setMult] = useState(1);

  const opp = calculateArbitrageOpportunity(
    longSym, shortSym, m.ticks[longSym].quotePrice, m.ticks[shortSym].quotePrice
  );

  return (
    <div className="wipe-in">
      {/* ---- Primary instrument row: 7 / 5 asymmetric ---- */}
      <div className="grid grid-cols-1 gap-px bg-[var(--rule-hair)] lg:grid-cols-12">
        <Panel className="border-0 lg:col-span-7">
          <BalanceGauge state={m.convergenceState} />
        </Panel>

        <Panel className="border-0 lg:col-span-5">
          <PanelHead label="Contract ledger" right={<Badge tone="stale">Generated</Badge>} />
          <ContractLedger ticks={m.ticks} onSelect={setLongSym} selected={longSym} />
        </Panel>
      </div>

      {/* ---- Macro transmission chain ---- */}
      <Panel className="mt-px border-0">
        <PanelHead label="Macro transmission chain">
          Each driver's elasticity to the MCX quote, with its observed propagation delay.
        </PanelHead>
        <ol className="grid grid-cols-1 gap-px bg-[var(--rule-hair)] sm:grid-cols-2 xl:grid-cols-3">
          {m.correlationNodes.map((n, i) => {
            const active = m.activeDriver === n.id;
            const tone = toneFor(n.change24h);
            return (
              <li key={n.id} className="relative bg-[var(--surface)] px-4 py-4">
                {/* Propagation trace: a brass rule runs the chain when this driver moves */}
                {active ? (
                  <span
                    className="absolute inset-x-0 top-0 h-0.5 origin-left"
                    style={{ background: 'var(--brass)', animation: 'advance 520ms var(--ease-rule) forwards' }}
                    aria-hidden="true"
                  />
                ) : null}
                <div className="flex items-baseline justify-between gap-2">
                  <span className="t-label text-[var(--ink-tertiary)]">{n.name}</span>
                  <span className="t-label-s text-[var(--stale)]">{i + 1}</span>
                </div>
                <p className="t-data-l mt-2 text-[var(--ink)]">
                  <Odometer value={n.value} />
                  <span className="t-label-s ml-1.5 text-[var(--ink-tertiary)]">{n.unit}</span>
                </p>
                <p
                  className="mt-1.5 inline-flex items-center gap-1.5 t-data-s"
                  style={{ color: tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}
                >
                  <Delta value={n.change24h} />
                  {pct(n.change24h, 2)}
                </p>
                <Rule className="my-3" />
                <dl className="flex items-baseline justify-between">
                  <dt className="t-label-s text-[var(--ink-tertiary)]">Beta to MCX</dt>
                  <dd className="t-data-s text-[var(--ink-secondary)]">{n.betaToMCX.toFixed(2)}</dd>
                </dl>
                <dl className="mt-1 flex items-baseline justify-between">
                  <dt className="t-label-s text-[var(--ink-tertiary)]">Delay</dt>
                  <dd className="t-data-s text-[var(--ink-secondary)]">{count(n.transmissionDelayMs)}ms</dd>
                </dl>
              </li>
            );
          })}
        </ol>
      </Panel>

      {/* ---- Execution bridge ---- */}
      <Panel className="mt-px border-0">
        <PanelHead
          label="Execution bridge"
          right={
            <div className="flex items-center gap-2">
              {[1, 2, 5, 10].map((x) => (
                <button
                  key={x}
                  onClick={() => setMult(x)}
                  className={`t-label-s h-7 w-9 border transition-colors duration-[var(--dur-hover)] ${
                    mult === x
                      ? 'border-[var(--brass)] text-[var(--brass)]'
                      : 'border-[var(--rule-hair)] text-[var(--ink-tertiary)] hover:border-[var(--ink-tertiary)]'
                  }`}
                >
                  {x}x
                </button>
              ))}
            </div>
          }
        >
          Statutory incidence is asymmetric. STT falls on the sell leg only; stamp duty on the buy leg only.
        </PanelHead>

        <div className="grid grid-cols-1 lg:grid-cols-12">
          <Leg title="Long leg" subtitle="Undervalued" symbol={longSym} onChange={setLongSym} lots={opp.longLots * mult} price={m.ticks[longSym].quotePrice} />

          <div className="lg:col-span-4 border-y border-[var(--rule-hair)] lg:border-x lg:border-y-0">
            <CostWaterfall
              gross={opp.grossConvergenceProfit * mult}
              net={opp.netAlphaInr * mult}
              steps={[
                { label: 'Securities transaction tax', value: opp.taxes * mult * 0.86, note: 'Sell leg only, 0.0125%' },
                { label: 'Stamp duty', value: opp.taxes * mult * 0.14, note: 'Buy leg only, 0.002%' },
                { label: 'MCX and SEBI turnover', value: opp.exchangeFees * mult * 0.82, note: '0.0021% and 0.0001%' },
                { label: 'GST on exchange charges', value: opp.exchangeFees * mult * 0.18, note: '18% of charges' },
                { label: 'Slippage', value: opp.slippage * mult, note: 'Bid-ask depth friction' },
              ]}
            />
          </div>

          <Leg title="Short leg" subtitle="Overvalued" symbol={shortSym} onChange={setShortSym} lots={opp.shortLots * mult} price={m.ticks[shortSym].quotePrice} />
        </div>

        <Rule />
        <div className="flex flex-wrap items-center justify-between gap-4 px-4 py-4">
          <dl className="flex flex-wrap gap-x-10 gap-y-3">
            <Stat k="Margin required" v={inr(opp.requiredMargin * mult, { decimals: 0 })} />
            <Stat k="Return on margin" v={pct(opp.netReturnPercent, 2)} />
            <Stat k="Risk / reward" v={opp.riskRewardRatio} />
          </dl>
          <Button
            variant="brass"
            icon="seal"
            disabled={!opp.isProfitableAfterCosts}
            onClick={() => m.executeSimulationTrade(longSym, shortSym, opp.longLots * mult)}
          >
            {opp.isProfitableAfterCosts ? 'Record simulated position' : 'Edge does not survive costs'}
          </Button>
        </div>
      </Panel>
    </div>
  );
}

function Leg({ title, subtitle, symbol, onChange, lots, price }: {
  title: string; subtitle: string; symbol: MCXContractSymbol;
  onChange: (s: MCXContractSymbol) => void; lots: number; price: number;
}) {
  const spec = CONTRACT_SPECS[symbol];
  return (
    <div className="lg:col-span-4 px-4 py-4">
      <div className="flex items-baseline justify-between">
        <h3 className="t-label text-[var(--ink)]">{title}</h3>
        <span className="t-label-s text-[var(--ink-tertiary)]">{subtitle}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-px bg-[var(--rule-hair)]">
        {(Object.keys(CONTRACT_SPECS) as MCXContractSymbol[]).map((s) => (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`t-label-s flex-1 whitespace-nowrap px-2 py-2 transition-colors duration-[var(--dur-hover)] ${
              s === symbol
                ? 'bg-[var(--brass-wash)] text-[var(--brass)]'
                : 'bg-[var(--surface)] text-[var(--ink-tertiary)] hover:text-[var(--ink)]'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <p className="t-data-xl mt-5 text-[var(--ink)]">
        <Odometer value={inr(price, { decimals: 2 })} />
      </p>
      <p className="t-label-s mt-2 text-[var(--ink-tertiary)]">
        {spec.tradingUnit} / purity {spec.purity} / {count(lots)} lots
      </p>
      <p className="t-label-s mt-1 text-[var(--stale)]">Slippage {spec.typicalSlippageBps.toFixed(1)} bps</p>
    </div>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="t-label-s text-[var(--ink-tertiary)]">{k}</dt>
      <dd className="t-data-m mt-1 text-[var(--ink)]">{v}</dd>
    </div>
  );
}
