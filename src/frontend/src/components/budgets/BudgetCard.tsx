import { Button } from 'react-bootstrap';
import { History, Pencil, Trash2 } from 'lucide-react';
import type { Budget } from '../../types/finance';
import { formatCurrency } from '../../utils/format';
import { getBudgetUsage, usageText } from '../../utils/budget';

interface Props {
  budget: Budget;
  spentAmount: number;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
  onHistory: (id: number) => void;
}

export default function BudgetCard({ budget, spentAmount, onEdit, onDelete, onHistory }: Props) {
  const usage = getBudgetUsage(budget.limitAmount, spentAmount, budget.warningPercent);
  const warn = budget.warningPercent ?? 80;

  return (
    <article className="panel h-100 d-flex flex-column">
      <div className="panel-body d-flex flex-column gap-2 flex-grow-1">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div style={{ minWidth: 0 }}>
            <h3 className="h6 fw-semibold mb-0 text-truncate">{budget.categoryName}</h3>
            <div className="small text-secondary">Cảnh báo ở {warn}% hạn mức</div>
          </div>
          <span className={`status-pill ${usage.level}`}>{usageText[usage.level]}</span>
        </div>

        <div className="d-flex justify-content-between align-items-baseline mt-2">
          <span className="num fs-5 fw-semibold">{formatCurrency(spentAmount)}</span>
          <span className="num small text-secondary">/ {formatCurrency(budget.limitAmount)}</span>
        </div>

        <div className={`meter ${usage.level}`} role="progressbar" aria-valuenow={Math.floor(usage.percent)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Đã dùng ${usage.percentLabel} ngân sách ${budget.categoryName}`}>
          <span style={{ width: `${usage.barPercent}%` }} />
        </div>

        <div className="d-flex justify-content-between small">
          <span className="num text-secondary">Đã dùng {usage.percentLabel}</span>
          {usage.remaining >= 0 ? (
            <span className="num">Còn {formatCurrency(usage.remaining)}</span>
          ) : (
            <span className="num text-danger-strong fw-semibold">Vượt {formatCurrency(-usage.remaining)}</span>
          )}
        </div>
      </div>

      <div className="d-flex border-top">
        <Button variant="link" size="sm" className="flex-fill text-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2" onClick={() => onEdit(budget)}>
          <Pencil size={14} aria-hidden /> Sửa hạn mức
        </Button>
        <Button variant="link" size="sm" className="flex-fill text-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 border-start" onClick={() => onHistory(budget.id)}>
          <History size={14} aria-hidden /> Lịch sử
        </Button>
        <Button variant="link" size="sm" className="flex-fill text-danger-strong text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 border-start" onClick={() => onDelete(budget)}>
          <Trash2 size={14} aria-hidden /> Xóa
        </Button>
      </div>
    </article>
  );
}
