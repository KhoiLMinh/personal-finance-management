import { useCallback, useEffect, useState } from 'react';
import { Row, Col, Dropdown } from 'react-bootstrap';
import { Download } from 'lucide-react';
import reportService from '../services/reportService';
import aiService from '../services/aiService';
import transactionService from '../services/transactionService';
import budgetService from '../services/budgetService';
import savingGoalService from '../services/savingGoalService';
import type { DashboardOverview } from '../types/dashboard';
import type { Transaction } from '../types/finance';

import PeriodPicker, { currentPeriod, periodLabel, periodRange, type Period } from '../components/ui/PeriodPicker';
import { ErrorState, LoadingState } from '../components/ui/PageState';
import AiAdviceCard from '../components/dashboard/AiAdviceCard';
import SummaryCards from '../components/dashboard/SummaryCards';
import ExpenseCategoryChart from '../components/dashboard/ExpenseCategoryChart';
import TrendChart from '../components/dashboard/TrendChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import DashboardAlerts, { type AlertsData } from '../components/dashboard/DashboardAlerts';

// Backend buckets: a month is split into weeks, a year into months.
const timeUnitFor = (p: Period) => (p.mode === 'MONTH' ? 'WEEK' : 'MONTH');

export default function DashboardPage() {
  const [period, setPeriod] = useState<Period>(() => currentPeriod());

  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [overviewError, setOverviewError] = useState(false);

  const [recent, setRecent] = useState<Transaction[] | null>(null);
  const [recentError, setRecentError] = useState(false);

  const [alerts, setAlerts] = useState<AlertsData | null>(null);
  const [alertsError, setAlertsError] = useState(false);

  const [aiAdvice, setAiAdvice] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(false);

  const loadOverview = useCallback(async () => {
    setOverview(null);
    setOverviewError(false);
    try {
      const { startDate, endDate } = periodRange(period);
      setOverview(await reportService.getOverview(startDate, endDate, timeUnitFor(period)));
    } catch {
      setOverviewError(true);
    }
  }, [period]);

  const loadRecent = useCallback(async () => {
    setRecent(null);
    setRecentError(false);
    try {
      const page = await transactionService.getTransactions({ page: 0, size: 6 });
      setRecent(page.content);
    } catch {
      setRecentError(true);
    }
  }, []);

  // Alerts are always about "now" (this month's budgets, upcoming goals), independent of the period being browsed.
  const loadAlerts = useCallback(async () => {
    setAlerts(null);
    setAlertsError(false);
    try {
      const { startDate, endDate } = periodRange(currentPeriod('MONTH'));
      const [budgets, goals, month] = await Promise.all([
        budgetService.getBudgets({ page: 0, size: 200 }),
        savingGoalService.getSavingGoals({ page: 0, size: 200 }),
        reportService.getOverview(startDate, endDate, 'WEEK'),
      ]);
      setAlerts({ budgets: budgets.content, goals: goals.content, monthExpenses: month.expenseByCategory });
    } catch {
      setAlertsError(true);
    }
  }, []);

  useEffect(() => { loadOverview(); setAiAdvice(null); setAiError(false); }, [loadOverview]);
  useEffect(() => { loadRecent(); loadAlerts(); }, [loadRecent, loadAlerts]);

  const requestAi = async () => {
    setAiLoading(true);
    setAiError(false);
    try {
      const { startDate, endDate } = periodRange(period);
      setAiAdvice((await aiService.analyzeReport(startDate, endDate)).reply);
    } catch {
      setAiAdvice(null);
      setAiError(true);
    } finally {
      setAiLoading(false);
    }
  };

  const exportFile = async (kind: 'excel' | 'pdf') => {
    const { startDate, endDate } = periodRange(period);
    try {
      await (kind === 'excel' ? reportService.downloadExcel(startDate, endDate) : reportService.downloadPdf(startDate, endDate));
    } catch {
      alert('Không tạo được file báo cáo. Thử lại sau ít phút.');
    }
  };

  const label = periodLabel(period);

  return (
    <div className="page">
      <div className="page-toolbar">
        <PeriodPicker value={period} onChange={setPeriod} />
        <Dropdown align="end">
          <Dropdown.Toggle variant="outline-secondary" size="sm" className="d-inline-flex align-items-center gap-1">
            <Download size={16} aria-hidden /> Xuất báo cáo
          </Dropdown.Toggle>
          <Dropdown.Menu>
            <Dropdown.Item onClick={() => exportFile('excel')}>Excel (.xlsx) · {label}</Dropdown.Item>
            <Dropdown.Item onClick={() => exportFile('pdf')}>PDF (.pdf) · {label}</Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>

      {overviewError ? (
        <div className="panel mb-3"><ErrorState onRetry={loadOverview} /></div>
      ) : !overview ? (
        <div className="panel mb-3"><LoadingState /></div>
      ) : (
        <>
          <SummaryCards overview={overview} periodLabel={label} />
          <Row className="g-3 mb-3">
            <Col lg={7}><TrendChart data={overview.trendData} /></Col>
            <Col lg={5}><ExpenseCategoryChart data={overview.expenseByCategory} /></Col>
          </Row>
        </>
      )}

      <Row className="g-3 mb-3">
        <Col lg={7}><RecentTransactions items={recent} error={recentError} onRetry={loadRecent} /></Col>
        <Col lg={5}><DashboardAlerts data={alerts} error={alertsError} onRetry={loadAlerts} /></Col>
      </Row>

      <AiAdviceCard aiAdvice={aiAdvice} aiLoading={aiLoading} aiError={aiError} onRequest={requestAi} periodLabel={label} />
    </div>
  );
}
