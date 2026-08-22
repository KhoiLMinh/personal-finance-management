import React, { useState } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { Send } from 'lucide-react';
import walletService from '../../services/walletService';

interface Props {
  show: boolean;
  onHide: () => void;
  wallet: any;
}
//FR-13
export default function ShareWalletModal({ show, onHide, wallet }: Props) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState('VIEW');
  const [msg, setMsg] = useState({ type: '', text: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      await walletService.shareWallet(wallet.id, { email, permission });
      setMsg({ type: 'success', text: `Đã gửi lời mời tham gia ví đến ${email}!` });
      setEmail('');
    } catch (error: any) {
      setMsg({ type: 'danger', text: error.response?.data?.error?.message || "Lỗi khi gửi lời mời!" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5">Chia sẻ Ví: {wallet?.name}</Modal.Title>
      </Modal.Header>
      <Modal.Body className="px-4 pb-4 pt-3">
        <p className="text-muted small mb-4">Mời người thân/bạn bè tham gia ví để cùng quản lý chi tiêu. Họ sẽ nhận được thông báo qua Email.</p>
        
        {msg.text && <Alert variant={msg.type} className="py-2 small fw-medium">{msg.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="text-muted fw-medium small">Email người được mời</Form.Label>
            <Form.Control 
              type="email" 
              required 
              className="bg-light border-0" 
              placeholder="VD: vo.chong@gmail.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="text-muted fw-medium small">Quyền hạn</Form.Label>
            <Form.Select 
              className="bg-light border-0"
              value={permission} 
              onChange={(e) => setPermission(e.target.value)}
            >
              <option value="VIEW">Chỉ xem (Không thể thêm/sửa giao dịch)</option>
              <option value="EDIT">Chỉnh sửa (Được phép chi tiêu/sửa giao dịch)</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" className="w-100 py-2 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center" disabled={loading} style={{ backgroundColor: 'var(--color-primary)' }}>
            {loading ? <Spinner size="sm" className="me-2"/> : <Send size={18} className="me-2"/>} Gửi lời mời
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}