import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Button } from 'react-bootstrap';
import { Plus } from 'lucide-react';

import walletService from '../services/walletService';
import savingGoalService from '../services/savingGoalService';
import { formatCurrency } from '../utils/format';

import MySpinner from '../components/MySpinner';
import WalletCard from '../components/wallets/WalletCard';
import WalletModal from '../components/wallets/WalletModal';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [savingGoals, setSavingGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Tải song song cả 2 API để hiển thị số dư tổng cho cả 2 Card Header
      const [walletRes, savingRes] = await Promise.all([
        walletService.getMyWallets(),
        savingGoalService.getSavingGoals({ page: 0, size: 50 })
      ]);
      setWallets(walletRes);
      setSavingGoals(savingRes.content);
    } catch (error) {
      console.error("Lỗi tải trang Ví:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Cảnh báo: Nếu bạn xóa ví này, toàn bộ lịch sử giao dịch liên quan cũng sẽ bị xóa. Bạn chắc chứ?')) {
      try {
        await walletService.deleteWallet(id);
        fetchData(); // Load lại data sau khi xoá
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa ví!");
      }
    }
  };

  const handleOpenEdit = (wallet: any) => {
    setEditData(wallet);
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditData(null);
    setShowModal(true);
  };

  // Tính toán Tổng cho các Banner ở đầu trang
  const totalWalletBalance = wallets.reduce((sum, w) => sum + w.balance, 0);
  const totalSavingBalance = savingGoals.reduce((sum, s) => sum + s.currentAmount, 0);

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      
      {/* 2 Banner Tổng ở trên cùng (Khớp hình 5.png) */}
      <Card className="border-0 rounded-4 mb-3 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold text-dark mb-1">Ví Hiện Có</h4>
            <div className="text-dark opacity-75 small">Bao gồm {wallets.length} tài khoản đang hoạt động</div>
          </div>
          <h2 className="fw-bolder mb-0 text-dark" style={{ fontSize: '2.5rem' }}>
            {formatCurrency(totalWalletBalance)}
          </h2>
        </Card.Body>
      </Card>

      <Card className="border-0 rounded-4 mb-5 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex justify-content-between align-items-center">
          <div>
            <h4 className="fw-bold text-dark mb-1">Tổng tiền Tiết kiệm</h4>
            <div className="text-dark opacity-75 small">Bao gồm {savingGoals.length} sổ tiết kiệm đang hoạt động</div>
          </div>
          <h2 className="fw-bolder mb-0 text-dark" style={{ fontSize: '2.5rem' }}>
            {formatCurrency(totalSavingBalance)}
          </h2>
        </Card.Body>
      </Card>

      <h5 className="fw-bold text-dark mb-4">Danh sách Ví & Tài khoản ngân hàng</h5>

      {/* Lưới chứa các Thẻ Ví */}
      <Row className="g-4 mb-4">
        {wallets.map((wallet: any) => (
          <Col md={6} lg={6} key={wallet.id}>
            <WalletCard 
              wallet={wallet} 
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      {/* Nút Tạo Ví Mới nằm ở giữa dưới cùng */}
      <div className="text-center mt-5 mb-3">
        <Button 
          className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm text-white d-inline-flex align-items-center"
          style={{ backgroundColor: 'var(--color-primary)' }}
          onClick={handleOpenCreate}
        >
          <Plus size={20} className="me-1" /> Tạo ví
        </Button>
      </div>

      <WalletModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSuccess={fetchData} 
        editData={editData} 
      />

    </div>
  );
}