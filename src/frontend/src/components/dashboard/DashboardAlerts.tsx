import { Link } from 'react-router-dom';
import type { Budget, SavingGoal } from '../../types/finance';
import type { CategoryExpense } from '../../types/dashboard';
import { getBudgetUsage, usageText } from '../../utils/budget';
import { formatCurrency } from '../../utils/format';
import { goalState } from '../../utils/goal';
import { EmptyState, ErrorState, LoadingState } from '../ui/PageState';

export interface AlertsData {
  budgets: Budget[];
  goals: SavingGoal[];
  monthExpenses: CategoryExpense[]; // current month, from /report/overview
}

interface Props {
  data: AlertsData | null;
  error: boolean;
  onRetry: () => void;
}

/** Budgets of the current month at/over their warning threshold, and active goals due within 30 days or overdue. */
export default function DashboardAlerts({ data, error, onRetry }: Props) {
  const now = new Date();
  const budgets = (data?.budgets ?? [])
    .filter((b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear())
    .map((b) => {
      const spent = data?.monthExpenses.find((e) => e.categoryId === b.categoryId)?.totalAmount ?? 0;
      return { b, spent, usage: getBudgetUsage(b.limitAmount, spent, b.warningPercent) };
    })
    .filter((x) => x.usage.level !== 'ok')
    .sort((x, y) => y.usage.percent - x.usage.percent);

  const goals = (data?.goals ?? [])
    .map((g) => ({ g, st: goalState(g) }))
    .filter((x) => x.st.state === 'overdue' || x.st.state === 'soon')
    .sort((x, y) => x.st.days - y.st.days);

  return (
    <section className="panel h-100">
      <div className="panel-header">
        <h2 className="panel-title">Cần chú ý</h2>
      </div>
      <div className="panel-body pt-2">
        {error ? (
          <ErrorState onRetry={onRetry} />
        ) : data === null ? (
          <LoadingState compact />
        ) : budgets.length === 0 && goals.length === 0 ? (
          <EmptyState title="Mọi thứ đang trong tầm kiểm soát" description="Không có ngân sách nào chạm ngưỡng cảnh báo và không có mục tiêu sắp đến hạn." />
        ) : (
          <ul className="list-unstyled mb-0">
            {budgets.map(({ b, spent, usage }) => (
              <li key={`b${b.id}`} className="py-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                  <Link to="/budgets" className="small fw-medium text-reset text-decoration-none text-truncate">Ngân sách · {b.categoryName}</Link>
                  <span className={`status-pill ${usage.level}`}>{usageText[usage.level]}</span>
                </div>
                <div className={`meter ${usage.level} mb-1`}><span style={{ width: `${usage.barPercent}%` }} /></div>
                <div className="d-flex justify-content-between text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>
                  <span className="num">{formatCurrency(spent)} / {formatCurrency(b.limitAmount)}</span>
                  <span className="num">{usage.percentLabel}</span>
                </div>
              </li>
            ))}
            {goals.map(({ g, st }) => (
              <li key={`g${g.id}`} className="py-2 border-bottom">
                <div className="d-flex justify-content-between align-items-center gap-2 mb-1">
                  <Link to="/saving-goals" className="small fw-medium text-reset text-decoration-none text-truncate">Mục tiêu · {g.title}</Link>
                  <span className={`status-pill ${st.pill}`}>{st.label}</span>
                </div>
                <div className="meter mb-1"><span style={{ width: `${Math.min(100, st.percent)}%` }} /></div>
                <div className="d-flex justify-content-between text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>
                  <span className="num">{formatCurrency(g.currentAmount)} / {formatCurrency(g.targetAmount)}</span>
                  <span className="num">{st.percent}%</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
