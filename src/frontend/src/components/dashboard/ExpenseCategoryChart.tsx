import type { CategoryExpense } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import { EmptyState } from '../ui/PageState';

interface Props {
  data: CategoryExpense[];
  limit?: number;
}

/** Ranked list with inline bars: amount and share are readable without hovering, unlike a donut + legend. */
export default function ExpenseCategoryChart({ data, limit = 6 }: Props) {
  const total = data.reduce((s, c) => s + c.totalAmount, 0);
  const rows = data.slice(0, limit);
  const rest = data.slice(limit).reduce((s, c) => s + c.totalAmount, 0);

  return (
    <section className="panel h-100">
      <div className="panel-header">
        <h2 className="panel-title">Chi tiêu theo danh mục</h2>
      </div>
      <div className="panel-body">
        {data.length === 0 || total === 0 ? (
          <EmptyState title="Chưa có khoản chi trong kỳ này" description="Khi bạn ghi khoản chi, phân bổ theo danh mục sẽ hiện ở đây." />
        ) : (
          <ol className="list-unstyled mb-0 d-flex flex-column gap-3">
            {rows.map((c) => {
              const share = (c.totalAmount / total) * 100;
              return (
                <li key={c.categoryId}>
                  <div className="d-flex justify-content-between gap-2 small mb-1">
                    <span className="d-flex align-items-center gap-2 text-truncate">
                      <span aria-hidden className="rounded-circle flex-shrink-0" style={{ width: 8, height: 8, background: c.color || 'var(--ink-muted)' }} />
                      <span className="text-truncate">{c.categoryName}</span>
                    </span>
                    <span className="num fw-semibold">{formatCurrency(c.totalAmount)}</span>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <div className="meter flex-grow-1" role="img" aria-label={`${share.toFixed(1)}% tổng chi`}>
                      <span style={{ width: `${share}%` }} />
                    </div>
                    <span className="num text-secondary" style={{ fontSize: 'var(--fs-xs)', minWidth: 40, textAlign: 'right' }}>{share.toFixed(1)}%</span>
                  </div>
                </li>
              );
            })}
            {rest > 0 && (
              <li className="d-flex justify-content-between small text-secondary">
                <span>{data.length - limit} danh mục khác</span>
                <span className="num">{formatCurrency(rest)}</span>
              </li>
            )}
          </ol>
        )}
      </div>
    </section>
  );
}
