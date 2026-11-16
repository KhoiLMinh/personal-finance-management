import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Form, Button, ButtonGroup, Row, Col, Spinner } from 'react-bootstrap';
import transactionService from '../../services/transactionService';
import { toLocalISODate } from '../../utils/format';
import { canWriteWallet } from '../../utils/wallet';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  wallets: any[];
  categories: any[];
  editData?: any;
}
//FR-02
export default function TransactionModal({ show, onHide, onSuccess, wallets: allWallets, categories, editData }: Props) {
  // VIEW-only shared wallets cannot take new transactions; when editing, keep the transaction's own wallet visible
  const wallets = useMemo(() => (editData ? allWallets : allWallets.filter(canWriteWallet)), [allWallets, editData]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    amount: '',
    categoryId: '',
    walletId: '',
    date: toLocalISODate(),
    description: ''
  });

  useEffect(() => {
    if (show) {
      if (editData) {
        setFormData({
          type: editData.type,
          amount: editData.amount.toString(),
          categoryId: editData.categoryId.toString(),
          walletId: editData.walletId.toString(),
          date: editData.date,
          description: editData.description || ''
        });
      } else {
        setFormData(prev => ({
          ...prev,
          categoryId: '',
          walletId: wallets.length > 0 ? wallets[0].id : '',
          amount: '',
          description: '',
          date: toLocalISODate(),
        }));
      }
    }
  }, [show, categories, wallets, editData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        amount: Number(formData.amount),
        categoryId: Number(formData.categoryId),
        walletId: Number(formData.walletId)
      };

      if (editData) {

        await transactionService.updateTransaction(editData.id, payload);
      } else {

        await transactionService.createTransaction(payload);
      }

      window.dispatchEvent(new Event('reload-notifications'));

      onSuccess();
      onHide();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Không lưu được giao dịch. Kiểm tra lại thông tin rồi thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const selectableCats = categories.filter(c => c.type === formData.type && !c.hidden);

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">{editData ? 'Sửa giao dịch' : 'Thêm giao dịch'}</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <ButtonGroup className="w-100 mb-3" aria-label="Loại giao dịch">
            {(['EXPENSE', 'INCOME'] as const).map(t => (
              <Button key={t} variant={formData.type === t ? 'primary' : 'outline-secondary'} aria-pressed={formData.type === t}
                onClick={() => setFormData({ ...formData, type: t, categoryId: formData.type === t ? formData.categoryId : '' })}>
                {t === 'EXPENSE' ? 'Khoản chi' : 'Khoản thu'}
              </Button>
            ))}
          </ButtonGroup>

          <Form.Group className="mb-3" controlId="tx-amount">
            <Form.Label className="small text-secondary">Số tiền (đ)</Form.Label>
            <Form.Control type="number" inputMode="numeric" min="1" step="1" required className="num fs-5"
              value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
          </Form.Group>

          <Row className="g-3 mb-3">
            <Col sm={6}>
              <Form.Group controlId="tx-category">
                <Form.Label className="small text-secondary">Danh mục</Form.Label>
                <Form.Select required value={formData.categoryId} onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}>
                  <option value="">Chọn danh mục</option>
                  {selectableCats.filter(c => !c.parentId).map(parent => (
                    <React.Fragment key={parent.id}>
                      <option value={parent.id}>{parent.name}</option>
                      {selectableCats.filter(child => child.parentId === parent.id).map(child => (
                        <option key={child.id} value={child.id}>&nbsp;&nbsp;↳ {child.name}</option>
                      ))}
                    </React.Fragment>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="tx-wallet">
                <Form.Label className="small text-secondary">Ví</Form.Label>
                <Form.Select required disabled={!!editData}
                  value={formData.walletId} onChange={(e) => setFormData({ ...formData, walletId: e.target.value })}>
                  <option value="">Chọn ví</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} · {Number(w.balance).toLocaleString('vi-VN')} đ</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="tx-date">
                <Form.Label className="small text-secondary">Ngày</Form.Label>
                <Form.Control type="date" required value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
              </Form.Group>
            </Col>
            <Col sm={6}>
              <Form.Group controlId="tx-note">
                <Form.Label className="small text-secondary">Ghi chú</Form.Label>
                <Form.Control type="text" maxLength={255} placeholder="Không bắt buộc"
                  value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={onHide}>Hủy</Button>
          <Button type="submit" disabled={loading}>
            {loading && <Spinner size="sm" className="me-2" />}
            {editData ? 'Lưu thay đổi' : 'Thêm giao dịch'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
