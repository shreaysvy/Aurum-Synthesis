/**
 * The live contract ledger. Four rows, every figure on the odometer.
 */
import { ContractPriceTick, MCXContractSymbol } from '../types/market';
import { CONTRACT_SPECS } from '../utils/pricingEngine';
import { Odometer } from './Odometer';
import { Icon, Delta } from './Icon';
import { Table, Th, Td, Tr } from './primitives';
import { inr, bps, toneFor } from '../utils/format';

const ICON: Record<MCXContractSymbol, 'goldm' | 'goldten' | 'goldguinea' | 'goldpetal'> = {
  GOLDM: 'goldm', GOLDTEN: 'goldten', GOLDGUINEA: 'goldguinea', GOLDPETAL: 'goldpetal',
};

export function ContractLedger({
  ticks, onSelect, selected,
}: {
  ticks: Record<MCXContractSymbol, ContractPriceTick>;
  onSelect?: (s: MCXContractSymbol) => void;
  selected?: MCXContractSymbol;
}) {
  const rows = Object.values(ticks);
  return (
    <Table caption="Live normalized prices for each MCX gold contract">
      <thead>
        <tr>
          <Th>Contract</Th>
          <Th numeric className="hidden xl:table-cell">Quote</Th>
          <Th numeric>Norm. 10g / 999</Th>
          <Th numeric>To SFV</Th>
          <Th>Tier</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((t) => {
          const spec = CONTRACT_SPECS[t.symbol];
          const tone = toneFor(t.spreadToSFVBps);
          return (
            <Tr key={t.symbol} onClick={onSelect ? () => onSelect(t.symbol) : undefined} selected={selected === t.symbol}>
              <Td>
                <span className="flex items-center gap-2.5">
                  <Icon name={ICON[t.symbol]} size={18} className="flex-none text-[var(--brass)]" />
                  <span className="flex flex-col">
                    <span className="text-[var(--ink)]">{t.symbol}</span>
                    <span className="t-label-s text-[var(--ink-tertiary)]">{spec.tradingUnit} / {spec.purity}</span>
                  </span>
                </span>
              </Td>
              <Td numeric className="hidden xl:table-cell"><Odometer value={inr(t.quotePrice, { decimals: 2 })} /></Td>
              <Td numeric className="text-[var(--ink)]"><Odometer value={inr(t.normalizedPricePer10g, { decimals: 2 })} /></Td>
              <Td numeric>
                <span
                  className="inline-flex items-center justify-end gap-1.5"
                  style={{ color: tone === 'verdigris' ? 'var(--verdigris)' : tone === 'oxblood' ? 'var(--oxblood)' : 'var(--ink-tertiary)' }}
                >
                  <Delta value={t.spreadToSFVBps} />
                  <Odometer value={bps(t.spreadToSFVBps)} />
                  <span className="t-label-s text-[var(--ink-tertiary)]">bps</span>
                </span>
              </Td>
              <Td><span className="t-label-s text-[var(--ink-tertiary)]">{t.liquidityTier.replace(/ \(.*\)/, '')}</span></Td>
            </Tr>
          );
        })}
      </tbody>
    </Table>
  );
}
