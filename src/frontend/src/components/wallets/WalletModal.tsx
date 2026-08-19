import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Row, Col } from 'react-bootstrap';
import walletService from '../../services/walletService';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  editData?: any;
}

export default function WalletModal({ show, onHide, onSuccess, editData }: Props) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    balance: '', 
    icon: 'Wallet', 
    color: '#3b82f6' 
  });

  useEffect(() => {
    if (show) {
      if (editData) {
        setFormData({
          name: editData.name,
          balance: editData.balance.toString(),
          icon: editData.icon || 'Wallet',
          color: editData.color || '#3b82f6'
        });
      } else {
        setFormData({ name: '', balance: '', icon: 'Wallet', color: '#3b82f6' });
      }
    }
  }, [show, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editData) {
        // Cập nhật: Theo Backend, UpdateWalletRequest không cho sửa balance
        await walletService.updateWallet(editData.id, {
          name: formData.name,
          icon: formData.icon,
          color: formData.color
        });
      } else {
        // Tạo mới
        await walletService.createWallet({
          name: formData.name,
          balance: Number(formData.balance),
          icon: formData.icon,
          color: formData.color
        });
      }
      onSuccess();
      onHide();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi khi lưu thông tin ví!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-4">{editData ? 'Sửa thông tin ví' : '+ Tạo ví mới'}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-3">
        <Form onSubmit={handleSubmit}>
          
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Tên ví / Ngân hàng</Form.Label>
            <Form.Control 
              size="lg" 
              type="text" 
              required 
              className="bg-light border-0" 
              placeholder="VD: Tiền mặt, Vietcombank..."
              value={formData.name} 
              onChange={(e) => setFormData({...formData, name: e.target.value})} 
            />
          </Form.Group>

          {/* Không cho sửa số dư nếu đang ở chế độ Edit */}
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Số dư ban đầu (VNĐ)</Form.Label>
            <Form.Control 
              size="lg" 
              type="number" 
              min="0" 
              required={!editData} 
              disabled={!!editData}
              className="bg-light border-0" 
              placeholder="0"
              value={formData.balance} 
              onChange={(e) => setFormData({...formData, balance: e.target.value})} 
            />
            {editData && <Form.Text className="text-danger small">Bạn không thể sửa số dư của ví đã tạo.</Form.Text>}
          </Form.Group>

          <Row className="mb-4">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-medium small">Biểu tượng</Form.Label>
                <Form.Select 
                  size="lg" 
                  className="bg-light border-0"
                  value={formData.icon} 
                  onChange={(e) => setFormData({...formData, icon: e.target.value})}
                >
                  <option value="Wallet">Ví tiền</option>
                  <option value="Bank">Ngân hàng</option>
                  <option value="CreditCard">Thẻ tín dụng</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="text-muted fw-medium small">Màu sắc thẻ</Form.Label>
                <Form.Control 
                  type="color" 
                  className="w-100 p-1 border-0 rounded-3 bg-light" 
                  style={{ height: '48px', cursor: 'pointer' }}
                  value={formData.color} 
                  onChange={(e) => setFormData({...formData, color: e.target.value})} 
                />
              </Form.Group>
            </Col>
          </Row>

          <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0" disabled={loading} style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? <Spinner size="sm" className="me-2"/> : null} Lưu thông tin
          </Button>

        </Form>
      </Modal.Body>
    </Modal>
  );
}