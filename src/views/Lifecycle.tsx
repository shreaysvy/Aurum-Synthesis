import { MOCK_LIFECYCLE_DATA, MOCK_PLANNED_POSITIONS } from '../data/mockMarketData';
import { Panel, PanelHead, Table, Th, Td, Tr, Badge } from '../ui/primitives';
import { count, pct } from '../utils/format';

function dmy(s: string) {
  const [d, m, y] = s.split('/').map(Number);
  return new Date(y, m - 1, d);
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function Lifecycle() {
  const today = new Date(2026, 9, 14);
  const start = new Date(2026, 0, 1);
  const end = new Date(2026, 11, 31);
  const span = end.getTime() - start.getTime();
  const posOf = (d: Date) => ((d.getTime() - start.getTime()) / span) * 100;

  return (
    <div className="wipe-in">
      <Panel className="border-0">
        <PanelHead label="Contract lifecycle">
          Tender windows carry physical delivery obligation. The cross-hatched span is the zone to exit before.
        </PanelHead>

        <div className="overflow-x-auto px-4 pb-6 pt-4">
          <div className="min-w-[760px]">
            {/* Month axis */}
            <div className="relative flex border-b border-[var(--rule-strong)] pb-1.5">
              {MONTHS.map((mo) => (
                <span key={mo} className="t-label-s flex-1 text-[var(--ink-tertiary)]">{mo}</span>
              ))}
            </div>

            <div className="relative">
              {/* Today rule */}
              <div className="absolute inset-y-0 z-10 w-px" style={{ left: `${posOf(today)}%`, background: 'var(--rule-strong)' }}>
                <span className="t-label-s absolute -top-0 left-1.5 whitespace-nowrap text-[var(--ink)]">
                  14 Oct
                </span>
              </div>

              {MOCK_LIFECYCLE_DATA.map((c) => {
                const tender = dmy(c.tenderStartDate);
                const expiry = dmy(c.expiryDate);
                const listing = new Date(c.listingDate);
                const barStart = Math.max(0, posOf(listing));
                const barEnd = posOf(expiry);
                const tenderStart = posOf(tender);

                return (
                  <div key={c.contractSeries} className="relative border-b border-[var(--rule-hair)] py-4">
                    <div className="mb-2 flex items-baseline justify-between gap-4">
                      <span className="t-label text-[var(--ink)]">{c.symbol}</span>
                      <span className="t-label-s text-[var(--ink-tertiary)]">{c.contractSeries}</span>
                    </div>

                    <div className="relative h-6">
                      {/* Active span */}
                      <span
                        className="absolute inset-y-0"
                        style={{ left: `${barStart}%`, width: `${Math.max(0, barEnd - barStart)}%`, background: 'var(--surface-sunken)', border: '1px solid var(--rule-hair)' }}
                      />
                      {/* Tender window, the one permitted pattern fill */}
                      <span
                        className="hatch-brass absolute inset-y-0"
                        style={{ left: `${tenderStart}%`, width: `${Math.max(0.6, barEnd - tenderStart)}%` }}
                        title={`Tender window from ${c.tenderStartDate} to ${c.expiryDate}`}
                      />
                      {/* Expiry mark */}
                      <span className="absolute inset-y-0 w-0.5" style={{ left: `${barEnd}%`, background: 'var(--oxblood)' }} />
                    </div>

                    <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-1">
                      <span className="t-label-s text-[var(--ink-tertiary)]">Phase {c.liquidityPhase.replace(/_/g, ' ')}</span>
                      <span className="t-label-s text-[var(--ink-tertiary)]">{count(c.currentDaysToExpiry)} days to expiry</span>
                      <span className="t-label-s text-[var(--ink-tertiary)]">Tender margin {pct(c.tenderMarginPercent, 1, false)}</span>
                      <span className="t-label-s text-[var(--ink-tertiary)]">Depth {count(c.marketDepthScore)} / 100</span>
                    </div>
                    <p className="t-body-m mt-2 max-w-prose text-[var(--ink-secondary)]">{c.recommendedAction}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-5">
              <span className="inline-flex items-center gap-2">
                <span className="hatch-brass inline-block h-3 w-6" />
                <span className="t-label-s text-[var(--ink-tertiary)]">Tender window, delivery risk</span>
              </span>
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-3 w-0.5" style={{ background: 'var(--oxblood)' }} />
                <span className="t-label-s text-[var(--ink-tertiary)]">Expiry</span>
              </span>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Planned positions" />
        <Table caption="Planned positions with tender and liquidity risk assessment">
          <thead>
            <tr>
              <Th>Plan</Th><Th>Contract</Th><Th>Expiry</Th><Th>Entry</Th><Th>Target exit</Th>
              <Th numeric>Lots</Th><Th>Tender risk</Th><Th>Liquidity</Th><Th>Note</Th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PLANNED_POSITIONS.map((p) => (
              <Tr key={p.id}>
                <Td className="text-[var(--ink-tertiary)]">{p.id}</Td>
                <Td className="text-[var(--ink)]">{p.contractSymbol}</Td>
                <Td className="text-[var(--ink-tertiary)]">{p.contractExpiry}</Td>
                <Td className="text-[var(--ink-tertiary)]">{p.entryDate}</Td>
                <Td className="text-[var(--ink-tertiary)]">{p.targetExitDate}</Td>
                <Td numeric>{count(p.lots)}</Td>
                <Td>
                  <Badge tone={p.tenderRiskScore === 'SAFE' ? 'verdigris' : p.tenderRiskScore === 'CRITICAL_TENDER_ZONE' ? 'oxblood' : 'brass'}>
                    {p.tenderRiskScore.replace(/_/g, ' ')}
                  </Badge>
                </Td>
                <Td>
                  <Badge tone={p.liquidityRisk === 'OPTIMAL' ? 'verdigris' : p.liquidityRisk === 'ILLIQUID_RISK' ? 'oxblood' : 'brass'}>
                    {p.liquidityRisk.replace(/_/g, ' ')}
                  </Badge>
                </Td>
                <Td className="max-w-[28rem] whitespace-normal t-data-s text-[var(--ink-tertiary)]">{p.notes}</Td>
              </Tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </div>
  );
}
