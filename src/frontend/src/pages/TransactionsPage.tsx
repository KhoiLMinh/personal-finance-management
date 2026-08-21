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
  
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, walletRes, catRes] = await Promise.all([
        transactionService.getTransactions({ page: 0, size: 100 }),
        walletService.getMyWallets(),
        categoryService.getMyCategories()
      ]);
      setTransactions(txRes.content);
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

  const filteredTransactions = transactions.filter((tx: any) => {
    const matchType = filterType === 'ALL' || tx.type === filterType;
    const matchSearch = tx.description?.toLowerCase().includes(search.toLowerCase()) 
                     || tx.categoryName.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary-darker)' }}>Sổ nhật ký giao dịch</h3>
            <p className="text-muted mb-0">Quản lý chi tiết toàn bộ dòng tiền vào và ra</p>
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

      <Card className="border-0 rounded-4 shadow-soft">
        <Card.Body className="p-3">
          <TransactionFilter 
            filterType={filterType} setFilterType={setFilterType} 
            search={search} setSearch={setSearch} 
          />
          <TransactionList transactions={filteredTransactions} />
        </Card.Body>
      </Card>

      <TransactionModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSuccess={fetchData}
        wallets={wallets}
        categories={categories}
      />
      
    </div>
  );
}