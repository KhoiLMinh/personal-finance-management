import React from 'react';
import { Settings, CircleDollarSign } from 'lucide-react';
import { formatCurrency } from '../../utils/format';

interface Props {
  transactions: any[];
}

export default function TransactionList({ transactions }: Props) {
  // Hàm gom nhóm giao dịch theo ngày
  const groupedTransactions = transactions.reduce((groups: any, tx: any) => {
    const date = tx.date;
    if (!groups[date]) {
      groups[date] = { transactions: [], total: 0 };
    }
    groups[date].transactions.push(tx);
    // Cộng trừ tổng tiền trong ngày
    groups[date].total += tx.type === 'INCOME' ? tx.amount : -tx.amount;
    return groups;
  }, {});

  // Hàm format thứ, ngày, tháng tiếng Việt
  const formatDateTitle = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('vi-VN', options).format(new Date(dateString));
  };

  if (transactions.length === 0) {
    return <div className="text-center text-muted py-5">Không tìm thấy giao dịch nào.</div>;
  }

  return (
    <div className="d-flex flex-column gap-4">
      {Object.keys(groupedTransactions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()).map(date => {
        const group = groupedTransactions[date];
        return (
          <div key={date} className="rounded-4 overflow-hidden shadow-sm border">
            {/* Header Ngày (Màu xám) */}
            <div className="d-flex justify-content-between align-items-center px-4 py-3" style={{ backgroundColor: '#9ca3af' }}>
              <h6 className="mb-0 fw-bold text-white">{formatDateTitle(date)}</h6>
              <h6 className="mb-0 fw-bold text-white">{formatCurrency(group.total)}</h6>
            </div>
            
            {/* Danh sách Item (Màu sáng) */}
            <div className="bg-white p-2">
              {group.transactions.map((tx: any) => (
                <div key={tx.id} className="d-flex justify-content-between align-items-center p-3 rounded-3 hover-bg-light transition-all mb-1">
                  
                  {/* Cột trái: Icon + Danh mục + Ví */}
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

                  {/* Cột phải: Số tiền + Cài đặt */}
                  <div className="d-flex align-items-center gap-4">
                    <span className={`fw-bold fs-5 ${tx.type === 'INCOME' ? 'text-success' : 'text-dark'}`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </span>
                    <button className="btn btn-light btn-sm rounded-circle p-2 text-muted">
                      <Settings size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}