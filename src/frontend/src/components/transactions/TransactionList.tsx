import React, { useState } from 'react';
import { Settings, CircleDollarSign, Edit, Trash2, History } from 'lucide-react';
import { Dropdown } from 'react-bootstrap';
import { formatCurrency } from '../../utils/format';
import TransactionHistoryModal from './TransactionHistoryModal';

interface Props {
  transactions: any[];
  onEdit: (tx: any) => void;
  onDelete: (id: number) => void;
}

export default function TransactionList({ transactions, onEdit, onDelete }: Props) {
  const groupedTransactions = transactions.reduce((groups: any, tx: any) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = { transactions: [], total: 0 };
    }
    groups[date].transactions.push(tx);
    groups[date].total += tx.type === 'INCOME' ? tx.amount : -tx.amount;
    return groups;
  }, {});

  const formatDateTitle = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('vi-VN', options).format(new Date(dateString));
  };

  const [historyTxId, setHistoryTxId] = useState<number | null>(null);

  if (transactions.length === 0) {
    return <div className="text-center text-muted py-5">Không tìm thấy giao dịch nào.</div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      {Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => {
        const group = groupedTransactions[date];
        return (
          <div key={date} className="rounded-4 shadow-sm border">
            <div className="d-flex justify-content-between align-items-center px-4 py-3 bg-primary rounded-top-4">
              <h6 className="mb-0 fw-bold text-white">{formatDateTitle(date)}</h6>
              <h6 className="mb-0 fw-bold text-white">{formatCurrency(group.total)}</h6>
            </div>
            
            <div className="bg-white p-2">
              {group.transactions.map((tx: any) => (
                <div key={tx.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 hover-bg-light transition-all mb-1">
                  
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-light rounded-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                      <CircleDollarSign size={24} className="text-secondary" />
                    </div>
                    <div>
                      <div className="fw-bold text-dark">{tx.categoryName}</div>
                      <div className="d-flex align-items-center gap-2 mt-1">
                        <span className="text-muted small text-truncate" style={{ maxWidth: '150px' }}>{tx.description || 'Không có ghi chú'}</span>
                        <span className="badge rounded-pill bg-secondary bg-opacity-25 text-dark fw-medium px-2 py-1">
                          {tx.walletName}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex align-items-center gap-4">
                    <span className={`fw-bold fs-5 ${tx.type === 'INCOME' ? 'text-success' : 'text-dark'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    
                    <Dropdown align="end">
                      <Dropdown.Toggle variant="light" size="sm" className="border-0 bg-transparent shadow-none p-1 hide-caret text-muted rounded-circle">
                        <Settings size={18} />
                      </Dropdown.Toggle>
                     <Dropdown.Menu className="shadow-lg border-0 rounded-3" style={{ zIndex: 1050 }}>
                        <Dropdown.Item onClick={() => onEdit(tx)} className="d-flex align-items-center">
                          <Edit size={16} className="me-2 text-primary" /> Sửa giao dịch
                        </Dropdown.Item>
                        
                        <Dropdown.Item onClick={() => setHistoryTxId(tx.id)} className="d-flex align-items-center">
                          <History size={16} className="me-2 text-info" /> Xem lịch sử
                        </Dropdown.Item>

                        <Dropdown.Divider />
                        <Dropdown.Item onClick={() => onDelete(tx.id)} className="text-danger d-flex align-items-center">
                          <Trash2 size={16} className="me-2" /> Xóa giao dịch
                        </Dropdown.Item>
                      </Dropdown.Menu>
                    </Dropdown>

                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {historyTxId && (
        <TransactionHistoryModal 
          transactionId={historyTxId} 
          onClose={() => setHistoryTxId(null)} 
        />
      )}
    </div>
  );
}