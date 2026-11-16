import { Link } from 'react-router-dom';
import type { Transaction } from '../../types/finance';
import { formatCurrency, formatDayLabel } from '../../utils/format';
import { EmptyState, ErrorState, LoadingState } from '../ui/PageState';

interface Props {
  items: Transaction[] | null; // null while loading
  error: boolean;
  onRetry: () => void;
}

export default function RecentTransactions({ items, error, onRetry }: Props) {
  return (
    <section className="panel h-100">
      <div className="panel-header">
        <h2 className="panel-title">Giao dịch gần đây</h2>
        <Link to="/transactions" className="small text-decoration-none">Xem tất cả</Link>
      </div>
      <div className="panel-body pt-2">
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : items === null ? (
          <LoadingState compact />
        ) : items.length === 0 ? (
          <EmptyState
            title="Chưa có giao dịch nào"
            action={<Link to="/transactions" className="btn btn-primary btn-sm">Ghi giao dịch đầu tiên</Link>}
          />
        ) : (
          <ul className="list-unstyled mb-0">
            {items.map((t) => (
              <li key={t.id} className="d-flex align-items-center gap-3 py-2 border-bottom">
                <span className="num text-secondary small" style={{ minWidth: 44 }}>{formatDayLabel(t.date)}</span>
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="small fw-medium text-truncate">{t.description || t.categoryName}</div>
                  <div className="text-secondary text-truncate" style={{ fontSize: 'var(--fs-xs)' }}>
                    {t.categoryName} · {t.walletName}
                  </div>
                </div>
                <span className={`num small fw-semibold ${t.type === 'INCOME' ? 'text-income' : ''}`}>
                  {t.type === 'INCOME' ? '+' : '−'}{formatCurrency(t.amount)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
