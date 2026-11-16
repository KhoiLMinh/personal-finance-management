import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, ButtonGroup, Col, Form, Row } from 'react-bootstrap';
import { Download } from 'lucide-react';
import reportService from '../services/reportService';
import walletService from '../services/walletService';
import type { DashboardOverview } from '../types/dashboard';
import type { Wallet } from '../utils/wallet';
import { formatDayLabel, toLocalISODate } from '../utils/format';

import SummaryCards from '../components/dashboard/SummaryCards';
import TrendChart from '../components/dashboard/TrendChart';
import ExpenseCategoryChart from '../components/dashboard/ExpenseCategoryChart';
import { ErrorState, LoadingState } from '../components/ui/PageState';

interface Range { startDate: string; endDate: string }

const DAY = 86_400_000;
const days = (r: Range) => Math.round((new Date(r.endDate).getTime() - new Date(r.startDate).getTime()) / DAY) + 1;

const presets = (): { label: string; range: Range }[] => {
  const now = new Date();
  const y = now.getFullYear(), m = now.getMonth();
  return [
    { label: 'Tháng này', range: { startDate: toLocalISODate(new Date(y, m, 1)), endDate: toLocalISODate(new Date(y, m + 1, 0)) } },
    { label: 'Tháng trước', range: { startDate: toLocalISODate(new Date(y, m - 1, 1)), endDate: toLocalISODate(new Date(y, m, 0)) } },
    { label: '3 tháng', range: { startDate: toLocalISODate(new Date(y, m - 2, 1)), endDate: toLocalISODate(new Date(y, m + 1, 0)) } },
    { label: 'Năm nay', range: { startDate: `${y}-01-01`, endDate: `${y}-12-31` } },
  ];
};

// Backend groups by DAY (one bucket per date) or MONTH ("Tháng n", month number only, so it merges years — audit M-03).
const timeUnitFor = (r: Range) =>
  days(r) <= 62 || r.startDate.slice(0, 4) !== r.endDate.slice(0, 4) ? 'DAY' : 'MONTH';

export default function ReportsPage() {
  const options = useMemo(presets, []);
  const [range, setRange] = useState<Range>(options[0].range);
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [error, setError] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [exportWallet, setExportWallet] = useState('');

  useEffect(() => { walletService.getMyWallets().then(setWallets).catch(() => setWallets([])); }, []);

  const valid = range.startDate && range.endDate && range.startDate <= range.endDate;

  const load = useCallback(async () => {
    if (!valid) return;
    setOverview(null);
    setError(false);
    try {
      setOverview(await reportService.getOverview(range.startDate, range.endDate, timeUnitFor(range)));
    } catch {
      setError(true);
    }
  }, [range, valid]);

  useEffect(() => { load(); }, [load]);

  const trend = overview && timeUnitFor(range) === 'DAY'
    ? overview.trendData.map((d) => ({ ...d, date: formatDayLabel(d.date) }))
    : overview?.trendData ?? [];

  const exportFile = async (kind: 'excel' | 'pdf') => {
    const walletId = exportWallet ? Number(exportWallet) : null;
    try {
      await (kind === 'excel'
        ? reportService.downloadExcel(range.startDate, range.endDate, walletId)
        : reportService.downloadPdf(range.startDate, range.endDate, walletId));
    } catch {
      alert('Không tạo được file báo cáo. Thử lại sau ít phút.');
    }
  };

  return (
    <div className="page">
      <section className="panel mb-3">
        <div className="panel-body">
          <Row className="g-2 align-items-end">
            <Col xs={12} lg="auto">
              <div className="small text-secondary mb-1">Khoảng thời gian</div>
              <ButtonGroup size="sm" className="flex-wrap">
                {options.map((o) => {
                  const on = o.range.startDate === range.startDate && o.range.endDate === range.endDate;
                  return <Button key={o.label} variant={on ? 'primary' : 'outline-secondary'} aria-pressed={on} onClick={() => setRange(o.range)}>{o.label}</Button>;
                })}
              </ButtonGroup>
            </Col>
            <Col xs={6} lg={2}>
              <Form.Label htmlFor="rp-from" className="small text-secondary mb-1">Từ ngày</Form.Label>
              <Form.Control id="rp-from" size="sm" type="date" value={range.startDate} max={range.endDate} onChange={(e) => setRange({ ...range, startDate: e.target.value })} />
            </Col>
            <Col xs={6} lg={2}>
              <Form.Label htmlFor="rp-to" className="small text-secondary mb-1">Đến ngày</Form.Label>
              <Form.Control id="rp-to" size="sm" type="date" value={range.endDate} min={range.startDate} onChange={(e) => setRange({ ...range, endDate: e.target.value })} />
            </Col>
            <Col xs={12} lg className="d-flex flex-wrap gap-2 justify-content-lg-end align-items-end">
              <div>
                <Form.Label htmlFor="rp-wallet" className="small text-secondary mb-1">Ví (khi xuất file)</Form.Label>
                <Form.Select id="rp-wallet" size="sm" value={exportWallet} onChange={(e) => setExportWallet(e.target.value)}>
                  <option value="">Tất cả ví</option>
                  {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </Form.Select>
              </div>
              <Button size="sm" variant="outline-secondary" className="d-inline-flex align-items-center gap-1" disabled={!valid} onClick={() => exportFile('excel')}>
                <Download size={14} aria-hidden /> Excel
              </Button>
              <Button size="sm" variant="outline-secondary" className="d-inline-flex align-items-center gap-1" disabled={!valid} onClick={() => exportFile('pdf')}>
                <Download size={14} aria-hidden /> PDF
              </Button>
            </Col>
          </Row>
          {!valid && <div className="small text-danger-strong mt-2">Ngày bắt đầu phải trước hoặc bằng ngày kết thúc.</div>}
        </div>
      </section>

      {error ? (
        <div className="panel"><ErrorState onRetry={load} /></div>
      ) : !overview ? (
        <div className="panel"><LoadingState /></div>
      ) : (
        <>
          <SummaryCards overview={overview} periodLabel="kỳ đã chọn" />
          <Row className="g-3">
            <Col lg={7}><TrendChart data={trend} title={timeUnitFor(range) === 'DAY' ? 'Thu chi theo ngày' : 'Thu chi theo tháng'} /></Col>
            <Col lg={5}><ExpenseCategoryChart data={overview.expenseByCategory} limit={12} /></Col>
          </Row>
          <p className="small text-secondary mt-3 mb-0">
            Số liệu tính trên mọi ví bạn có quyền xem, kể cả ví được chia sẻ. "So với kỳ trước" là khoảng ngày có cùng độ dài, liền trước khoảng đang chọn.
          </p>
        </>
      )}
    </div>
  );
}
