import React, { useEffect, useState } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Plus } from 'lucide-react';
import transactionService from '../services/transactionService';
import walletService from '../services/walletService';
import categoryService from '../services/categoryService';

import MySpinner from '../components/MySpinner';
import TransactionFilter from '../components/transactions/TransactionFilter';
import TransactionList from '../components/transactions/TransactionList';
import TransactionModal from '../components/transactions/TransactionModal';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [wallets, setWallets] = useState([]);
  const [categories, setCategories] = useState([]);
  
  // States cho Filter & Modal
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      // Tải song song cả 3 API cho tối ưu
      const [txRes, walletRes, catRes] = await Promise.all([
        transactionService.getTransactions({ page: 0, size: 100 }), // Lấy 100 dòng mới nhất
        walletService.getMyWallets(),
        categoryService.getMyCategories()
      ]);
      setTransactions(txRes.content); // Backend trả về Page<TransactionDTO>
      setWallets(walletRes);
      setCategories(catRes);
    } catch (error) {
      console.error("Lỗi tải dữ liệu sổ giao dịch: ", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Hàm lọc giao dịch chạy ở Frontend (hoặc bạn có thể sửa để gọi lại API)
  const filteredTransactions = transactions.filter((tx: any) => {
    const matchType = filterType === 'ALL' || tx.type === filterType;
    const matchSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) 
                     || tx.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      
      {/* Header Banner giống hình 2 */}
      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold text-dark mb-1">Sổ nhật ký giao dịch</h3>
            <p className="text-dark mb-0 opacity-75">Quản lý chi tiết toàn bộ dòng tiền vào và ra</p>
          </div>
          <Button 
            className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm d-flex align-items-center"
            style={{ backgroundColor: 'var(--color-primary)' }}
            onClick={() => setShowModal(true)}
          >
            <Plus size={20} className="me-1" /> Thêm giao dịch mới
          </Button>
        </Card.Body>
      </Card>

      {/* Vùng Lọc và Danh Sách */}
      <Card className="border-0 rounded-4 shadow-sm bg-transparent">
        <Card.Body className="p-0">
          <TransactionFilter 
            filterType={filterType} setFilterType={setFilterType} 
            search={search} setSearch={setSearch} 
          />
          <TransactionList transactions={filteredTransactions} />
        </Card.Body>
      </Card>

      {/* Núng gọi Modal */}
      <TransactionModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSuccess={fetchData} // Khi thêm xong tự động reload dữ liệu
        wallets={wallets}
        categories={categories}
      />
      
    </div>
  );
}