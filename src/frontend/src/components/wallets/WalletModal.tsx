import React, { useState, useEffect } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import { CreditCard, Landmark, Wallet as WalletIcon } from 'lucide-react';
import walletService from '../../services/walletService';
import { formatCurrency } from '../../utils/format';
import type { Wallet } from '../../utils/wallet';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  editData?: Wallet | null;
}

const KINDS = [
  { value: 'Wallet', label: 'Tiền mặt', Icon: WalletIcon },
  { value: 'Bank', label: 'Ngân hàng', Icon: Landmark },
  { value: 'CreditCard', label: 'Thẻ', Icon: CreditCard },
];
const SWATCHES = ['#2348c9', '#0f7f4f', '#a15c07', '#7c3aed', '#0e7490', '#be185d', '#475569'];
const DEFAULT_COLOR = SWATCHES[0];

export default function WalletModal({ show, onHide, onSuccess, editData }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({ name: '', balance: '', icon: 'Wallet', color: DEFAULT_COLOR });

  useEffect(() => {
    if (!show) return;
    setError('');
    setFormData(editData
      ? { name: editData.name, balance: String(editData.balance), icon: editData.icon || 'Wallet', color: editData.color || DEFAULT_COLOR }
      : { name: '', balance: '', icon: 'Wallet', color: DEFAULT_COLOR });
  }, [show, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editData) {
        // balance is not editable: it is derived from transactions
        await walletService.updateWallet(editData.id, { name: formData.name, icon: formData.icon, color: formData.color });
      } else {
        await walletService.createWallet({ name: formData.name, balance: Number(formData.balance || 0), icon: formData.icon, color: formData.color });
      }
      onSuccess();
      onHide();
    } catch (err: any) {
      setError(err.response?.data?.error?.message || 'Không lưu được ví. Kiểm tra lại thông tin rồi thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">{editData ? 'Sửa ví' : 'Tạo ví'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

          <Form.Group className="mb-3" controlId="wallet-name">
            <Form.Label className="small text-secondary">Tên ví</Form.Label>
            <Form.Control required maxLength={100} placeholder="VD: Tiền mặt, Vietcombank" value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </Form.Group>

          <fieldset className="mb-3">
            <legend className="small text-secondary mb-1" style={{ fontSize: 'var(--fs-sm)' }}>Loại ví</legend>
            <div className="d-flex gap-2">
              {KINDS.map(({ value, label, Icon }) => {
                const on = formData.icon === value;
                return (
                  <Button key={value} variant={on ? 'primary' : 'outline-secondary'} aria-pressed={on} className="flex-fill d-inline-flex align-items-center justify-content-center gap-1"
                    onClick={() => setFormData({ ...formData, icon: value })}>
                    <Icon size={16} aria-hidden /> {label}
                  </Button>
                );
              })}
            </div>
          </fieldset>

          <Form.Group className="mb-3" controlId="wallet-balance">
            <Form.Label className="small text-secondary">{editData ? 'Số dư hiện tại' : 'Số dư ban đầu (đ)'}</Form.Label>
            {editData ? (
              <>
                <div className="num fw-semibold">{formatCurrency(editData.balance)}</div>
                <Form.Text>Số dư thay đổi qua giao dịch, không sửa trực tiếp được.</Form.Text>
              </>
            ) : (
              <Form.Control type="number" inputMode="numeric" min="0" step="1" placeholder="0" className="num" value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })} />
            )}
          </Form.Group>

          <fieldset>
            <legend className="small text-secondary mb-1" style={{ fontSize: 'var(--fs-sm)' }}>Màu nhận diện</legend>
            <div className="d-flex flex-wrap align-items-center gap-2">
              {SWATCHES.map((c) => (
                <button key={c} type="button" className="swatch" style={{ background: c }} aria-label={`Màu ${c}`} aria-pressed={formData.color === c}
                  onClick={() => setFormData({ ...formData, color: c })} />
              ))}
              <Form.Control type="color" aria-label="Chọn màu khác" className="form-control-color" value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })} />
            </div>
          </fieldset>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner size="sm" className="me-2" />}{editData ? 'Lưu thay đổi' : 'Tạo ví'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
