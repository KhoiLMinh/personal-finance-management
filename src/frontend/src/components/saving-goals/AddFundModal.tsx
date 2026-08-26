import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner } from 'react-bootstrap';
import savingGoalService from '../../services/savingGoalService';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  goalId: number | null;
  wallets: any[];
}
//FR-10
export default function AddFundModal({ show, onHide, onSuccess, goalId, wallets }: Props) {
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [walletId, setWalletId] = useState('');

  useEffect(() => {
    if (show) {
      setAmount('');
      setWalletId(wallets.length > 0 ? wallets[0].id : '');
    }
  }, [show, wallets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalId) return;
    setLoading(true);
    try {
      await savingGoalService.addFunds(goalId, { amount: Number(amount), walletId: Number(walletId) });
      onSuccess();
      onHide();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi khi nộp tiền!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5">Nộp tiền vào Tiết kiệm</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-3">
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Trích tiền từ Ví</Form.Label>
            <Form.Select className="bg-light border-0" required
              value={walletId} onChange={(e) => setWalletId(e.target.value)}>
              <option value="">-- Chọn ví --</option>
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name} (Số dư: {w.balance.toLocaleString('vi-VN')} đ)</option>
              ))}
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium small">Số tiền nộp (VNĐ)</Form.Label>
            <Form.Control type="number" min="1" required className="bg-light border-0" 
              value={amount} onChange={(e) => setAmount(e.target.value)} />
          </Form.Group>
          <Button variant="danger" type="submit" className="w-100 py-2 fw-bold rounded-pill border-0" disabled={loading}>
            {loading ? <Spinner size="sm" className="me-2"/> : null} Xác nhận nộp
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}