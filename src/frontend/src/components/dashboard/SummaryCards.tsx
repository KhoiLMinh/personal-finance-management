import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

interface Props {
  overview: DashboardOverview;
  periodLabel: string;
}

// For income a rise is good; for spending a rise is bad. Colour follows meaning, not sign.
function Change({ value, higherIsGood }: { value: number; higherIsGood: boolean }) {
  if (!Number.isFinite(value) || value === 0) return <span className="text-secondary">Không đổi so với kỳ trước</span>;
  const good = value > 0 === higherIsGood;
  return (
    <span className={good ? 'text-income' : 'text-danger-strong'}>
      {value > 0 ? '▲' : '▼'} {Math.abs(value).toFixed(1)}% so với kỳ trước
    </span>
  );
}

/** The dashboard's one emphasised element: the period's cash flow written as an equation, next to total balance. */
export default function SummaryCards({ overview, periodLabel }: Props) {
  const net = overview.netSavings;
  return (
    <section className="panel cashflow mb-3" aria-label={`Dòng tiền ${periodLabel}`}>
      <div className="cashflow-balance">
        <div className="small text-secondary">Tổng số dư các ví</div>
        <div className="num cashflow-total">{formatCurrency(overview.totalBalance)}</div>
        <div className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>Hiện tại, gồm cả ví được chia sẻ</div>
      </div>

      <div className="cashflow-eq">
        <div>
          <div className="small text-secondary">Thu nhập · {periodLabel}</div>
          <div className="num cashflow-figure text-income">+{formatCurrency(overview.totalIncome)}</div>
          <div className="cashflow-note"><Change value={overview.incomeChangePercent} higherIsGood /></div>
        </div>
        <span className="cashflow-op" aria-hidden>−</span>
        <div>
          <div className="small text-secondary">Chi tiêu</div>
          <div className="num cashflow-figure">{formatCurrency(overview.totalExpense)}</div>
          <div className="cashflow-note"><Change value={overview.expenseChangePercent} higherIsGood={false} /></div>
        </div>
        <span className="cashflow-op" aria-hidden>=</span>
        <div>
          <div className="small text-secondary">Còn lại</div>
          <div className={`num cashflow-figure ${net < 0 ? 'text-danger-strong' : ''}`}>{formatCurrency(net)}</div>
          <div className="cashflow-note text-secondary">{net < 0 ? 'Chi nhiều hơn thu' : 'Thu trừ chi trong kỳ'}</div>
        </div>
      </div>
    </section>
  );
}
