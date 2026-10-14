import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMarketData } from '../hooks/useMarketData';
import { CONTRACT_SPECS, calculateSyntheticFairValue, calculateArbitrageOpportunity } from '../utils/pricingEngine';
import { MCXContractSymbol } from '../types/market';
import { Odometer } from '../ui/Odometer';
import { Button, Rule, Table, Th, Td, Tr, Badge } from '../ui/primitives';
import { CostWaterfall } from '../ui/CostWaterfall';
import { SealMark, Footer, SimulatedMarker } from '../ui/Shell';
import { Icon, Delta } from '../ui/Icon';
import { inr, bps, istTime, toneFor } from '../utils/format';

gsap.registerPlugin(ScrollTrigger);

const TERMS = [
  { k: 'comex', label: 'COMEX gold', detail: 'The global benchmark, quoted per troy ounce in dollars.' },
  { k: 'div', label: 'divided by 31.1034768', detail: 'Troy ounces to grams. The constant that makes the rest commensurable.' },
  { k: 'ten', label: 'times 10', detail: 'Scaled to the ten gram yardstick every MCX contract is compared on.' },
  { k: 'fx', label: 'times USD / INR', detail: 'Landed in rupees at the prevailing rate.' },
  { k: 'duty', label: 'times (1 + import duty)', detail: 'Six percent basic customs plus one percent agriculture infrastructure cess.' },
  { k: 'fee', label: 'plus clearing fee', detail: 'Port handling, assaying and vault charges per ten grams.' },
];

export function Landing() {
  const m = useMarketData();
  const scope = useRef<HTMLDivElement>(null);

  const sfv = calculateSyntheticFairValue(m.macro, 999);
  const opp = calculateArbitrageOpportunity('GOLDTEN', 'GOLDM', m.ticks.GOLDTEN.quotePrice, m.ticks.GOLDM.quotePrice);

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        gsap.set('[data-term]', { opacity: 1, y: 0 });
        return;
      }
      gsap.set('[data-term]', { opacity: 0.3, y: 10 });
      ScrollTrigger.create({
        trigger: '[data-formula]',
        start: 'top top',
        end: '+=160%',
        pin: true,
        scrub: 0.6,
        animation: gsap.timeline().to('[data-term]', {
          opacity: 1, y: 0, stagger: 0.6, ease: 'none',
        }),
      });
    }, scope);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={scope}>
      {/* ---------------- Hero: the certificate ---------------- */}
      <header className="border-b border-[var(--rule-strong)]">
        <div className="flex items-center justify-between px-4 py-4">
          <span className="flex items-center gap-2.5">
            <SealMark size={26} />
            <span className="t-label text-[var(--ink)]">Aurum Synthesis</span>
          </span>
          <nav className="flex items-center gap-5">
            <Link to="/methodology" className="t-label text-[var(--ink-tertiary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">Methodology</Link>
            <Link to="/access"><Button variant="ruled">Open terminal</Button></Link>
          </nav>
        </div>
      </header>

      <section className="grid grid-cols-1 lg:grid-cols-3">
        <div className="border-b border-[var(--rule-hair)] px-4 py-16 lg:col-span-2 lg:border-b-0 lg:border-r lg:py-28 lg:pl-10">
          <p className="t-label text-[var(--brass)]">MCX gold relative value</p>
          <h1 className="t-display-xl mt-6 max-w-[16ch] text-[var(--ink)]">
            Four contracts. One metal. One honest yardstick.
          </h1>
          <p className="t-body-l mt-7 max-w-[54ch] text-[var(--ink-secondary)]">
            MCX lists gold in four sizes at two purities. They do not move in lockstep. Aurum Synthesis
            normalizes all four onto ten grams at 999 purity, prices a fair value from import parity,
            and then does the part most tools skip: it subtracts the full statutory cost of trading
            and tells you whether anything is left.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-6">
            <Link to="/access"><Button variant="brass" icon="seal">Open the terminal</Button></Link>
            <Link to="/methodology" className="t-label inline-flex items-center gap-2 text-[var(--ink-secondary)] transition-colors duration-[var(--dur-hover)] hover:text-[var(--ink)]">
              Read the derivation
              <Icon name="caret-right" size={14} />
            </Link>
          </div>
        </div>

        {/* The instrument is the hero image. It runs. */}
        <div className="bg-[var(--surface)] px-4 py-10 lg:py-28">
          <div className="flex items-baseline justify-between">
            <span className="t-label text-[var(--ink-tertiary)]">Synthetic fair value</span>
            <SimulatedMarker />
          </div>
          <p className="t-data-xl mt-4 text-[var(--brass)]">
            <Odometer value={inr(sfv, { decimals: 2 })} />
          </p>
          <p className="t-label-s mt-2 text-[var(--ink-tertiary)]">Per 10 grams, 999 purity, {istTime()}</p>

          <Rule className="my-6" />

          <ul className="flex flex-col gap-3.5">
            {(Object.keys(CONTRACT_SPECS) as MCXContractSymbol[]).map((s) => {
              const t = m.ticks[s];
              const tone = toneFor(t.spreadToSFVBps);
              return (
                <li key={s} className="flex items-baseline justify-between gap-3">
                  <span className="t-label text-[var(--ink-secondary)]">{s}</span>
                  <span className="t-data-s text-[var(--ink-tertiary)]"><Odometer value={inr(t.normalizedPricePer10g, { decimals: 2 })} /></span>
                  <span className="inline-flex w-24 items-center justify-end gap-1.5 t-data-s"
                    style={{ color: tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}>
                    <Delta value={t.spreadToSFVBps} />
                    <Odometer value={bps(t.spreadToSFVBps)} />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------- Scroll-driven formula assembly ---------------- */}
      <section data-formula className="flex min-h-screen flex-col justify-center border-y border-[var(--rule-strong)] px-4 py-20">
        <p className="t-label text-[var(--brass)]">The derivation</p>
        <h2 className="t-display-l mt-4 max-w-[20ch] text-[var(--ink)]">
          Fair value is not a guess. It is landed cost.
        </h2>
        <ol className="mt-12 flex flex-col gap-7">
          {TERMS.map((t, i) => (
            <li key={t.k} data-term className="flex flex-col gap-2 border-l border-[var(--rule-hair)] pl-5 md:flex-row md:items-baseline md:gap-8">
              <span className="t-label-s w-8 flex-none text-[var(--stale)]">{String(i + 1).padStart(2, '0')}</span>
              <span className="t-data-l w-full max-w-[22ch] flex-none text-[var(--ink)]">{t.label}</span>
              <span className="t-body-m max-w-[48ch] text-[var(--ink-secondary)]">{t.detail}</span>
            </li>
          ))}
        </ol>
        <p className="t-data-l mt-12 border-t border-[var(--rule-strong)] pt-6 text-[var(--brass)]">
          = {inr(sfv, { decimals: 2 })} <span className="t-label ml-2 text-[var(--ink-tertiary)]">per 10g / 999</span>
        </p>
      </section>

      {/* ---------------- The four contracts, as a ledger ---------------- */}
      <section className="px-4 py-20">
        <p className="t-label text-[var(--brass)]">The instruments</p>
        <h2 className="t-display-l mt-4 max-w-[22ch] text-[var(--ink)]">
          The same metal, wrapped four different ways.
        </h2>
        <p className="t-body-l mt-6 max-w-[62ch] text-[var(--ink-secondary)]">
          Purity differs. Lot size differs. Liquidity differs by an order of magnitude, and with it the
          cost of getting in and out. Those differences are the whole opportunity.
        </p>

        <div className="mt-10">
          <Table caption="The four MCX gold contracts with their specification and live normalized price">
            <thead>
              <tr>
                <Th>Contract</Th><Th>Trading unit</Th><Th numeric>Purity</Th>
                <Th numeric>Slippage</Th><Th numeric>Margin</Th><Th numeric>Normalized 10g / 999</Th>
              </tr>
            </thead>
            <tbody>
              {(Object.keys(CONTRACT_SPECS) as MCXContractSymbol[]).map((s) => {
                const spec = CONTRACT_SPECS[s];
                return (
                  <Tr key={s}>
                    <Td className="text-[var(--ink)]">{spec.symbol}<span className="t-label-s ml-2 text-[var(--ink-tertiary)]">{spec.name}</span></Td>
                    <Td className="text-[var(--ink-tertiary)]">{spec.tradingUnit}</Td>
                    <Td numeric>{spec.purity}</Td>
                    <Td numeric>{spec.typicalSlippageBps.toFixed(1)}<span className="t-label-s ml-1 text-[var(--ink-tertiary)]">bps</span></Td>
                    <Td numeric>{(spec.marginPercent * 100).toFixed(1)}%</Td>
                    <Td numeric className="text-[var(--ink)]"><Odometer value={inr(m.ticks[s].normalizedPricePer10g, { decimals: 2 })} /></Td>
                  </Tr>
                );
              })}
            </tbody>
          </Table>
        </div>
      </section>

      {/* ---------------- The cost stack ---------------- */}
      <section className="border-t border-[var(--rule-strong)] px-4 py-20">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <p className="t-label text-[var(--brass)]">The honest part</p>
            <h2 className="t-display-l mt-4 max-w-[18ch] text-[var(--ink)]">
              A spread is not a profit.
            </h2>
            <p className="t-body-l mt-6 max-w-[54ch] text-[var(--ink-secondary)]">
              Securities transaction tax lands on the sell leg at 0.0125 percent. Stamp duty lands on
              the buy leg at 0.002 percent. MCX takes 0.0021, SEBI takes 0.0001, and GST takes
              eighteen percent of both. Then the book takes its slippage, which on GOLDPETAL is
              fourteen basis points before anything else happens.
            </p>
            <p className="t-body-l mt-5 max-w-[54ch] text-[var(--ink-secondary)]">
              Every figure in this terminal is shown after that stack, not before it.
            </p>
            <div className="mt-8">
              <Badge tone={opp.isProfitableAfterCosts ? 'verdigris' : 'oxblood'}>
                {opp.isProfitableAfterCosts ? 'Current pair clears costs' : 'Current pair does not clear costs'}
              </Badge>
            </div>
          </div>

          <div className="border border-[var(--rule-hair)]">
            <div className="border-b border-[var(--rule-hair)] px-4 py-3">
              <span className="t-label text-[var(--ink-tertiary)]">GOLDTEN against GOLDM, 200g notional</span>
            </div>
            <CostWaterfall
              gross={opp.grossConvergenceProfit}
              net={opp.netAlphaInr}
              steps={[
                { label: 'Securities transaction tax', value: opp.taxes * 0.86, note: 'Sell leg only' },
                { label: 'Stamp duty', value: opp.taxes * 0.14, note: 'Buy leg only' },
                { label: 'MCX and SEBI turnover', value: opp.exchangeFees * 0.82 },
                { label: 'GST on charges', value: opp.exchangeFees * 0.18 },
                { label: 'Slippage', value: opp.slippage },
              ]}
            />
          </div>
        </div>
      </section>

      {/* ---------------- Close ---------------- */}
      <section className="border-t border-[var(--rule-strong)] px-4 py-24 text-center">
        <SealMark size={44} />
        <h2 className="t-display-m mx-auto mt-6 max-w-[24ch] text-[var(--ink)]">
          Open the terminal and watch a spread get eaten in real time.
        </h2>
        <div className="mt-8 flex justify-center">
          <Link to="/access"><Button variant="brass" icon="seal">Open the terminal</Button></Link>
        </div>
        <p className="t-label-s mx-auto mt-8 max-w-[60ch] text-[var(--stale)]">
          All market data is generated for demonstration. No figure represents an actual exchange quote.
        </p>
      </section>

      <Footer />
    </div>
  );
}
