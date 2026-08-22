import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import budgetService from '../../services/budgetService';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  editData?: any;
  categories: any[];
}
//FR-09
export default function BudgetModal({ show, onHide, onSuccess, editData, categories }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    categoryId: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    limitAmount: '',
    warningPercent: 80
  });

  useEffect(() => {
    if (show) {
      if (editData) {
        setFormData({
          categoryId: editData.categoryId.toString(),
          month: editData.month,
          year: editData.year,
          limitAmount: editData.limitAmount.toString(),
          warningPercent: editData.warningPercent || 80
        });
      } else {
        setFormData({
          categoryId: categories.find((c: any) => c.type === 'EXPENSE' && !c.hidden)?.id?.toString() || '',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          limitAmount: '',
          warningPercent: 80
        });
      }
    }
  }, [show, editData, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        categoryId: Number(formData.categoryId),
        month: Number(formData.month),
        year: Number(formData.year),
        limitAmount: Number(formData.limitAmount),
        warningPercent: Number(formData.warningPercent)
      };

      if (editData) {
        await budgetService.updateBudget(editData.id, {
          limitAmount: payload.limitAmount,
          warningPercent: payload.warningPercent
        });
      } else {
        await budgetService.createBudget(payload);
      }
      onSuccess();
      onHide();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi lưu ngân sách!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-4">{editData ? 'Sửa ngân sách' : '+ Tạo ngân sách mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-3">
        <Form onSubmit={handleSubmit}>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Danh mục chi tiêu</Form.Label>
            <Form.Select size="lg" required className="bg-light border-0" 
              value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
              disabled={!!editData}
            >
              <option value="">-- Chọn danh mục --</option>
              {categories.filter(c => c.type === 'EXPENSE' && !c.hidden).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          {!editData && (
            <Row className="mb-3">
              <Col>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Tháng</Form.Label>
                  <Form.Control size="lg" type="number" min="1" max="12" required className="bg-light border-0" 
                    value={formData.month} onChange={(e) => setFormData({...formData, month: Number(e.target.value)})} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Năm</Form.Label>
                  <Form.Control size="lg" type="number" min="2000" required className="bg-light border-0" 
                    value={formData.year} onChange={(e) => setFormData({...formData, year: Number(e.target.value)})} />
                </Form.Group>
              </Col>
            </Row>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Hạn mức (VNĐ)</Form.Label>
            <Form.Control size="lg" type="number" min="1" required className="bg-light border-0" 
              value={formData.limitAmount} onChange={(e) => setFormData({...formData, limitAmount: e.target.value})} />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium small">Cảnh báo khi đạt mức (%)</Form.Label>
            <Form.Control size="lg" type="number" min="1" max="100" required className="bg-light border-0" 
              value={formData.warningPercent} onChange={(e) => setFormData({...formData, warningPercent: Number(e.target.value)})} />
          </Form.Group>

          <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0" disabled={loading} style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? <Spinner size="sm" className="me-2"/> : null} Lưu ngân sách
          </Button>

        </Form>
      </Modal.Body>
    </Modal>
  );
}