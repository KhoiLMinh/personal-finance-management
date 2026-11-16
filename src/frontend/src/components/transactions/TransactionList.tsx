import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { History, Pencil, Trash2 } from 'lucide-react';
import type { Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/format';
import TransactionHistoryModal from './TransactionHistoryModal';

interface Props {
  transactions: Transaction[];
  canWrite: (walletId: number) => boolean;
  onEdit: (tx: Transaction) => void;
  onDelete: (tx: Transaction) => void;
}

const dayTitle = (iso: string) =>
  new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${iso}T00:00:00`));

export default function TransactionList({ transactions, canWrite, onEdit, onDelete }: Props) {
  const [historyTxId, setHistoryTxId] = useState<number | null>(null);

  // the API already returns rows ordered by date desc, so grouping preserves order
  const groups: { date: string; items: Transaction[]; net: number }[] = [];
  for (const tx of transactions) {
    let g = groups[groups.length - 1];
    if (!g || g.date !== tx.date) groups.push((g = { date: tx.date, items: [], net: 0 }));
    g.items.push(tx);
    g.net += tx.type === 'INCOME' ? tx.amount : -tx.amount;
  }

  return (
    <div>
      {groups.map((g) => (
        <section key={g.date} aria-label={dayTitle(g.date)}>
          <div className="d-flex justify-content-between align-items-center px-3 py-2 small text-secondary" style={{ background: 'var(--canvas)' }}>
            <span className="text-capitalize">{dayTitle(g.date)}</span>
            <span className="num">Ròng {g.net >= 0 ? '+' : '−'}{formatCurrency(Math.abs(g.net))}</span>
          </div>
          <ul className="list-unstyled mb-0">
            {g.items.map((tx) => {
              const writable = canWrite(tx.walletId);
              return (
                <li key={tx.id} className="d-flex align-items-center gap-3 px-3 py-2 border-bottom">
                  <div className="flex-grow-1" style={{ minWidth: 0 }}>
                    <div className="fw-medium text-truncate">{tx.description || tx.categoryName}</div>
                    <div className="small text-secondary text-truncate">
                      {tx.categoryName} · {tx.walletName}
                    </div>
                  </div>
                  <span className={`num fw-semibold text-end ${tx.type === 'INCOME' ? 'text-income' : ''}`} style={{ minWidth: 110 }}>
                    {tx.type === 'INCOME' ? '+' : '−'}{formatCurrency(tx.amount)}
                  </span>
                  <div className="d-flex flex-shrink-0">
                    <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Lịch sử sửa: ${tx.description || tx.categoryName}`} onClick={() => setHistoryTxId(tx.id)}>
                      <History size={16} aria-hidden />
                    </Button>
                    {writable && (
                      <>
                        <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Sửa: ${tx.description || tx.categoryName}`} onClick={() => onEdit(tx)}>
                          <Pencil size={16} aria-hidden />
                        </Button>
                        <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Xóa: ${tx.description || tx.categoryName}`} onClick={() => onDelete(tx)}>
                          <Trash2 size={16} aria-hidden />
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {historyTxId && <TransactionHistoryModal transactionId={historyTxId} onClose={() => setHistoryTxId(null)} />}
    </div>
  );
}
