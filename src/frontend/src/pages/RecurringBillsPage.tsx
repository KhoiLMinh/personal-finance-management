import React, { useEffect, useState } from 'react';
import { Card, Button, Row, Col, Badge, Spinner, Modal, Form, Table } from 'react-bootstrap';
import { Plus, Trash2, Save, CalendarClock, Bell, Edit } from 'lucide-react';

import recurringBillService from '../services/recurringBillService';
import { formatCurrency } from '../utils/format';
import MySpinner from '../components/MySpinner';

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
    try {
      const billsRes = await recurringBillService.getBills({ page: 0, size: 50 });
      setBills(billsRes.content || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu nhắc nhở:", error);
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
      alert(error.response?.data?.error?.message || "Lỗi thiết lập nhắc nhở!");
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

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#f8fafc' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#e0e7ff' }}>
        <Card.Body className="p-4 d-flex flex-wrap gap-3 justify-content-between align-items-center">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-white p-3 rounded-circle shadow-sm">
              <Bell size={28} color="var(--color-primary)" />
            </div>
            <div>
              <h3 className="fw-bold text-dark mb-1">Nhắc nhở thanh toán</h3>
              <p className="text-dark mb-0 opacity-75">Không bao giờ quên đóng tiền Điện, Nước, Internet đúng hạn</p>
            </div>
          </div>
          <Button 
            variant="primary" 
            className="rounded-pill px-4 fw-bold d-flex align-items-center"
            onClick={handleOpenCreate}
          >
            <Plus size={20} className="me-1" /> Thêm nhắc nhở mới
          </Button>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4">
        <Card.Body className="p-0">
          <Table responsive hover className="mb-0 align-middle border-0">
            <thead className="bg-light text-muted">
              <tr>
                <th className="py-3 px-4 fw-medium border-0 rounded-top-start-4">Tên hóa đơn</th>
                <th className="py-3 fw-medium border-0">Dự toán khoản chi</th>
                <th className="py-3 fw-medium border-0">Lịch nhắc nhở (App & Email)</th>
                <th className="py-3 fw-medium border-0">Ngày tạo</th>
                <th className="py-3 px-4 fw-medium border-0 text-end rounded-top-end-4">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {bills.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-5 text-muted">Bạn chưa thiết lập nhắc nhở nào.</td></tr>
              ) : (
                bills.map((bill) => (
                  <tr key={bill.id} className="border-bottom">
                    <td className="px-4 py-3 fw-bold text-dark">{bill.title}</td>
                    <td className="py-3 text-danger fw-bold">{formatCurrency(bill.amount)}</td>
                    <td className="py-3">
                      <div className="d-flex flex-column gap-1">
                        <Badge bg={bill.frequency === 'MONTHLY' ? 'primary' : bill.frequency === 'WEEKLY' ? 'info' : 'secondary'} className="align-self-start fw-medium rounded-pill px-3">
                          {bill.frequency === 'MONTHLY' ? `Ngày ${bill.executionDay} hằng tháng` : 
                           bill.frequency === 'WEEKLY' ? `Thứ ${bill.executionDay} hằng tuần` : 'Hằng ngày'}
                        </Badge>
                        <span className="small text-muted fw-medium d-flex align-items-center mt-1">
                          <CalendarClock size={14} className="me-1 text-warning"/> Thông báo lúc {formatTime(bill.notificationTime)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 text-muted small">
                      {bill.createAt ? new Date(bill.createAt).toLocaleDateString('vi-VN') : 'Mới đây'}
                    </td>
                    <td className="py-3 px-4 text-end">
                      {/* Bổ sung lại nút Sửa */}
                      <Button variant="light" size="sm" className="text-primary border-0 me-2" onClick={() => handleOpenEdit(bill)} title="Sửa nhắc nhở">
                        <Edit size={16} />
                      </Button>
                      <Button variant="light" size="sm" className="text-danger border-0" onClick={() => handleDelete(bill.id)} title="Xóa">
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-4 text-dark">
            {isEditing ? 'Sửa Nhắc nhở' : '+ Thiết lập Nhắc nhở'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-3">
          <Form onSubmit={handleSubmit}>
            
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Tên hóa đơn cần nhắc</Form.Label>
                  <Form.Control size="lg" type="text" required className="bg-light border-0" 
                    placeholder="VD: Tiền điện, Tiền mạng..."
                    value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="text-muted fw-medium small">Dự toán số tiền (VNĐ)</Form.Label>
                  <Form.Control size="lg" type="number" required min="1000" className="bg-light border-0" 
                    placeholder="Để ghi chú dự trù..."
                    value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} 
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="p-3 bg-light rounded-4 mb-4 mt-2">
              <h6 className="fw-bold mb-3 d-flex align-items-center"><CalendarClock size={18} className="me-2 text-primary"/> Thời gian chuông reo</h6>
              <Row>
                <Col md={4} className="mb-3 mb-md-0">
                  <Form.Group>
                    <Form.Label className="text-muted fw-medium small">Tần suất báo</Form.Label>
                    <Form.Select className="border-0 shadow-sm"
                      value={formData.frequency} onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                    >
                      <option value="MONTHLY">Hằng tháng</option>
                      <option value="WEEKLY">Hằng tuần</option>
                      <option value="DAILY">Hằng ngày</option>
                    </Form.Select>
                  </Form.Group>
                </Col>

                {formData.frequency !== 'DAILY' && (
                  <Col md={4} className="mb-3 mb-md-0">
                    <Form.Group>
                      <Form.Label className="text-muted fw-medium small">
                        {formData.frequency === 'MONTHLY' ? 'Vào ngày' : 'Vào thứ'}
                      </Form.Label>
                      <Form.Select className="border-0 shadow-sm"
                        value={formData.executionDay} onChange={(e) => setFormData({...formData, executionDay: Number(e.target.value)})}
                      >
                        {formData.frequency === 'MONTHLY' 
                          ? Array.from({length: 31}, (_, i) => i + 1).map(day => <option key={day} value={day}>Ngày {day}</option>)
                          : [2, 3, 4, 5, 6, 7, 8].map(day => <option key={day} value={day}>{day === 8 ? 'Chủ nhật' : `Thứ ${day}`}</option>)
                        }
                      </Form.Select>
                    </Form.Group>
                  </Col>
                )}

                <Col md={formData.frequency === 'DAILY' ? 8 : 4}>
                  <Form.Group>
                    <Form.Label className="text-muted fw-medium small">Giờ thông báo (App & Email)</Form.Label>
                    <Form.Control type="time" required className="border-0 shadow-sm"
                      value={formData.notificationTime} onChange={(e) => setFormData({...formData, notificationTime: e.target.value})} 
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            <Button type="submit" className="w-100 py-3 fs-5 fw-bold rounded-4 border-0" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
              {isSubmitting ? <Spinner size="sm" className="me-2"/> : <Save size={20} className="me-2"/>} 
              {isEditing ? 'Lưu cập nhật' : 'Lưu báo thức'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

    </div>
  );
}