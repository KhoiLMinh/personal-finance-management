import React from 'react';
import { Card, ProgressBar, Dropdown } from 'react-bootstrap';
import { Settings, Target, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Props {
  goal: any;
  onAddFund: (goalId: number) => void;
  onEdit: (goal: any) => void;
  onDelete: (goalId: number) => void;
}

export default function SavingGoalCard({ goal, onAddFund, onEdit, onDelete }: Props) {
  // Tính toán phần trăm hoàn thành
  const percentage = goal.targetAmount > 0 
    ? Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100)) 
    : 0;
  
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);
  const isCompleted = goal.status === 'COMPLETE' || percentage >= 100;

  return (
    <Card className="border-0 rounded-4 shadow-sm h-100 bg-white" style={{ border: '1px solid var(--color-border)' }}>
      <Card.Body className="p-4 d-flex flex-column">
        {/* Tiêu đề & Cài đặt */}
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
              {isCompleted ? <CheckCircle2 size={24} className="text-success" /> : <Target size={24} className="text-secondary" />}
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-1">{goal.title}</h5>
              <div className="text-muted small">Hạn chót: {new Date(goal.deadline).toLocaleDateString('vi-VN')}</div>
            </div>
          </div>

          <div className="d-flex flex-column align-items-end">
            <Dropdown align="end">
              <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent shadow-none p-1 hide-caret text-muted">
                <Settings size={18} />
              </Dropdown.Toggle>
              <Dropdown.Menu className="shadow border-0 rounded-3">
                <Dropdown.Item onClick={() => onEdit(goal)}>Sửa thông tin</Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item onClick={() => onDelete(goal.id)} className="text-danger">Xóa mục tiêu</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            <span className="fw-bold fs-5" style={{ color: 'var(--color-primary)' }}>{percentage}%</span>
          </div>
        </div>

        {/* Thông tin số tiền */}
        <div className="d-flex justify-content-between text-muted small fw-medium mb-2 mt-auto">
          <span>Đã tích lũy: {formatCurrency(goal.currentAmount)}</span>
          <span>Mục tiêu: {formatCurrency(goal.targetAmount)}</span>
        </div>

        {/* Thanh Tiến Độ */}
        <ProgressBar 
          now={percentage} 
          variant={isCompleted ? "success" : "primary"} 
          className="mb-4 rounded-pill" 
          style={{ height: '8px' }} 
        />

        {/* Footer Card */}
        <div className="d-flex justify-content-between align-items-center pt-2 border-top">
          <span className="text-muted fw-medium small">
            Còn thiếu: <span className="text-dark fw-bold">{formatCurrency(remaining)}</span>
          </span>
          <button 
            onClick={() => onAddFund(goal.id)}
            disabled={isCompleted}
            className={`btn btn-sm rounded-pill px-3 fw-bold ${isCompleted ? 'btn-secondary opacity-50' : 'btn-danger text-white'}`}
            style={!isCompleted ? { backgroundColor: '#ef4444', border: 'none' } : {}}
          >
            {isCompleted ? 'Đã hoàn thành' : '+ Nộp thêm'}
          </button>
        </div>
      </Card.Body>
    </Card>
  );
}