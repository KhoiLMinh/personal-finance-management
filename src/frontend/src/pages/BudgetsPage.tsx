import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col } from 'react-bootstrap';
import { Plus } from 'lucide-react';

import budgetService from '../services/budgetService';
import categoryService from '../services/categoryService';
import reportService from '../services/reportService';
import { formatCurrency } from '../utils/format';

import MySpinner from '../components/MySpinner';
import BudgetCard from '../components/budgets/BudgetCard';
import BudgetModal from '../components/budgets/BudgetModal';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [expenseData, setExpenseData] = useState<any[]>([]); // Lưu dữ liệu chi tiêu để map
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const date = new Date();
      const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).toISOString().split('T')[0];
      const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().split('T')[0];

      // GỌI SONG SONG 3 API ĐỂ TỐI ƯU TỐC ĐỘ HIỂN THỊ
      const [budgetsRes, catRes, reportRes] = await Promise.all([
        budgetService.getBudgets({ page: 0, size: 50 }),
        categoryService.getMyCategories(),
        reportService.getOverview(firstDay, lastDay)
      ]);

      setBudgets(budgetsRes.content);
      setCategories(catRes);
      setExpenseData(reportRes.expenseByCategory || []);
    } catch (error) {
      console.error("Lỗi tải ngân sách:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa ngân sách này?')) {
      try {
        await budgetService.deleteBudget(id);
        fetchData(); // reload danh sách
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa!");
      }
    }
  };

  const handleOpenEdit = (budget: any) => {
    setEditData(budget);
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditData(null);
    setShowModal(true);
  };

  // HÀM HELPER: Map (Lấy) tổng chi tiêu từ reportService áp dụng cho ngân sách này
  const getSpentAmount = (categoryId: number) => {
    const expense = expenseData.find((e: any) => e.categoryId === categoryId);
    return expense ? expense.totalAmount : 0;
  };

  // Chỉ hiển thị ngân sách của Tháng hiện tại
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const currentBudgets = budgets.filter(b => b.month === currentMonth && b.year === currentYear);

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      
      {/* Banner Header Ngân sách (Khớp hình 4) */}
      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold text-dark mb-1">Hạn mức Ngân sách Chi tiêu</h3>
            <p className="text-dark mb-0 opacity-75">Giúp bạn kiểm soát không tiêu vượt quá dự định</p>
          </div>
          <Button 
            className="fw-bold px-4 py-2 rounded-pill border-0 shadow-sm d-flex align-items-center text-white"
            style={{ backgroundColor: '#29b6f6' }}
            onClick={handleOpenCreate}
          >
            <Plus size={20} className="me-1" /> Tạo thêm ngân sách
          </Button>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {currentBudgets.length > 0 ? currentBudgets.map((budget: any) => (
          <Col md={6} lg={6} xl={6} key={budget.id}>
            <BudgetCard 
              budget={budget} 
              spentAmount={getSpentAmount(budget.categoryId)}
              onEdit={handleOpenEdit}
              onDelete={handleDelete}
            />
          </Col>
        )) : (
          <div className="text-center text-muted py-5 w-100 mt-4">
            Tháng này bạn chưa thiết lập ngân sách nào. Hãy tạo mới để kiểm soát chi tiêu!
          </div>
        )}
      </Row>

      <BudgetModal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        onSuccess={fetchData} 
        editData={editData} 
        categories={categories}
      />

    </div>
  );
}