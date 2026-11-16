import { useCallback, useEffect, useState } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Plus } from 'lucide-react';

import budgetService from '../services/budgetService';
import categoryService from '../services/categoryService';
import reportService from '../services/reportService';
import type { Budget, Category } from '../types/finance';
import type { CategoryExpense } from '../types/dashboard';
import { formatCurrency } from '../utils/format';
import { getBudgetUsage } from '../utils/budget';

import PeriodPicker, { currentPeriod, periodLabel, periodRange, type Period } from '../components/ui/PeriodPicker';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageState';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetModal from '../components/budgets/BudgetModal';
import BudgetHistoryModal from '../components/budgets/BudgetHistoryModal';

export default function BudgetsPage() {
  const [period, setPeriod] = useState<Period>(() => currentPeriod('MONTH'));
  const [budgets, setBudgets] = useState<Budget[] | null>(null);
  const [expenses, setExpenses] = useState<CategoryExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Budget | null>(null);
  const [historyBudgetId, setHistoryBudgetId] = useState<number | null>(null);

  useEffect(() => {
    categoryService.getMyCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setBudgets(null);
    setError(false);
    try {
      const { startDate, endDate } = periodRange(period);
      // spent per category for the viewed month comes from the backend report (see audit M-13 for a dedicated field)
      const [page, report] = await Promise.all([
        budgetService.getBudgets({ page: 0, size: 200 }),
        reportService.getOverview(startDate, endDate, 'WEEK'),
      ]);
      setBudgets((page.content as Budget[]).filter((b) => b.month === period.month && b.year === period.year));
      setExpenses(report.expenseByCategory);
    } catch {
      setError(true);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  const spentOf = (categoryId: number) => expenses.find((e) => e.categoryId === categoryId)?.totalAmount ?? 0;

  const handleDelete = async (b: Budget) => {
    if (!window.confirm(`Xóa ngân sách "${b.categoryName}" tháng ${b.month}/${b.year}? Giao dịch không bị ảnh hưởng.`)) return;
    try {
      await budgetService.deleteBudget(b.id);
      load();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Không xóa được ngân sách. Thử lại sau.');
    }
  };

  const openCreate = () => { setEditData(null); setShowModal(true); };

  const totals = (budgets ?? []).reduce(
    (acc, b) => {
      const spent = spentOf(b.categoryId);
      acc.limit += b.limitAmount;
      acc.spent += spent;
      if (getBudgetUsage(b.limitAmount, spent, b.warningPercent).level === 'over') acc.over += 1;
      return acc;
    },
    { limit: 0, spent: 0, over: 0 },
  );

  return (
    <div className="page">
      <div className="page-toolbar">
        <PeriodPicker value={period} onChange={setPeriod} monthOnly allowFuture />
        <Button onClick={openCreate} className="d-inline-flex align-items-center gap-1">
          <Plus size={18} aria-hidden /> Tạo ngân sách
        </Button>
      </div>

      {error ? (
        <div className="panel"><ErrorState onRetry={load} /></div>
      ) : budgets === null ? (
        <div className="panel"><LoadingState /></div>
      ) : budgets.length === 0 ? (
        <div className="panel">
          <EmptyState
            title={`Chưa có ngân sách cho ${periodLabel(period).toLowerCase()}`}
            description="Đặt hạn mức cho từng danh mục chi để được cảnh báo trước khi tiêu quá tay."
            action={<Button size="sm" onClick={openCreate}>Tạo ngân sách</Button>}
          />
        </div>
      ) : (
        <>
          <section className="panel mb-3">
            <div className="panel-body d-flex flex-wrap gap-4">
              <div>
                <div className="small text-secondary">Đã chi / tổng hạn mức</div>
                <div className="num fs-5 fw-semibold">{formatCurrency(totals.spent)} <span className="text-secondary fw-normal">/ {formatCurrency(totals.limit)}</span></div>
              </div>
              <div>
                <div className="small text-secondary">Ngân sách đã vượt</div>
                <div className={`num fs-5 fw-semibold ${totals.over > 0 ? 'text-danger-strong' : ''}`}>{totals.over} / {budgets.length}</div>
              </div>
            </div>
          </section>
          <Row className="g-3">
            {budgets.map((b) => (
              <Col md={6} xl={4} key={b.id}>
                <BudgetCard budget={b} spentAmount={spentOf(b.categoryId)}
                  onEdit={(x) => { setEditData(x); setShowModal(true); }} onDelete={handleDelete} onHistory={setHistoryBudgetId} />
              </Col>
            ))}
          </Row>
        </>
      )}

      <BudgetModal show={showModal} onHide={() => setShowModal(false)} onSuccess={load} editData={editData}
        categories={categories} defaultMonth={period.month} defaultYear={period.year} />
      {historyBudgetId && <BudgetHistoryModal budgetId={historyBudgetId} onClose={() => setHistoryBudgetId(null)} />}
    </div>
  );
}
