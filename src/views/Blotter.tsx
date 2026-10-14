import { MarketData } from '../hooks/useMarketData';
import { Panel, PanelHead, Table, Th, Td, Tr, Badge, Empty } from '../ui/primitives';
import { inr, pct, count } from '../utils/format';

export function Blotter({ m }: { m: MarketData }) {
  const orders = m.blotterOrders;

  return (
    <div className="wipe-in">
      <Panel className="border-0">
        <PanelHead label="Position blotter" right={<Badge tone="stale">Simulated</Badge>}>
          Every fee line is itemized. A collapsed cost figure hides where the edge goes.
        </PanelHead>

        {orders.length === 0 ? (
          <div className="p-4">
            <Empty line="No positions recorded yet. Record one from the execution bridge on the Command view." />
          </div>
        ) : (
          <Table caption="Recorded simulation positions with full cost itemization">
            <thead>
              <tr>
                <Th>Order</Th><Th>Time</Th><Th>Strategy</Th>
                <Th>Long leg</Th><Th>Short leg</Th>
                <Th numeric>Capital</Th><Th numeric>Gross</Th>
                <Th numeric>STT</Th><Th numeric>Stamp</Th><Th numeric>Exchange</Th><Th numeric>Slippage</Th>
                <Th numeric>Net</Th><Th numeric>Return</Th><Th>R / R</Th><Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <Tr key={o.id}>
                  <Td className={i === 0 ? 'stamp-in text-[var(--brass)]' : 'text-[var(--ink-tertiary)]'}>{o.id}</Td>
                  <Td className="text-[var(--ink-tertiary)]">{o.timestamp}</Td>
                  <Td><span className="t-label-s text-[var(--ink-tertiary)]">{o.strategy.replace(/_/g, ' ')}</span></Td>
                  <Td className="text-[var(--ink)]">{o.longLeg.symbol} <span className="text-[var(--ink-tertiary)]">{count(o.longLeg.lots)}</span></Td>
                  <Td className="text-[var(--ink)]">{o.shortLeg.symbol} <span className="text-[var(--ink-tertiary)]">{count(o.shortLeg.lots)}</span></Td>
                  <Td numeric>{inr(o.capitalDeployed, { decimals: 0 })}</Td>
                  <Td numeric>{inr(o.grossAlphaInr, { decimals: 0, signed: true })}</Td>
                  <Td numeric className="text-[var(--oxblood)]">{inr(-o.sttInr, { decimals: 0, signed: true })}</Td>
                  <Td numeric className="text-[var(--oxblood)]">{inr(-o.stampDutyInr, { decimals: 0, signed: true })}</Td>
                  <Td numeric className="text-[var(--oxblood)]">{inr(-o.exchangeFeesInr, { decimals: 0, signed: true })}</Td>
                  <Td numeric className="text-[var(--oxblood)]">{inr(-o.slippageInr, { decimals: 0, signed: true })}</Td>
                  <Td numeric className="text-[var(--brass)]">{inr(o.netAlphaInr, { decimals: 0, signed: true })}</Td>
                  <Td numeric>{pct(o.netReturnBps / 100, 2)}</Td>
                  <Td className="text-[var(--ink-tertiary)]">{o.riskRewardRatio}</Td>
                  <Td>
                    <Badge tone={o.status === 'CONVERGED' ? 'verdigris' : o.status === 'STOPPED' ? 'oxblood' : 'brass'}>
                      {o.status}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}
      </Panel>
    </div>
  );
}
