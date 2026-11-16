import { useCallback, useEffect, useState } from 'react';
import { Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

import walletService from '../services/walletService';
import savingGoalService from '../services/savingGoalService';
import { formatCurrency } from '../utils/format';
import { isOwnWallet, type Wallet } from '../utils/wallet';
import type { SavingGoal } from '../types/finance';

import WalletCard from '../components/wallets/WalletCard';
import WalletModal from '../components/wallets/WalletModal';
import ShareWalletModal from '../components/wallets/ShareWalletModal';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageState';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[] | null>(null);
  const [goals, setGoals] = useState<SavingGoal[]>([]);
  const [error, setError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<Wallet | null>(null);
  const [shareWallet, setShareWallet] = useState<Wallet | null>(null);

  const load = useCallback(async () => {
    setWallets(null);
    setError(false);
    try {
      const [w, g] = await Promise.all([walletService.getMyWallets(), savingGoalService.getSavingGoals({ page: 0, size: 200 })]);
      setWallets(w);
      setGoals(g.content);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async (wallet: Wallet) => {
    if (!window.confirm(`Xóa ví "${wallet.name}"? Toàn bộ giao dịch của ví này cũng bị xóa và không khôi phục được.`)) return;
    try {
      await walletService.deleteWallet(wallet.id);
      load();
    } catch (e: any) {
      alert(e.response?.data?.error?.message || 'Không xóa được ví. Thử lại sau.');
    }
  };

  const openCreate = () => { setEditData(null); setShowModal(true); };

  const own = (wallets ?? []).filter(isOwnWallet);
  const shared = (wallets ?? []).filter((w) => !isOwnWallet(w));
  const sum = (ws: Wallet[]) => ws.reduce((s, w) => s + Number(w.balance), 0);
  const saving = goals.filter((g) => g.status !== 'CANCELLED').reduce((s, g) => s + Number(g.currentAmount), 0);

  const grid = (items: Wallet[]) => (
    <Row className="g-3">
      {items.map((w) => (
        <Col sm={6} xl={4} key={w.id}>
          <WalletCard wallet={w} onEdit={(x) => { setEditData(x); setShowModal(true); }} onDelete={handleDelete} onShare={setShareWallet} />
        </Col>
      ))}
    </Row>
  );

  return (
    <div className="page">
      <div className="page-toolbar">
        <div />
        <Button onClick={openCreate} className="d-inline-flex align-items-center gap-1">
          <Plus size={18} aria-hidden /> Tạo ví
        </Button>
      </div>

      {error ? (
        <div className="panel"><ErrorState onRetry={load} /></div>
      ) : wallets === null ? (
        <div className="panel"><LoadingState /></div>
      ) : wallets.length === 0 ? (
        <div className="panel">
          <EmptyState title="Bạn chưa có ví nào" description="Tạo ví cho tiền mặt, tài khoản ngân hàng hoặc thẻ để bắt đầu ghi giao dịch."
            action={<Button size="sm" onClick={openCreate}>Tạo ví đầu tiên</Button>} />
        </div>
      ) : (
        <>
          <section className="panel mb-3">
            <div className="panel-body d-flex flex-wrap gap-4">
              <div>
                <div className="small text-secondary">Ví của bạn · {own.length} ví</div>
                <div className="num fs-4 fw-semibold">{formatCurrency(sum(own))}</div>
              </div>
              {shared.length > 0 && (
                <div>
                  <div className="small text-secondary">Được chia sẻ · {shared.length} ví</div>
                  <div className="num fs-4 fw-semibold">{formatCurrency(sum(shared))}</div>
                </div>
              )}
              <div>
                <div className="small text-secondary">Đã để dành cho mục tiêu</div>
                <Link to="/saving-goals" className="num fs-4 fw-semibold text-income text-decoration-none">{formatCurrency(saving)}</Link>
              </div>
            </div>
          </section>

          <h2 className="h6 fw-semibold mb-2">Ví của bạn</h2>
          {own.length > 0 ? grid(own) : <p className="small text-secondary">Bạn chưa tạo ví riêng nào.</p>}

          {shared.length > 0 && (
            <>
              <h2 className="h6 fw-semibold mt-4 mb-2">Được chia sẻ với bạn</h2>
              {grid(shared)}
            </>
          )}
        </>
      )}

      <WalletModal show={showModal} onHide={() => setShowModal(false)} onSuccess={load} editData={editData} />
      <ShareWalletModal show={shareWallet !== null} onHide={() => setShareWallet(null)} wallet={shareWallet} />
    </div>
  );
}
