import { useCallback, useEffect, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import savingGoalService from '../services/savingGoalService';
import walletService from '../services/walletService';
import { formatCurrency } from '../utils/format';
import { goalState } from '../utils/goal';
import type { SavingGoal } from '../types/finance';
import type { Wallet } from '../utils/wallet';

import SavingGoalCard from '../components/saving-goals/SavingGoalCard';
import CreateGoalModal from '../components/saving-goals/CreateGoalModal';
import AddFundModal from '../components/saving-goals/AddFundModal';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageState';

const ORDER = { overdue: 0, soon: 1, active: 2, done: 3, cancelled: 4 } as const;

export default function SavingGoalsPage() {
  const [goals, setGoals] = useState<SavingGoal[] | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [error, setError] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editData, setEditData] = useState<SavingGoal | null>(null);
  const [fundGoalId, setFundGoalId] = useState<number | null>(null);

  const load = useCallback(async () => {
    setGoals(null);
    setError(false);
    try {
      const [g, w] = await Promise.all([savingGoalService.getSavingGoals({ page: 0, size: 200 }), walletService.getMyWallets()]);
      setGoals(g.content);
      setWallets(w);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (goal: SavingGoal) => {
    // deleting a goal does not move money back: the "Chuyển tiền tiết kiệm" expenses stay in the wallets
    if (!window.confirm(`Xóa mục tiêu "${goal.title}"? Số tiền đã nộp không tự hoàn về ví.`)) return;
    try {
      await savingGoalService.deleteGoal(goal.id);
      load();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Không xóa được mục tiêu. Thử lại sau.');
    }
  };

  const openCreate = () => { setEditData(null); setShowCreateModal(true); };

  const sorted = [...(goals ?? [])].sort((a, b) => ORDER[goalState(a).state] - ORDER[goalState(b).state]);
  const saved = (goals ?? []).filter((g) => g.status !== 'CANCELLED').reduce((s, g) => s + Number(g.currentAmount), 0);
  const target = (goals ?? []).filter((g) => g.status === 'IN_PROGRESS').reduce((s, g) => s + Number(g.targetAmount), 0);

  return (
    <div className="page">
      <div className="page-toolbar">
        <div />
        <Button onClick={openCreate} className="d-inline-flex align-items-center gap-1">
          <Plus size={18} aria-hidden /> Tạo mục tiêu
        </Button>
      </div>

      {error ? (
        <div className="panel"><ErrorState onRetry={load} /></div>
      ) : goals === null ? (
        <div className="panel"><LoadingState /></div>
      ) : goals.length === 0 ? (
        <div className="panel">
          <EmptyState title="Chưa có mục tiêu tiết kiệm" description="Đặt một khoản cần để dành và hạn chót, rồi nộp dần từ ví của bạn."
            action={<Button size="sm" onClick={openCreate}>Tạo mục tiêu</Button>} />
        </div>
      ) : (
        <>
          <section className="panel mb-3">
            <div className="panel-body d-flex flex-wrap gap-4">
              <div>
                <div className="small text-secondary">Đã để dành</div>
                <div className="num fs-5 fw-semibold text-income">{formatCurrency(saved)}</div>
              </div>
              <div>
                <div className="small text-secondary">Tổng mục tiêu đang theo đuổi</div>
                <div className="num fs-5 fw-semibold">{formatCurrency(target)}</div>
              </div>
            </div>
          </section>
          <Row className="g-3">
            {sorted.map((goal) => (
              <Col md={6} xl={4} key={goal.id}>
                <SavingGoalCard goal={goal} onAddFund={setFundGoalId} onEdit={(g) => { setEditData(g); setShowCreateModal(true); }} onDelete={handleDelete} />
              </Col>
            ))}
          </Row>
        </>
      )}

      <CreateGoalModal show={showCreateModal} onHide={() => setShowCreateModal(false)} onSuccess={load} editData={editData} />
      <AddFundModal show={fundGoalId !== null} onHide={() => setFundGoalId(null)} onSuccess={load} goalId={fundGoalId} wallets={wallets} />
    </div>
  );
}
