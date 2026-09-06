import React from 'react';
import { Card, ProgressBar, Dropdown } from 'react-bootstrap';
import { Settings, PieChart, AlertTriangle, Edit, History, Trash2 } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Props {
  budget: any;
  spentAmount: number;
  onEdit: (budget: any) => void;
  onDelete: (id: number) => void;
  onHistory: (id: number) => void; 
}

export default function BudgetCard({ budget, spentAmount, onEdit, onDelete, onHistory }: Props) {
  const remaining = Math.max(0, budget.limitAmount - spentAmount);
  const percentage = Math.min(100, Math.round((spentAmount / budget.limitAmount) * 100));
  
  let progressVariant = "primary";
  if (percentage >= 100) progressVariant = "danger";
  else if (percentage >= (budget.warningPercent || 80)) progressVariant = "warning";

  return (
    <Card className="border-0 rounded-4 shadow-sm h-100 bg-white" style={{ border: '1px solid var(--color-border)' }}>
      <Card.Body className="p-4 d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
               <PieChart size={24} className="text-secondary" />
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-1">{budget.categoryName}</h5>
              <div className="text-muted small">Tháng {budget.month}/{budget.year}</div>
            </div>
          </div>
          
          <Dropdown align="end">
            <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent shadow-none p-1 hide-caret text-muted">
              <Settings size={18} />
            </Dropdown.Toggle>
            <Dropdown.Menu className="shadow border-0 rounded-3">
              <Dropdown.Item onClick={() => onEdit(budget)} className="d-flex align-items-center"><Edit size={16} className="me-2 text-primary"/>Sửa hạn mức</Dropdown.Item>
              <Dropdown.Item onClick={() => onHistory(budget.id)} className="d-flex align-items-center"><History size={16} className="me-2 text-info"/>Xem lịch sử đối soát</Dropdown.Item>
              <Dropdown.Divider />
              <Dropdown.Item onClick={() => onDelete(budget.id)} className="text-danger d-flex align-items-center"><Trash2 size={16} className="me-2"/>Xóa ngân sách</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>

        <div className="d-flex justify-content-between align-items-end mb-2 mt-auto">
          <div>
            <span className="text-muted small">Còn lại: </span>
            <span className={`fw-bold ${remaining === 0 ? 'text-danger' : 'text-dark'}`}>
              {formatCurrency(remaining)}
            </span>
          </div>
          <div className="text-end">
            <div className="fw-bold text-dark">{formatCurrency(spentAmount)}</div>
            <div className="text-muted small">/ {formatCurrency(budget.limitAmount)}</div>
          </div>
        </div>

        <ProgressBar now={percentage} variant={progressVariant} className="mb-2 rounded-pill" style={{ height: '8px' }} />
        
        {percentage >= (budget.warningPercent || 80) && (
          <div className={`small fw-medium mt-2 d-flex align-items-center ${percentage >= 100 ? 'text-danger' : 'text-warning'}`}>
            <AlertTriangle size={14} className="me-1" />
            {percentage >= 100 ? 'Đã vượt ngân sách!' : `Đã sử dụng ${percentage}% ngân sách`}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}