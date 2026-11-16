import { Button } from 'react-bootstrap';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import type { SavingGoal } from '../../types/finance';
import { formatCurrency } from '../../utils/format';
import { goalState } from '../../utils/goal';

interface Props {
  goal: SavingGoal;
  onAddFund: (goalId: number) => void;
  onEdit: (goal: SavingGoal) => void;
  onDelete: (goal: SavingGoal) => void;
}

export default function SavingGoalCard({ goal, onAddFund, onEdit, onDelete }: Props) {
  const st = goalState(goal);
  const open = st.state !== 'done' && st.state !== 'cancelled';
  // a hint, not a record: what is left divided by the whole months left before the deadline
  const monthsLeft = Math.max(1, Math.ceil(st.days / 30));
  const pace = open && st.days >= 0 && st.remaining > 0 ? st.remaining / monthsLeft : null;

  return (
    <article className="panel h-100 d-flex flex-column">
      <div className="panel-body d-flex flex-column gap-2 flex-grow-1">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div style={{ minWidth: 0 }}>
            <h3 className="h6 fw-semibold mb-0 text-truncate">{goal.title}</h3>
            <div className="small text-secondary">Hạn {new Date(`${goal.deadline}T00:00:00`).toLocaleDateString('vi-VN')}</div>
          </div>
          <span className={`status-pill ${st.pill}`}>{st.label}</span>
        </div>

        <div className="d-flex justify-content-between align-items-baseline mt-2">
          <span className="num fs-5 fw-semibold">{formatCurrency(goal.currentAmount)}</span>
          <span className="num small text-secondary">/ {formatCurrency(goal.targetAmount)}</span>
        </div>
        <div className={`meter ${st.state === 'done' ? 'ok' : ''}`} role="progressbar" aria-valuenow={Math.min(100, st.percent)} aria-valuemin={0} aria-valuemax={100}
          aria-label={`Đã đạt ${st.percent}% mục tiêu ${goal.title}`}>
          <span style={{ width: `${Math.min(100, st.percent)}%` }} />
        </div>
        <div className="d-flex justify-content-between small">
          <span className="num text-secondary">Đạt {st.percent}%</span>
          {st.remaining > 0 && <span className="num">Còn thiếu {formatCurrency(st.remaining)}</span>}
        </div>
        {pace !== null && (
          <div className="small text-secondary">Để kịp hạn, cần để dành khoảng <span className="num text-ink">{formatCurrency(Math.ceil(pace))}</span>/tháng.</div>
        )}
        {st.state === 'overdue' && <div className="small text-danger-strong">Đã quá hạn. Cân nhắc dời hạn hoặc giảm số tiền mục tiêu.</div>}
      </div>

      <div className="d-flex border-top">
        {open && (
          <Button variant="link" size="sm" className="flex-fill text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 fw-semibold" onClick={() => onAddFund(goal.id)}>
            <Plus size={14} aria-hidden /> Nộp thêm
          </Button>
        )}
        <Button variant="link" size="sm" className={`flex-fill text-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 ${open ? 'border-start' : ''}`} onClick={() => onEdit(goal)}>
          <Pencil size={14} aria-hidden /> Sửa
        </Button>
        <Button variant="link" size="sm" className="flex-fill text-danger-strong text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 border-start" onClick={() => onDelete(goal)}>
          <Trash2 size={14} aria-hidden /> Xóa
        </Button>
      </div>
    </article>
  );
}
