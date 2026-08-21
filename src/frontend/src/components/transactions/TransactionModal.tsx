import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Row, Col, Spinner } from 'react-bootstrap';
import transactionService from '../../services/transactionService';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  wallets: any[];
  categories: any[];
}

export default function TransactionModal({ show, onHide, onSuccess, wallets, categories }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    categoryId: '',
    walletId: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  useEffect(() => {
    if (show) {
      setFormData(prev => ({
        ...prev,
        categoryId: categories.length > 0 ? categories[0].id : '',
        walletId: wallets.length > 0 ? wallets[0].id : '',
        amount: '',
        description: ''
      }));
    }
  }, [show, categories, wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await transactionService.createTransaction({
        ...formData,
        amount: Number(formData.amount),
        categoryId: Number(formData.categoryId),
        walletId: Number(formData.walletId)
      });
      onSuccess();
      onHide();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi khi lưu giao dịch!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-4">+ Thêm giao dịch mới</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-3">
        <Form onSubmit={handleSubmit}>
          
          <div className="mb-4">
            <Form.Label className="text-muted fw-medium small mb-2">Loại giao dịch</Form.Label>
            <div className="d-flex gap-3">
              <Button 
                variant={formData.type === 'INCOME' ? 'info' : 'light'} 
                className={`rounded-pill px-4 fw-medium ${formData.type === 'INCOME' ? 'text-white' : 'text-muted border'}`}
                onClick={() => setFormData({...formData, type: 'INCOME'})}
                style={formData.type === 'INCOME' ? { backgroundColor: 'var(--color-primary)' } : {}}
              >Khoản thu (+)</Button>
              <Button 
                variant={formData.type === 'EXPENSE' ? 'info' : 'light'} 
                className={`rounded-pill px-4 fw-medium ${formData.type === 'EXPENSE' ? 'text-white' : 'text-muted border'}`}
                onClick={() => setFormData({...formData, type: 'EXPENSE'})}
                style={formData.type === 'EXPENSE' ? { backgroundColor: 'var(--color-primary)' } : {}}
              >Khoản chi (-)</Button>
            </div>
          </div>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Số tiền (VNĐ)</Form.Label>
            <Form.Control size="lg" type="number" min="1" required className="bg-light border-0" 
              value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Danh mục</Form.Label>
            <Form.Select size="lg" className="bg-light border-0" required
              value={formData.categoryId} onChange={(e) => setFormData({...formData, categoryId: e.target.value})}>
              {categories.filter(c => c.type === formData.type && !c.hidden).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Ví thanh toán</Form.Label>
            <Form.Select size="lg" className="bg-light border-0" required
              value={formData.walletId} onChange={(e) => setFormData({...formData, walletId: e.target.value})}>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} - Số dư: {w.balance.toLocaleString('vi-VN')}đ</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-medium small">Ngày giao dịch</Form.Label>
                <Form.Control size="lg" type="date" required className="bg-light border-0"
                  value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-medium small">Ghi chú</Form.Label>
                <Form.Control size="lg" type="text" className="bg-light border-0" placeholder="Tùy chọn..."
                  value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0" disabled={loading} style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? <Spinner size="sm" className="me-2"/> : null}
            Lưu giao dịch
          </Button>

        </Form>
      </Modal.Body>
    </Modal>
  );
}