import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import savingGoalService from '../../services/savingGoalService';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  editData?: any; // Nếu có truyền editData vào thì là chế độ Sửa
}

export default function CreateGoalModal({ show, onHide, onSuccess, editData }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', targetAmount: '', deadline: '' });

  useEffect(() => {
    if (show) {
      if (editData) {
        setFormData({
          title: editData.title,
          targetAmount: editData.targetAmount.toString(),
          deadline: editData.deadline
        });
      } else {
        setFormData({ title: '', targetAmount: '', deadline: new Date().toISOString().split('T')[0] });
      }
    }
  }, [show, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...formData, targetAmount: Number(formData.targetAmount) };
      if (editData) {
        await savingGoalService.updateGoal(editData.id, payload);
      } else {
        await savingGoalService.createGoal(payload);
      }
      onSuccess();
      onHide();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi lưu mục tiêu!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-4">{editData ? 'Sửa mục tiêu' : '+ Tạo mục tiêu mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Tên mục tiêu (VD: Mua xe, Đám cưới)</Form.Label>
            <Form.Control size="lg" type="text" required className="bg-light border-0" 
              value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Số tiền cần đạt (VNĐ)</Form.Label>
            <Form.Control size="lg" type="number" min="1" required className="bg-light border-0" 
              value={formData.targetAmount} onChange={(e) => setFormData({...formData, targetAmount: e.target.value})} />
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium small">Hạn chót</Form.Label>
            <Form.Control size="lg" type="date" required className="bg-light border-0" 
              value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
          </Form.Group>
          <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0" disabled={loading}>
            {loading ? <Spinner size="sm" className="me-2"/> : null} Lưu mục tiêu
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}