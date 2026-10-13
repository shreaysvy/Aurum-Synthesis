import React from 'react';
import { X, ShieldCheck, CheckCircle2, TrendingUp, Clock, FileSpreadsheet } from 'lucide-react';
import { ExecutionOrder } from '../types/market';

interface StrategyBlotterModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: ExecutionOrder[];
}

export const StrategyBlotterModal: React.FC<StrategyBlotterModalProps> = ({
  isOpen,
  onClose,
  orders,
}) => {
  if (!isOpen) return null;

  const totalNetAlpha = orders.reduce((sum, o) => sum + o.netAlphaInr, 0);
  const totalCapital = orders.reduce((sum, o) => sum + o.capitalDeployed, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl overflow-hidden rounded-xl border border-[#262626] bg-[#0A0A0A] shadow-2xl">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded border border-[#FFD700]/30 bg-[#FFD700]/10">
              <ShieldCheck className="h-4 w-4 text-[#FFD700]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#F8F9FA]">
                Simulated Execution Blotter
              </h3>
              <p className="text-xs text-[#71717A]">
                Institutional order book & trade ledger with real statutory deductions
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded p-1 text-[#71717A] hover:bg-[#1C1C1C] hover:text-[#F8F9FA] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Portfolio Summary Strip */}
        <div className="grid grid-cols-3 border-b border-[#181818] bg-[#0D0D0D] px-6 py-3 text-xs">
          <div>
            <span className="text-[10px] text-[#71717A] uppercase">Active Orders</span>
            <div className="font-mono text-base font-bold text-[#F8F9FA] tabular-nums">
              {orders.length} Trades
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] uppercase">Total Margin Deployed</span>
            <div className="font-mono text-base font-bold text-[#F8F9FA] tabular-nums">
              ₹{(totalCapital / 100000).toFixed(2)} Lakhs
            </div>
          </div>
          <div>
            <span className="text-[10px] text-[#71717A] uppercase">Aggregate Net Alpha</span>
            <div className="font-mono text-base font-extrabold text-[#FFD700] gold-text-glow tabular-nums">
              +₹{totalNetAlpha.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Blotter Table */}
        <div className="max-h-[380px] overflow-y-auto px-6 py-4">
          {orders.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#71717A]">
              No active simulated trades in blotter. Use the Execution Bridge to lock in alpha.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#1A1A1A] text-[10px] uppercase tracking-wider text-[#71717A]">
                  <th className="py-2.5 font-semibold">Order ID</th>
                  <th className="py-2.5 font-semibold">Time</th>
                  <th className="py-2.5 font-semibold">Long Leg</th>
                  <th className="py-2.5 font-semibold">Short Leg</th>
                  <th className="py-2.5 font-semibold text-right">Margin</th>
                  <th className="py-2.5 font-semibold text-right">Friction (Fees+STT)</th>
                  <th className="py-2.5 font-semibold text-right">Net Alpha</th>
                  <th className="py-2.5 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]">
                {orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#111] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#F8F9FA]">
                      {ord.id}
                    </td>
                    <td className="py-3 text-[#A1A1AA] text-[11px]">
                      {ord.timestamp}
                    </td>
                    <td className="py-3">
                      <span className="text-[#10B981] font-semibold">
                        +{ord.longLeg.lots} {ord.longLeg.symbol}
                      </span>
                      <span className="block text-[10px] text-[#71717A]">
                        @ ₹{ord.longLeg.entryPrice.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className="text-[#EF4444] font-semibold">
                        -{ord.shortLeg.lots} {ord.shortLeg.symbol}
                      </span>
                      <span className="block text-[10px] text-[#71717A]">
                        @ ₹{ord.shortLeg.entryPrice.toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#A1A1AA]">
                      ₹{(ord.capitalDeployed / 100000).toFixed(2)}L
                    </td>
                    <td className="py-3 text-right font-mono tabular-nums text-[#EF4444]">
                      -₹{(ord.exchangeFeesInr + ord.sttInr + ord.slippageInr).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-right font-mono font-bold tabular-nums text-[#FFD700]">
                      +₹{ord.netAlphaInr.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 text-center">
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          ord.status === 'CONVERGED'
                            ? 'bg-[#10B981]/15 text-[#10B981]'
                            : 'bg-[#FFD700]/15 text-[#FFD700]'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-[#1A1A1A] px-6 py-3 bg-[#0D0D0D] text-xs">
          <button
            onClick={() => {
              const headers = [
                'OrderID',
                'Timestamp',
                'Strategy',
                'LongLeg',
                'LongLots',
                'LongPrice',
                'ShortLeg',
                'ShortLots',
                'ShortPrice',
                'MarginDeployed',
                'GrossAlpha',
                'ExchangeFee',
                'STT',
                'NetAlpha',
                'RiskReward',
                'Status',
              ];
              const rows = orders.map((o) => [
                o.id,
                o.timestamp,
                o.strategy,
                o.longLeg.symbol,
                o.longLeg.lots,
                o.longLeg.entryPrice,
                o.shortLeg.symbol,
                o.shortLeg.lots,
                o.shortLeg.entryPrice,
                o.capitalDeployed,
                o.grossAlphaInr,
                o.exchangeFeesInr,
                o.sttInr,
                o.netAlphaInr,
                o.riskRewardRatio,
                o.status,
              ]);
              const csvContent =
                'data:text/csv;charset=utf-8,' +
                [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
              const encodedUri = encodeURI(csvContent);
              const link = document.createElement('a');
              link.setAttribute('href', encodedUri);
              link.setAttribute('download', `aurum_blotter_${Date.now()}.csv`);
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="flex items-center gap-1.5 rounded border border-[#27272A] bg-[#141414] px-3 py-1.5 text-xs font-semibold text-[#A1A1AA] hover:text-[#F8F9FA] hover:border-[#FFD700] transition-colors"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-[#FFD700]" />
            <span>Export Blotter CSV</span>
          </button>

          <button
            onClick={onClose}
            className="rounded border border-[#27272A] bg-[#161616] px-4 py-1.5 text-xs font-semibold text-[#F8F9FA] hover:bg-[#222] transition-colors"
          >
            Close Blotter
          </button>
        </div>
      </div>
    </div>
  );
};
