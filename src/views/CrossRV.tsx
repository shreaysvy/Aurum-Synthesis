import { useMemo, useState } from 'react';
import { MarketData } from '../hooks/useMarketData';
import { MCXContractSymbol } from '../types/market';
import { Panel, PanelHead, Table, Th, Td, Tr, Badge } from '../ui/primitives';
import { Odometer } from '../ui/Odometer';
import { Delta } from '../ui/Icon';
import { CONTRACT_SPECS, normalizePriceTo10g999 } from '../utils/pricingEngine';
import { inr, bps, zscore, count, toneFor } from '../utils/format';

const SYMBOLS = Object.keys(CONTRACT_SPECS) as MCXContractSymbol[];
type SortKey = 'symbol' | 'quotePrice' | 'normalizedPricePer10g' | 'spreadToSFVBps' | 'zScore';

export function CrossRV({ m }: { m: MarketData }) {
  const [pair, setPair] = useState<[MCXContractSymbol, MCXContractSymbol] | null>(null);
  const [sort, setSort] = useState<{ key: SortKey; dir: 'ascending' | 'descending' }>({
    key: 'spreadToSFVBps', dir: 'descending',
  });

  const matrix = useMemo(() => {
    return SYMBOLS.map((a) =>
      SYMBOLS.map((b) => {
        if (a === b) return null;
        const na = normalizePriceTo10g999(a, m.ticks[a].quotePrice);
        const nb = normalizePriceTo10g999(b, m.ticks[b].quotePrice);
        const spread = na - nb;
        return { spreadBps: (spread / nb) * 10000, spreadInr: spread };
      })
    );
  }, [m.ticks]);

  const rows = useMemo(() => {
    const list = Object.values(m.ticks);
    const dir = sort.dir === 'ascending' ? 1 : -1;
    return [...list].sort((x, y) => {
      const a = sort.key === 'symbol' ? x.symbol : x[sort.key];
      const b = sort.key === 'symbol' ? y.symbol : y[sort.key];
      return a === b ? 0 : (a < b ? -1 : 1) * dir;
    });
  }, [m.ticks, sort]);

  const toggle = (key: SortKey) =>
    setSort((s) => ({ key, dir: s.key === key && s.dir === 'descending' ? 'ascending' : 'descending' }));
  const sortOf = (key: SortKey) => (sort.key === key ? sort.dir : 'none');

  const maxAbs = Math.max(...matrix.flat().map((c) => (c ? Math.abs(c.spreadBps) : 0)), 1);

  return (
    <div className="wipe-in">
      <Panel className="border-0">
        <PanelHead label="Normalized spread matrix">
          Every pair priced on the same yardstick: 10 grams at 999 purity. Row minus column, in basis points.
        </PanelHead>

        <div className="overflow-x-auto p-4">
          <table className="w-full border-collapse t-data-s">
            <caption className="sr-only">Pairwise normalized spread between each MCX gold contract</caption>
            <thead>
              <tr>
                <th className="t-label-s p-2 text-left text-[var(--ink-tertiary)]">Long \ Short</th>
                {SYMBOLS.map((s) => (
                  <th key={s} scope="col" className="t-label-s p-2 text-right text-[var(--ink-tertiary)]">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SYMBOLS.map((a, i) => (
                <tr key={a}>
                  <th scope="row" className="t-label-s whitespace-nowrap border-r border-[var(--rule-hair)] p-2 text-left text-[var(--ink-tertiary)]">{a}</th>
                  {SYMBOLS.map((b, j) => {
                    const cell = matrix[i][j];
                    if (!cell) {
                      return (
                        <td key={b} className="border border-[var(--rule-hair)] bg-[var(--surface-sunken)] p-0" aria-label="Not applicable">
                          <svg viewBox="0 0 10 10" preserveAspectRatio="none" className="h-10 w-full" aria-hidden="true">
                            <line x1="0" y1="10" x2="10" y2="0" stroke="var(--rule-hair)" strokeWidth="0.4" />
                          </svg>
                        </td>
                      );
                    }
                    const sel = pair?.[0] === a && pair?.[1] === b;
                    const tone = toneFor(cell.spreadBps);
                    return (
                      <td key={b} className="border border-[var(--rule-hair)] p-0">
                        <button
                          onClick={() => setPair([a, b])}
                          className="relative flex h-10 w-full items-center justify-end px-2 transition-colors duration-[var(--dur-hover)]"
                          style={{ background: sel ? 'var(--brass-wash)' : undefined }}
                          aria-pressed={sel}
                        >
                          <span
                            className="absolute inset-0"
                            style={{ background: 'var(--brass)', opacity: (Math.abs(cell.spreadBps) / maxAbs) * 0.22 }}
                            aria-hidden="true"
                          />
                          <span
                            className="relative inline-flex items-center gap-1"
                            style={{ color: tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}
                          >
                            <Delta value={cell.spreadBps} />
                            {bps(cell.spreadBps)}
                          </span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {pair ? (
          <div className="border-t border-[var(--rule-hair)] px-4 py-3">
            <span className="t-label text-[var(--ink-tertiary)]">Selected pair </span>
            <span className="t-data-m text-[var(--brass)]">{pair[0]} / {pair[1]}</span>
          </div>
        ) : null}
      </Panel>

      <Panel className="mt-px border-0">
        <PanelHead label="Cross-contract table" />
        <Table caption="All contracts with normalized prices, spread to synthetic fair value and z-score">
          <thead>
            <tr>
              <Th sort={sortOf('symbol')} onSort={() => toggle('symbol')}>Symbol</Th>
              <Th numeric sort={sortOf('quotePrice')} onSort={() => toggle('quotePrice')}>Quote</Th>
              <Th numeric sort={sortOf('normalizedPricePer10g')} onSort={() => toggle('normalizedPricePer10g')}>Norm. 10g / 999</Th>
              <Th numeric>SFV</Th>
              <Th numeric sort={sortOf('spreadToSFVBps')} onSort={() => toggle('spreadToSFVBps')}>Spread</Th>
              <Th numeric sort={sortOf('zScore')} onSort={() => toggle('zScore')}>Z</Th>
              <Th numeric>Depth</Th>
              <Th>Tier</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t) => {
              const tone = toneFor(t.spreadToSFVBps);
              return (
                <Tr key={t.symbol}>
                  <Td className="text-[var(--ink)]">{t.symbol}</Td>
                  <Td numeric><Odometer value={inr(t.quotePrice, { decimals: 2 })} /></Td>
                  <Td numeric><Odometer value={inr(t.normalizedPricePer10g, { decimals: 2 })} /></Td>
                  <Td numeric className="text-[var(--ink-tertiary)]">{inr(t.syntheticFairValue, { decimals: 2 })}</Td>
                  <Td numeric>
                    <span
                      className="inline-flex items-center justify-end gap-1.5"
                      style={{ color: tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}
                    >
                      <Delta value={t.spreadToSFVBps} />
                      <Odometer value={bps(t.spreadToSFVBps)} />
                    </span>
                  </Td>
                  <Td numeric>{zscore(t.zScore)}</Td>
                  <Td numeric className="text-[var(--ink-tertiary)]">{t.depthRatio.toFixed(2)}</Td>
                  <Td><span className="t-label-s text-[var(--ink-tertiary)]">{t.liquidityTier}</span></Td>
                  <Td>
                    <Badge tone={t.status === 'UNDERPRICED' ? 'verdigris' : t.status === 'OVERPRICED' ? 'oxblood' : 'neutral'}>
                      {t.status}
                    </Badge>
                  </Td>
                </Tr>
              );
            })}
          </tbody>
        </Table>
        <p className="t-label-s px-4 py-3 text-[var(--stale)]">
          Open interest {count(Object.values(m.ticks).reduce((a, t) => a + t.openInterest, 0))} lots across all series.
        </p>
      </Panel>
    </div>
  );
}
