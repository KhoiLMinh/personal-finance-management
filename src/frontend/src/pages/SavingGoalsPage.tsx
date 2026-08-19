import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import savingGoalService from '../services/savingGoalService';
import walletService from '../services/walletService';
import { formatCurrency } from '../utils/format';

import MySpinner from '../components/MySpinner';
import SavingGoalCard from '../components/saving-goals/SavingGoalCard';
import CreateGoalModal from '../components/saving-goals/CreateGoalModal';
import AddFundModal from '../components/saving-goals/AddFundModal';

export default function SavingGoalsPage() {
  const [goals, setGoals] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);

  // States quản lý Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editData, setEditData] = useState<any>(null); // Lưu data khi bấm nút Sửa
  
  const [showAddFundModal, setShowAddFundModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [goalsRes, walletsRes] = await Promise.all([
        savingGoalService.getSavingGoals({ page: 0, size: 50 }),
        walletService.getMyWallets()
      ]);
      setGoals(goalsRes.content);
      setWallets(walletsRes);
    } catch (error) {
      console.error("Lỗi tải sổ tiết kiệm:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa mục tiêu này? Dữ liệu không thể khôi phục.')) {
      try {
        await savingGoalService.deleteGoal(id);
        fetchData(); // reload list
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa!");
      }
    }
  };

  const handleOpenEdit = (goal: any) => {
    setEditData(goal);
    setShowCreateModal(true);
  };

  const handleOpenAddFund = (goalId: number) => {
    setSelectedGoalId(goalId);
    setShowAddFundModal(true);
  };

  // Tính tổng tiền cần tiết kiệm (Dành cho banner Header)
  const totalTarget = goals.reduce((sum, g: any) => sum + g.targetAmount, 0);

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      
      {/* Banner Sổ tiết kiệm (Hình 3) */}
      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold text-dark mb-1">Sổ tiết kiệm</h3>
            <p className="text-dark mb-0 opacity-75">
              Tổng tiền cần tiết kiệm: <span className="fw-bold">{formatCurrency(totalTarget)}</span>
            </p>
          </div>
          <Button 
            className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm d-flex align-items-center text-white"
            style={{ backgroundColor: '#29b6f6' }}
            onClick={() => { setEditData(null); setShowCreateModal(true); }}
          >
            <Plus size={20} className="me-1" /> Tạo thêm mục tiêu
          </Button>
        </Card.Body>
      </Card>

      {/* Tabs giả lập (Trang trí cho giống thiết kế) */}
      <div className="d-flex gap-2 mb-4">
        <div className="px-4 py-2 bg-info text-white fw-bold rounded-pill shadow-sm" style={{ backgroundColor: '#29b6f6' }}>
          Mục tiêu tiết kiệm
        </div>
        <div className="px-4 py-2 bg-secondary bg-opacity-25 text-muted fw-medium rounded-pill border">
          Tính năng thêm
        </div>
      </div>

      {/* Lưới chứa các Thẻ Sổ tiết kiệm */}
      <Row className="g-4">
        {goals.map((goal: any) => (
          <Col md={6} lg={6} xl={4} key={goal.id}>
            <SavingGoalCard 
              goal={goal} 
              onAddFund={handleOpenAddFund}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </Col>
        ))}
      </Row>

      {/* Các Modals */}
      <CreateGoalModal 
        show={showCreateModal} 
        onHide={() => setShowCreateModal(false)} 
        onSuccess={fetchData} 
        editData={editData} 
      />

      <AddFundModal 
        show={showAddFundModal} 
        onHide={() => setShowAddFundModal(false)} 
        onSuccess={fetchData} 
        goalId={selectedGoalId} 
        wallets={wallets} 
      />

    </div>
  );
}