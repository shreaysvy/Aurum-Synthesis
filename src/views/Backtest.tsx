import { MOCK_BACKTEST_DATA } from '../data/mockMarketData';
import { Panel, PanelHead, Badge, Rule } from '../ui/primitives';
import { scaleTo, path, DrawnPath, Axes, GridLines } from '../ui/Plot';
import { inr, inrShort, pct, count } from '../utils/format';

const W = 1000, H = 380, PAD = 44;

export function Backtest() {
  const d = MOCK_BACKTEST_DATA;
  const gross = d.equityCurve.map((p) => ({ x: p.day, y: p.grossEquity }));
  const net = d.equityCurve.map((p) => ({ x: p.day, y: p.netEquity }));
  const bench = d.equityCurve.map((p) => ({ x: p.day, y: p.underlyingGoldBench }));
  const { sx, sy } = scaleTo([...gross, ...net, ...bench], W, H, PAD);

  const friction = `${path(gross, sx, sy)} ${net.slice().reverse()
    .map((p) => `L${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')} Z`;

  const totalFriction = d.grossPnLInr - d.netPnLInr;

  return (
    <div className="wipe-in">
      {/* The honesty treatment is not optional on this screen. */}
      <div className="flex flex-wrap items-center gap-3 border border-[var(--rule-strong)] bg-[var(--surface-sunken)] px-4 py-3">
        <Badge tone="stale">Illustrative sample</Badge>
        <p className="t-label text-[var(--ink-secondary)]">
          Not a computed result. These figures are a fixed sample, not the output of running the strategy over data.
        </p>
      </div>

      <Panel className="mt-px border-0">
        <PanelHead label="Equity curve">
          The gap between gross and net is the entire argument. It is the cost stack, drawn to scale.
        </PanelHead>

        <div className="p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
            aria-label={`Equity curve over ${d.periodDays} days comparing gross equity, net equity after costs, and the underlying gold benchmark`}>
            <GridLines w={W} h={H} pad={PAD} />
            <Axes w={W} h={H} pad={PAD} />
            <path d={friction} fill="var(--brass)" opacity="0.12" />
            <DrawnPath d={path(bench, sx, sy)} stroke="var(--ink-tertiary)" width={1} dashed />
            <DrawnPath d={path(gross, sx, sy)} stroke="var(--ink-tertiary)" width={1} delay={60} />
            <DrawnPath d={path(net, sx, sy)} stroke="var(--brass)" width={2.25} delay={120} />
          </svg>

          <div className="mt-2 flex flex-wrap gap-5">
            <Legend color="var(--brass)" label="Net equity, after all costs" weight={2.25} />
            <Legend color="var(--ink-tertiary)" label="Gross equity" weight={1} />
            <Legend color="var(--ink-tertiary)" label="Underlying gold benchmark" dashed />
            <Legend color="var(--brass)" label={`Total friction, ${inrShort(totalFriction)}`} wash />
          </div>
        </div>
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Results ledger" right={
          <Badge tone={d.edgeSurvivesCosts ? 'verdigris' : 'oxblood'}>
            {d.edgeSurvivesCosts ? 'Edge survives costs' : 'Edge does not survive'}
          </Badge>
        } />
        <dl className="grid grid-cols-2 gap-px bg-[var(--rule-hair)] md:grid-cols-3 xl:grid-cols-4">
          <Cell k="Period" v={`${count(d.periodDays)} days`} />
          <Cell k="Total trades" v={count(d.totalTrades)} />
          <Cell k="Win rate" v={pct(d.winRatePercent, 1, false)} />
          <Cell k="Profit factor" v={d.profitFactor.toFixed(2)} />
          <Cell k="Gross P&L" v={inr(d.grossPnLInr, { decimals: 0, signed: true })} />
          <Cell k="Net P&L" v={inr(d.netPnLInr, { decimals: 0, signed: true })} emphasis />
          <Cell k="Statutory taxes" v={inr(-d.statutoryTaxesInr, { decimals: 0, signed: true })} tone="oxblood" />
          <Cell k="Exchange friction" v={inr(-d.exchangeFrictionInr, { decimals: 0, signed: true })} tone="oxblood" />
          <Cell k="Sharpe, gross" v={d.sharpeRatioGross.toFixed(2)} />
          <Cell k="Sharpe, net" v={d.sharpeRatioNet.toFixed(2)} emphasis />
          <Cell k="Max drawdown" v={pct(d.maxDrawdownPercent, 2)} tone="oxblood" />
          <Cell k="Alpha attribution" v={pct(d.alphaAttributionPercent, 1, false)} />
        </dl>

        <Rule />
        <div className="px-4 py-4">
          <p className="t-label text-[var(--ink-tertiary)]">Attribution</p>
          <div className="mt-3 flex h-6 w-full border border-[var(--rule-strong)]">
            <span className="flex items-center justify-center" style={{ width: `${d.alphaAttributionPercent}%`, background: 'var(--brass)' }}>
              <span className="t-label-s text-[var(--ground)]">Alpha {pct(d.alphaAttributionPercent, 1, false)}</span>
            </span>
            <span className="flex items-center justify-center bg-[var(--surface-sunken)]" style={{ width: `${d.betaAttributionPercent}%` }}>
              <span className="t-label-s text-[var(--ink-tertiary)]">Beta</span>
            </span>
          </div>
          <p className="t-label-s mt-2 text-[var(--stale)]">
            Residual directional exposure {pct(d.betaAttributionPercent, 1, false)}. A delta-neutral book should sit near zero.
          </p>
        </div>
      </Panel>
    </div>
  );
}

function Cell({ k, v, emphasis = false, tone }:
  { k: string; v: string; emphasis?: boolean; tone?: 'oxblood' }) {
  return (
    <div className="bg-[var(--surface)] px-4 py-3.5">
      <dt className="t-label-s text-[var(--ink-tertiary)]">{k}</dt>
      <dd className={`${emphasis ? 't-data-l' : 't-data-m'} mt-1.5`}
        style={{ color: tone === 'oxblood' ? 'var(--oxblood)' : emphasis ? 'var(--brass)' : 'var(--ink)' }}>
        {v}
      </dd>
    </div>
  );
}

function Legend({ color, label, dashed = false, wash = false, weight = 2 }:
  { color: string; label: string; dashed?: boolean; wash?: boolean; weight?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-2.5 w-6" style={
        wash ? { background: color, opacity: 0.12 }
          : dashed ? { borderTop: `1px dashed ${color}`, height: 0 }
          : { borderTop: `${weight}px solid ${color}`, height: 0 }
      } />
      <span className="t-label-s text-[var(--ink-tertiary)]">{label}</span>
    </span>
  );
}
