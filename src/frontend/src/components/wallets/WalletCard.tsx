import { Button } from 'react-bootstrap';
import { Landmark, Wallet as WalletIcon, CreditCard, Pencil, Share2, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';
import { isOwnWallet, type Wallet } from '../../utils/wallet';

interface Props {
  wallet: Wallet;
  onEdit: (wallet: Wallet) => void;
  onDelete: (wallet: Wallet) => void;
  onShare: (wallet: Wallet) => void;
}

const KIND: Record<string, { label: string; Icon: typeof WalletIcon }> = {
  Bank: { label: 'Tài khoản ngân hàng', Icon: Landmark },
  CreditCard: { label: 'Thẻ', Icon: CreditCard },
  Wallet: { label: 'Tiền mặt / ví', Icon: WalletIcon },
};

export default function WalletCard({ wallet, onEdit, onDelete, onShare }: Props) {
  const { label, Icon } = KIND[wallet.icon ?? 'Wallet'] ?? KIND.Wallet;
  const own = isOwnWallet(wallet);
  const accent = wallet.color || 'var(--brand)';

  return (
    <article className="panel h-100 d-flex flex-column" style={{ borderTop: `3px solid ${accent}` }}>
      <div className="panel-body d-flex flex-column gap-3 flex-grow-1">
        <div className="d-flex align-items-start gap-3">
          <span className="d-inline-flex align-items-center justify-content-center rounded flex-shrink-0"
            style={{ width: 40, height: 40, background: 'var(--canvas)', color: accent }} aria-hidden>
            <Icon size={20} />
          </span>
          <div className="flex-grow-1" style={{ minWidth: 0 }}>
            <h3 className="h6 fw-semibold mb-0 text-truncate">{wallet.name}</h3>
            <div className="small text-secondary">{label}</div>
          </div>
          {!own && (
            <span className={`status-pill ${wallet.myPermission === 'EDIT' ? 'warning' : 'neutral'}`}>
              {wallet.myPermission === 'EDIT' ? 'Chỉnh sửa' : 'Chỉ xem'}
            </span>
          )}
        </div>

        <div className="mt-auto">
          <div className="small text-secondary">Số dư</div>
          <div className={`num fw-semibold fs-4 ${wallet.balance < 0 ? 'text-danger-strong' : ''}`}>{formatCurrency(wallet.balance)}</div>
        </div>
      </div>

      {own && (
        <div className="d-flex border-top">
          <Button variant="link" size="sm" className="flex-fill text-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2" onClick={() => onEdit(wallet)}>
            <Pencil size={14} aria-hidden /> Sửa
          </Button>
          <Button variant="link" size="sm" className="flex-fill text-secondary text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 border-start" onClick={() => onShare(wallet)}>
            <Share2 size={14} aria-hidden /> Chia sẻ
          </Button>
          <Button variant="link" size="sm" className="flex-fill text-danger-strong text-decoration-none d-inline-flex align-items-center justify-content-center gap-1 py-2 border-start" onClick={() => onDelete(wallet)}>
            <Trash2 size={14} aria-hidden /> Xóa
          </Button>
        </div>
      )}
    </article>
  );
}
