import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import savingGoalService from '../../services/savingGoalService';
import { formatCurrency, toLocalISODate } from '../../utils/format';
import type { SavingGoal } from '../../types/finance';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  editData?: SavingGoal | null;
}

export default function CreateGoalModal({ show, onHide, onSuccess, editData }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ title: '', targetAmount: '', deadline: '' });

  useEffect(() => {
    if (!show) return;
    setError('');
    setFormData(editData
      ? { title: editData.title, targetAmount: String(editData.targetAmount), deadline: editData.deadline }
      : { title: '', targetAmount: '', deadline: toLocalISODate() });
  }, [show, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const payload = { ...formData, targetAmount: Number(formData.targetAmount) };
      if (editData) await savingGoalService.updateGoal(editData.id, payload);
      else await savingGoalService.createGoal(payload);
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Không lưu được mục tiêu. Kiểm tra lại thông tin rồi thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">{editData ? 'Sửa mục tiêu' : 'Tạo mục tiêu tiết kiệm'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}
          <Form.Group className="mb-3" controlId="goal-title">
            <Form.Label className="small text-secondary">Tên mục tiêu</Form.Label>
            <Form.Control required maxLength={100} placeholder="VD: Mua xe, Quỹ dự phòng" value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="goal-target">
            <Form.Label className="small text-secondary">Số tiền cần đạt (đ)</Form.Label>
            <Form.Control type="number" inputMode="numeric" min="1" step="1" required className="num" value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })} />
            {editData && <Form.Text>Đã để dành {formatCurrency(editData.currentAmount)}.</Form.Text>}
          </Form.Group>
          <Form.Group controlId="goal-deadline">
            <Form.Label className="small text-secondary">Hạn chót</Form.Label>
            {/* backend requires @FutureOrPresent */}
            <Form.Control type="date" required min={toLocalISODate()} value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner size="sm" className="me-2" />}{editData ? 'Lưu thay đổi' : 'Tạo mục tiêu'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
