import { useState } from 'react';
import { MOCK_TERM_STRUCTURE } from '../data/mockMarketData';
import { Panel, PanelHead, Table, Th, Td, Tr, Badge } from '../ui/primitives';
import { scaleTo, path, DrawnPath, Axes, GridLines } from '../ui/Plot';
import { inr, bps, count } from '../utils/format';

const W = 1000, H = 360, PAD = 40;

export function TermStructure() {
  const [hover, setHover] = useState<number | null>(null);
  const pts = MOCK_TERM_STRUCTURE;

  const market = pts.map((p) => ({ x: p.daysToExpiry, y: p.marketPrice }));
  const theo = pts.map((p) => ({ x: p.daysToExpiry, y: p.mechanicalRollDownValue }));
  const { sx, sy } = scaleTo([...market, ...theo], W, H, PAD);

  const band = `${path(market, sx, sy)} L${sx(theo[theo.length - 1].x)} ${sy(theo[theo.length - 1].y)} ${theo
    .slice().reverse().map((p) => `L${sx(p.x).toFixed(2)} ${sy(p.y).toFixed(2)}`).join(' ')} Z`;

  const active = hover !== null ? pts[hover] : null;

  return (
    <div className="wipe-in">
      <Panel className="border-0">
        <PanelHead
          label="Term structure and carry roll"
          right={<Badge tone={pts[0].curveState === 'CONTANGO' ? 'brass' : 'verdigris'}>{pts[0].curveState}</Badge>}
        >
          Market price against the carry-adjusted theoretical. The shaded band is mechanical roll-down,
          which is not mispricing.
        </PanelHead>

        <div className="relative p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img"
            aria-label={`Term structure across ${pts.length} tenors from ${pts[0].tenor} to ${pts[pts.length - 1].tenor}`}>
            <GridLines w={W} h={H} pad={PAD} />
            <Axes w={W} h={H} pad={PAD} />
            <path d={band} fill="var(--brass)" opacity="0.12" />
            <DrawnPath d={path(theo, sx, sy)} stroke="var(--ink-tertiary)" width={1} dashed />
            <DrawnPath d={path(market, sx, sy)} stroke="var(--brass)" width={2} />
            {pts.map((p, i) => (
              <circle key={p.tenor} cx={sx(p.daysToExpiry)} cy={sy(p.marketPrice)} r={hover === i ? 5 : 3}
                fill="var(--surface)" stroke="var(--brass)" strokeWidth="1.5" />
            ))}
            {active ? (
              <line x1={sx(active.daysToExpiry)} y1={PAD} x2={sx(active.daysToExpiry)} y2={H - PAD}
                stroke="var(--ink)" strokeWidth="1" />
            ) : null}
          </svg>

          {active ? (
            <div className="absolute right-6 top-6 border border-[var(--rule-strong)] bg-[var(--surface)] px-3 py-2">
              <p className="t-label text-[var(--ink-tertiary)]">{active.tenor}</p>
              <p className="t-data-m mt-1 text-[var(--ink)]">{inr(active.marketPrice, { decimals: 0 })}</p>
              <p className="t-data-s mt-0.5 text-[var(--ink-tertiary)]">{count(active.daysToExpiry)} days to expiry</p>
            </div>
          ) : null}

          <div className="mt-2 flex flex-wrap gap-5">
            <Legend color="var(--brass)" label="Market price" />
            <Legend color="var(--ink-tertiary)" label="Carry-adjusted theoretical" dashed />
            <Legend color="var(--brass)" label="Mechanical roll-down" wash />
          </div>
        </div>
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Tenor ledger" />
        <Table caption="Each listed tenor with carry cost, roll-down and genuine mispricing">
          <thead>
            <tr>
              <Th>Tenor</Th><Th>Expiry</Th><Th numeric>Days</Th><Th numeric>Market</Th>
              <Th numeric>Ann. carry</Th><Th numeric>Roll-down</Th><Th numeric>Genuine mispricing</Th>
              <Th>Curve</Th><Th numeric>Vol / OI</Th>
            </tr>
          </thead>
          <tbody>
            {pts.map((p, i) => (
              <Tr key={p.tenor} onClick={() => setHover(hover === i ? null : i)} selected={hover === i}>
                <Td className="text-[var(--ink)]">{p.tenor}</Td>
                <Td className="text-[var(--ink-tertiary)]">{p.expiryDate}</Td>
                <Td numeric>{count(p.daysToExpiry)}</Td>
                <Td numeric>{inr(p.marketPrice, { decimals: 0 })}</Td>
                <Td numeric>{inr(p.annualizedCarryCost, { decimals: 0 })}</Td>
                <Td numeric className="text-[var(--ink-tertiary)]">{inr(p.mechanicalRollDownValue, { decimals: 0 })}</Td>
                <Td numeric className="text-[var(--brass)]">{bps(p.genuineMispricingBps)}<span className="t-label-s ml-1 text-[var(--ink-tertiary)]">bps</span></Td>
                <Td><span className="t-label-s text-[var(--ink-tertiary)]">{p.curveState}</span></Td>
                <Td numeric>{p.volumeOIratio.toFixed(2)}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}

function Legend({ color, label, dashed = false, wash = false }:
  { color: string; label: string; dashed?: boolean; wash?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <span className="inline-block h-2.5 w-6" style={
        wash ? { background: color, opacity: 0.12 }
          : dashed ? { borderTop: `1px dashed ${color}`, height: 0 }
          : { borderTop: `2px solid ${color}`, height: 0 }
      } />
      <span className="t-label-s text-[var(--ink-tertiary)]">{label}</span>
    </span>
  );
}
