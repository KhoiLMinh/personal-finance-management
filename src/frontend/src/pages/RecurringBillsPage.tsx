import React, { useEffect, useState } from 'react';
import { Button, Row, Col, Spinner, Modal, Form } from 'react-bootstrap';
import { Plus, Trash2, CalendarClock, Pencil } from 'lucide-react';

import recurringBillService from '../services/recurringBillService';
import { formatCurrency } from '../utils/format';
import { EmptyState, ErrorState, LoadingState } from '../components/ui/PageState';

const formatTime = (timeData: any) => {
  if (!timeData) return '00:00';
  if (typeof timeData === 'string') {
    return timeData.substring(0, 5);
  }
  if (Array.isArray(timeData) && timeData.length >= 2) {
    const h = String(timeData[0]).padStart(2, '0');
    const m = String(timeData[1]).padStart(2, '0');
    return `${h}:${m}`; 
  }
  return '00:00';
};

export default function RecurringBillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null as number | null,
    title: '',
    amount: '',
    frequency: 'MONTHLY',
    executionDay: 1, 
    notificationTime: '08:00'
  });

  const fetchData = async () => {
    setLoading(true);
    setLoadError(false);
    try {
      const billsRes = await recurringBillService.getBills({ page: 0, size: 50 });
      setBills(billsRes.content || []);
    } catch {
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setFormData({ 
      id: null, title: '', amount: '', frequency: 'MONTHLY', executionDay: 1, notificationTime: '08:00' 
    });
    setShowModal(true);
  };

  const handleOpenEdit = (bill: any) => {
    setIsEditing(true);
    setFormData({
      id: bill.id,
      title: bill.title,
      amount: bill.amount,
      frequency: bill.frequency,
      executionDay: bill.executionDay || 1,
      notificationTime: formatTime(bill.notificationTime)
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        amount: Number(formData.amount),
        frequency: formData.frequency,
        executionDay: formData.frequency === 'DAILY' ? null : Number(formData.executionDay),
        notificationTime: formData.notificationTime
      };

      if (isEditing && formData.id) {
        await recurringBillService.updateBill(formData.id, payload);
      } else {
        await recurringBillService.createBill(payload);
      }
      
      setShowModal(false);
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Không lưu được nhắc nhở. Kiểm tra lại thông tin rồi thử lại.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy nhắc nhở định kỳ này?")) {
      try {
        await recurringBillService.deleteBill(id);
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa nhắc nhở!");
      }
    }
  };

  const dayName = (d: number) => (d === 8 ? 'Chủ nhật' : `Thứ ${d}`); // scheduler: Monday = 2 … Sunday = 8
  const schedule = (b: any) =>
    b.frequency === 'MONTHLY' ? `Ngày ${b.executionDay} hằng tháng` : b.frequency === 'WEEKLY' ? `${dayName(b.executionDay)} hằng tuần` : 'Hằng ngày';

  return (
    <div className="page">
      <div className="page-toolbar">
        <p className="small text-secondary mb-0" style={{ maxWidth: '60ch' }}>Nhận nhắc nhở trong ứng dụng và qua email trước hạn một ngày và vào đúng ngày đến hạn.</p>
        <Button onClick={handleOpenCreate} className="d-inline-flex align-items-center gap-1"><Plus size={18} aria-hidden /> Thêm nhắc nhở</Button>
      </div>

      <section className="panel">
        {loadError ? (
          <ErrorState onRetry={fetchData} />
        ) : loading ? (
          <LoadingState />
        ) : bills.length === 0 ? (
          <EmptyState title="Chưa có hóa đơn định kỳ" description="Thêm tiền điện, nước, internet… để được nhắc trước khi đến hạn."
            action={<Button size="sm" onClick={handleOpenCreate}>Thêm nhắc nhở</Button>} />
        ) : (
          <ul className="list-unstyled mb-0">
            {bills.map((bill) => (
              <li key={bill.id} className="d-flex align-items-center gap-3 px-3 py-2 border-bottom">
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-medium text-truncate">{bill.title}</div>
                  <div className="small text-secondary d-flex align-items-center gap-1">
                    <CalendarClock size={14} aria-hidden /> {schedule(bill)} · nhắc lúc {formatTime(bill.notificationTime)}
                  </div>
                </div>
                <span className="num fw-semibold">{formatCurrency(bill.amount)}</span>
                <div className="d-flex flex-shrink-0">
                  <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Sửa ${bill.title}`} onClick={() => handleOpenEdit(bill)}><Pencil size={16} aria-hidden /></Button>
                  <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Xóa ${bill.title}`} onClick={() => handleDelete(bill.id)}><Trash2 size={16} aria-hidden /></Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">{isEditing ? 'Sửa nhắc nhở' : 'Thêm nhắc nhở hóa đơn'}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row className="g-3">
              <Col sm={7}>
                <Form.Group controlId="bill-title">
                  <Form.Label className="small text-secondary">Tên hóa đơn</Form.Label>
                  <Form.Control required maxLength={100} placeholder="VD: Tiền điện" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </Form.Group>
              </Col>
              <Col sm={5}>
                <Form.Group controlId="bill-amount">
                  <Form.Label className="small text-secondary">Số tiền dự kiến (đ)</Form.Label>
                  <Form.Control type="number" inputMode="numeric" required min="1000" step="1" className="num" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} />
                </Form.Group>
              </Col>
              <Col sm={formData.frequency === 'DAILY' ? 6 : 4}>
                <Form.Group controlId="bill-frequency">
                  <Form.Label className="small text-secondary">Lặp lại</Form.Label>
                  <Form.Select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}>
                    <option value="MONTHLY">Hằng tháng</option>
                    <option value="WEEKLY">Hằng tuần</option>
                    <option value="DAILY">Hằng ngày</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              {formData.frequency !== 'DAILY' && (
                <Col sm={4}>
                  <Form.Group controlId="bill-day">
                    <Form.Label className="small text-secondary">{formData.frequency === 'MONTHLY' ? 'Vào ngày' : 'Vào'}</Form.Label>
                    <Form.Select value={formData.executionDay} onChange={(e) => setFormData({ ...formData, executionDay: Number(e.target.value) })}>
                      {formData.frequency === 'MONTHLY'
                        ? Array.from({ length: 31 }, (_, i) => i + 1).map((d) => <option key={d} value={d}>Ngày {d}</option>)
                        : [2, 3, 4, 5, 6, 7, 8].map((d) => <option key={d} value={d}>{dayName(d)}</option>)}
                    </Form.Select>
                    {formData.frequency === 'MONTHLY' && formData.executionDay > 28 && (
                      <Form.Text>Tháng ngắn hơn sẽ nhắc vào ngày cuối tháng.</Form.Text>
                    )}
                  </Form.Group>
                </Col>
              )}
              <Col sm={formData.frequency === 'DAILY' ? 6 : 4}>
                <Form.Group controlId="bill-time">
                  <Form.Label className="small text-secondary">Giờ nhắc</Form.Label>
                  <Form.Control type="time" required value={formData.notificationTime} onChange={(e) => setFormData({ ...formData, notificationTime: e.target.value })} />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}{isEditing ? 'Lưu thay đổi' : 'Thêm nhắc nhở'}</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
