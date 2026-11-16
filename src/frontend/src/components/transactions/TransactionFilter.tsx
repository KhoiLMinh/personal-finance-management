import { Button, ButtonGroup, Col, Form, InputGroup, Row } from 'react-bootstrap';
import { Search, X } from 'lucide-react';
import type { Category, TxType } from '../../types/finance';
import type { Wallet } from '../../utils/wallet';

export interface TxFilters {
  keyword: string;
  walletId: string;
  categoryId: string;
  startDate: string;
  endDate: string;
  type: 'ALL' | TxType; // applied to the loaded page only: the API has no type parameter
}

export const EMPTY_FILTERS: TxFilters = { keyword: '', walletId: '', categoryId: '', startDate: '', endDate: '', type: 'ALL' };

interface Props {
  value: TxFilters;
  onChange: (f: TxFilters) => void;
  wallets: Wallet[];
  categories: Category[];
}

export default function TransactionFilter({ value, onChange, wallets, categories }: Props) {
  const set = (patch: Partial<TxFilters>) => onChange({ ...value, ...patch });
  const visibleCats = categories.filter((c) => value.type === 'ALL' || c.type === value.type);
  const active = JSON.stringify(value) !== JSON.stringify(EMPTY_FILTERS);

  return (
    <div className="panel-body border-bottom">
      <Row className="g-2 align-items-end">
        <Col xs={12} lg={4}>
          <Form.Label htmlFor="tx-search" className="small text-secondary mb-1">Tìm theo ghi chú</Form.Label>
          <InputGroup size="sm">
            <InputGroup.Text><Search size={14} aria-hidden /></InputGroup.Text>
            <Form.Control id="tx-search" placeholder="VD: cà phê, lương…" value={value.keyword} onChange={(e) => set({ keyword: e.target.value })} />
          </InputGroup>
        </Col>
        <Col xs={6} lg={2}>
          <Form.Label htmlFor="tx-from" className="small text-secondary mb-1">Từ ngày</Form.Label>
          <Form.Control id="tx-from" size="sm" type="date" value={value.startDate} max={value.endDate || undefined} onChange={(e) => set({ startDate: e.target.value })} />
        </Col>
        <Col xs={6} lg={2}>
          <Form.Label htmlFor="tx-to" className="small text-secondary mb-1">Đến ngày</Form.Label>
          <Form.Control id="tx-to" size="sm" type="date" value={value.endDate} min={value.startDate || undefined} onChange={(e) => set({ endDate: e.target.value })} />
        </Col>
        <Col xs={6} lg={2}>
          <Form.Label htmlFor="tx-wallet" className="small text-secondary mb-1">Ví</Form.Label>
          <Form.Select id="tx-wallet" size="sm" value={value.walletId} onChange={(e) => set({ walletId: e.target.value })}>
            <option value="">Tất cả ví</option>
            {wallets.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
          </Form.Select>
        </Col>
        <Col xs={6} lg={2}>
          <Form.Label htmlFor="tx-cat" className="small text-secondary mb-1">Danh mục</Form.Label>
          <Form.Select id="tx-cat" size="sm" value={value.categoryId} onChange={(e) => set({ categoryId: e.target.value })}>
            <option value="">Tất cả danh mục</option>
            {visibleCats.map((c) => <option key={c.id} value={c.id}>{c.parentId ? '↳ ' : ''}{c.name}</option>)}
          </Form.Select>
        </Col>
      </Row>
      <div className="d-flex flex-wrap align-items-center gap-2 mt-2">
        <ButtonGroup size="sm" aria-label="Loại giao dịch">
          {([['ALL', 'Tất cả'], ['INCOME', 'Thu'], ['EXPENSE', 'Chi']] as const).map(([v, label]) => (
            <Button key={v} variant={value.type === v ? 'primary' : 'outline-secondary'} aria-pressed={value.type === v}
              onClick={() => set({ type: v, categoryId: '' })}>
              {label}
            </Button>
          ))}
        </ButtonGroup>
        {active && (
          <Button size="sm" variant="link" className="text-secondary d-inline-flex align-items-center gap-1" onClick={() => onChange(EMPTY_FILTERS)}>
            <X size={14} aria-hidden /> Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
