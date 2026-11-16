import { useCallback, useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import transactionService from '../services/transactionService';
import walletService from '../services/walletService';
import categoryService from '../services/categoryService';
import type { Category, Page, Transaction } from '../types/finance';
import { canWriteWallet, type Wallet } from '../utils/wallet';

import TransactionFilter, { EMPTY_FILTERS, type TxFilters } from '../components/transactions/TransactionFilter';
import TransactionList from '../components/transactions/TransactionList';
import TransactionModal from '../components/transactions/TransactionModal';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageState';

const PAGE_SIZE = 20;

export default function TransactionsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [filters, setFilters] = useState<TxFilters>(EMPTY_FILTERS);
  const [keyword, setKeyword] = useState(''); // debounced copy of filters.keyword
  const [page, setPage] = useState(0);
  const [data, setData] = useState<Page<Transaction> | null>(null);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Transaction | null>(null);

  useEffect(() => {
    Promise.all([walletService.getMyWallets(), categoryService.getMyCategories()])
      .then(([w, c]) => { setWallets(w); setCategories(c); })
      .catch(() => setError(true));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setKeyword(filters.keyword.trim()), 300);
    return () => clearTimeout(t);
  }, [filters.keyword]);

  const load = useCallback(async () => {
    setData(null);
    setError(false);
    const params: Record<string, string | number> = { page, size: PAGE_SIZE };
    if (keyword) params.keyword = keyword;
    if (filters.walletId) params.walletId = filters.walletId;
    if (filters.categoryId) params.categoryId = filters.categoryId;
    if (filters.startDate) params.startDate = filters.startDate;
    if (filters.endDate) params.endDate = filters.endDate;
    try {
      setData(await transactionService.getTransactions(params));
    } catch {
      setError(true);
    }
  }, [page, keyword, filters.walletId, filters.categoryId, filters.startDate, filters.endDate]);

  useEffect(() => { load(); }, [load]);

  const changeFilters = (f: TxFilters) => {
    setFilters(f);
    setPage(0);
  };

  const canWrite = (walletId: number) => {
    const w = wallets.find((x) => x.id === walletId);
    return !w || canWriteWallet(w);
  };

  const handleDelete = async (tx: Transaction) => {
    if (!window.confirm(`Xóa giao dịch "${tx.description || tx.categoryName}"? Số dư ví sẽ được hoàn lại tương ứng.`)) return;
    try {
      await transactionService.deleteTransaction(tx.id);
      window.dispatchEvent(new Event('reload-notifications'));
      load();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Không xóa được giao dịch. Thử lại sau.');
    }
  };

  const openCreate = () => { setEditData(null); setShowModal(true); };

  const rows = data ? data.content.filter((t) => filters.type === 'ALL' || t.type === filters.type) : [];
  const hasWritableWallet = wallets.some(canWriteWallet);

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="small text-secondary" aria-live="polite">
          {data ? `${data.totalElements} giao dịch` : ' '}
        </div>
        <Button onClick={openCreate} disabled={!hasWritableWallet} className="d-inline-flex align-items-center gap-1"
          title={hasWritableWallet ? undefined : 'Bạn cần ít nhất một ví có quyền ghi'}>
          <Plus size={18} aria-hidden /> Thêm giao dịch
        </Button>
      </div>

      <section className="panel">
        <TransactionFilter value={filters} onChange={changeFilters} wallets={wallets} categories={categories} />

        {error ? (
          <ErrorState onRetry={load} />
        ) : !data ? (
          <LoadingState />
        ) : rows.length === 0 ? (
          JSON.stringify(filters) === JSON.stringify(EMPTY_FILTERS) && data.totalElements === 0 ? (
            <EmptyState
              title="Chưa có giao dịch nào"
              description="Ghi khoản thu hoặc chi đầu tiên, hoặc nhập sao kê ngân hàng."
              action={hasWritableWallet ? <Button size="sm" onClick={openCreate}>Thêm giao dịch</Button> : undefined}
            />
          ) : (
            <EmptyState title="Không có giao dịch khớp bộ lọc" description="Thử nới khoảng ngày hoặc xóa bớt điều kiện lọc." />
          )
        ) : (
          <TransactionList transactions={rows} canWrite={canWrite} onEdit={(tx) => { setEditData(tx); setShowModal(true); }} onDelete={handleDelete} />
        )}

        {data && data.totalPages > 1 && (
          <div className="d-flex align-items-center justify-content-between px-3 py-2 small">
            <span className="text-secondary">
              Trang {data.number + 1}/{data.totalPages}
              {filters.type !== 'ALL' && ' · lọc Thu/Chi áp dụng trong trang đang xem'}
            </span>
            <div className="d-flex gap-1">
              <Button size="sm" variant="outline-secondary" aria-label="Trang trước" disabled={data.number === 0} onClick={() => setPage((p) => p - 1)}>
                <ChevronLeft size={16} aria-hidden />
              </Button>
              <Button size="sm" variant="outline-secondary" aria-label="Trang sau" disabled={data.number + 1 >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                <ChevronRight size={16} aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </section>

      <TransactionModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSuccess={load}
        wallets={wallets}
        categories={categories}
        editData={editData}
      />
    </div>
  );
}
