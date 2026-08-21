import React from 'react';
import { Card, Dropdown } from 'react-bootstrap';
import { Settings, Landmark, Wallet, CreditCard, Share2  } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Props {
  wallet: any;
  onEdit: (wallet: any) => void;
  onDelete: (id: number) => void;
  onShare: (wallet: any) => void;
}

export default function WalletCard({ wallet, onEdit, onDelete, onShare }: Props) {

  const renderIcon = () => {
    switch (wallet.icon) {
      case 'Bank': return <Landmark size={28} className="text-secondary" />;
      case 'CreditCard': return <CreditCard size={28} className="text-secondary" />;
      default: return <Wallet size={28} className="text-secondary" />;
    }
  };

  return (
    <Card className="border-0 rounded-4 shadow-sm h-100" style={{ backgroundColor: '#cfd8dc' }}>
      <Card.Body className="p-4 d-flex flex-column justify-content-between">
        <div className="d-flex justify-content-between align-items-start mb-4">
          <div className="d-flex gap-3 align-items-center">

            <div 
              className="bg-light rounded-3 d-flex align-items-center justify-content-center" 
              style={{ width: 60, height: 60, borderLeft: `4px solid ${wallet.color || '#3b82f6'}` }}
            >
              {renderIcon()}
            </div>
            <div>
              <h4 className="fw-bold text-dark mb-1">{wallet.name}</h4>
              <span className="text-muted small">Tài khoản chính</span>
            </div>
          </div>

          <Dropdown align="end">
            <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent shadow-none p-1 hide-caret text-muted">
              <Settings size={20} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0 rounded-3">
              <Dropdown.Item onClick={() => onEdit(wallet)}>Sửa thông tin</Dropdown.Item>
              <Dropdown.Item onClick={() => onShare(wallet)}>
                <Share2 size={16} className="me-2"/> Chia sẻ ví
              </Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => onDelete(wallet.id)} className="text-danger">Xóa ví</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div>
          <div className="text-muted small mb-1">Số dư khả dụng</div>
          <h3 className="fw-bolder text-dark mb-0">{formatCurrency(wallet.balance)}</h3>
        </div>
      </Card.Body>
    </Card>
  );
}