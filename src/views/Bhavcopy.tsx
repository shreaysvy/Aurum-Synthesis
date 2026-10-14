import { useMemo, useState } from 'react';
import { MOCK_BHAVCOPY_DATA } from '../data/mockMarketData';
import { MCXContractSymbol } from '../types/market';
import { Panel, PanelHead, Table, Th, Td, Tr, Select, Badge, Empty } from '../ui/primitives';
import { inr, bps, zscore, count } from '../utils/format';

export function Bhavcopy() {
  const [symbol, setSymbol] = useState<'ALL' | MCXContractSymbol>('ALL');
  const [date, setDate] = useState<'ALL' | string>('ALL');

  const dates = useMemo(
    () => Array.from(new Set(MOCK_BHAVCOPY_DATA.map((r) => r.tradeDate))),
    []
  );

  const rows = useMemo(
    () => MOCK_BHAVCOPY_DATA.filter(
      (r) => (symbol === 'ALL' || r.symbol === symbol) && (date === 'ALL' || r.tradeDate === date)
    ),
    [symbol, date]
  );

  return (
    <div className="wipe-in">
      <Panel className="border-0">
        <PanelHead
          label="Exchange bhavcopy"
          right={
            <div className="flex items-center gap-2">
              <Select value={date} onChange={(e) => setDate(e.target.value)} aria-label="Filter by trade date">
                <option value="ALL">All dates</option>
                {dates.map((d) => <option key={d} value={d}>{d}</option>)}
              </Select>
              <Select value={symbol} onChange={(e) => setSymbol(e.target.value as 'ALL' | MCXContractSymbol)} aria-label="Filter by contract">
                <option value="ALL">All contracts</option>
                <option value="GOLDM">GOLDM</option>
                <option value="GOLDTEN">GOLDTEN</option>
                <option value="GOLDGUINEA">GOLDGUINEA</option>
                <option value="GOLDPETAL">GOLDPETAL</option>
              </Select>
            </div>
          }
        >
          Daily settlement records, normalized to 10 grams at 999 purity for comparison across contracts.
        </PanelHead>

        {rows.length === 0 ? (
          <div className="p-4">
            <Empty line="No settlement records match the current filters." />
          </div>
        ) : (
          <Table dense caption="Daily bhavcopy settlement records for MCX gold contracts">
            <thead>
              <tr>
                <Th>Date</Th><Th>Symbol</Th><Th>Expiry</Th>
                <Th numeric>Open</Th><Th numeric>High</Th><Th numeric>Low</Th>
                <Th numeric>Close</Th><Th numeric>Settle</Th>
                <Th numeric>Volume</Th><Th numeric>OI</Th>
                <Th numeric>Norm. 10g</Th><Th numeric>vs GOLDM</Th><Th numeric>Z</Th>
                <Th>Exec</Th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <Tr key={`${r.tradeDate}-${r.symbol}-${i}`} height={32}>
                  <Td className="text-[var(--ink-tertiary)]">{r.tradeDate}</Td>
                  <Td className="text-[var(--ink)]">{r.symbol}</Td>
                  <Td className="text-[var(--ink-tertiary)]">{r.expiryDate}</Td>
                  <Td numeric>{inr(r.open, { decimals: 0 })}</Td>
                  <Td numeric>{inr(r.high, { decimals: 0 })}</Td>
                  <Td numeric>{inr(r.low, { decimals: 0 })}</Td>
                  <Td numeric className="text-[var(--ink)]">{inr(r.close, { decimals: 0 })}</Td>
                  <Td numeric>{inr(r.settlePrice, { decimals: 0 })}</Td>
                  <Td numeric>{count(r.volume)}</Td>
                  <Td numeric>{count(r.openInterest)}</Td>
                  <Td numeric>{inr(r.normalizedPrice10g, { decimals: 2 })}</Td>
                  <Td numeric>{bps(r.spreadVsGoldm10g)}</Td>
                  <Td numeric>{zscore(r.zScore)}</Td>
                  <Td>
                    <Badge tone={r.isExecutable ? 'verdigris' : 'stale'}>
                      {r.isExecutable ? 'Yes' : 'No'}
                    </Badge>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        )}

        <p className="t-label-s px-4 py-3 text-[var(--stale)]">
          {count(rows.length)} records shown. Generated sample, not an exchange file.
        </p>
      </Panel>
    </div>
  );
}
