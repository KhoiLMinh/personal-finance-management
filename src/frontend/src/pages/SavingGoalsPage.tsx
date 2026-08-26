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

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  
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
        fetchData();
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

  const totalTarget = goals.reduce((sum, g: any) => sum + g.targetAmount, 0);

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary-darker)' }}>Sổ tiết kiệm</h3>
            <p className="text-muted mb-0">
              Tổng tiền cần tiết kiệm: <span className="fw-bold">{formatCurrency(totalTarget)}</span>
            </p>
          </div>
          <Button 
            className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm d-flex align-items-center text-white"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onClick={() => { setEditData(null); setShowCreateModal(true); }}
          >
            <Plus size={20} className="me-1" /> Tạo thêm mục tiêu
          </Button>
        </Card.Body>
      </Card>

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