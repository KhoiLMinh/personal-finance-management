import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Row, Col, Table, Spinner } from 'react-bootstrap';
import { CalendarClock, Trash2 } from 'lucide-react';
import recurringBillService from '../services/recurringBillService';
import { formatCurrency } from '../utils/format';

export default function RecurringBillsPage() {
  const [bills, setBills] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', amount: '', frequency: 'MONTHLY', nextDueDate: '' });

  const fetchBills = async () => {
    try {
      const res = await recurringBillService.getBills({ page: 0, size: 50 });
      setBills(res.content);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await recurringBillService.createBill({
        ...formData,
        amount: Number(formData.amount)
      });
      setFormData({ title: '', amount: '', frequency: 'MONTHLY', nextDueDate: '' });
      fetchBills();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || 'Lỗi thêm hóa đơn!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Xóa nhắc nhở hóa đơn này?')) {
      await recurringBillService.deleteBill(id);
      fetchBills();
    }
  };

  const freqMap: any = { DAILY: 'Hàng ngày', WEEKLY: 'Hàng tuần', MONTHLY: 'Hàng tháng', YEARLY: 'Hàng năm' };

  return (
    <div className="p-4 flex-grow-1">
      <Card className="border-0 rounded-4 mb-4 shadow-sm">
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <CalendarClock size={32} className="text-primary" />
          <div>
            <h4 className="fw-bold mb-0">Hóa đơn định kỳ</h4>
            <span className="text-muted small">Quản lý và nhắc nhở các khoản phí cố định</span>
          </div>
        </Card.Body>
      </Card>

      <Row>
        <Col md={4}>
          <Card className="border-0 rounded-4 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold mb-3">Thêm hóa đơn mới</h6>
              <Form onSubmit={handleSubmit}>
                <Form.Control className="mb-3 bg-light border-0" placeholder="Tên (VD: Tiền điện, Netflix)" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                <Form.Control className="mb-3 bg-light border-0" type="number" placeholder="Số tiền" required value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} />
                <Form.Select className="mb-3 bg-light border-0" value={formData.frequency} onChange={e => setFormData({...formData, frequency: e.target.value})}>
                  <option value="DAILY">Hàng ngày</option>
                  <option value="WEEKLY">Hàng tuần</option>
                  <option value="MONTHLY">Hàng tháng</option>
                  <option value="YEARLY">Hàng năm</option>
                </Form.Select>
                <Form.Control className="mb-3 bg-light border-0" type="date" required value={formData.nextDueDate} onChange={e => setFormData({...formData, nextDueDate: e.target.value})} />
                <Button type="submit" className="w-100 fw-bold rounded-3" disabled={loading}>
                  {loading ? <Spinner size="sm"/> : 'Lưu hóa đơn'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="border-0 rounded-4 shadow-sm">
            <Table hover responsive className="mb-0 align-middle">
              <thead className="bg-light">
                <tr>
                  <th className="py-3 px-4 text-muted small fw-bold">TÊN HÓA ĐƠN</th>
                  <th className="py-3 text-muted small fw-bold">SỐ TIỀN</th>
                  <th className="py-3 text-muted small fw-bold">CHU KỲ</th>
                  <th className="py-3 text-muted small fw-bold">HẠN TIẾP THEO</th>
                  <th className="py-3 px-4 text-end text-muted small fw-bold">XÓA</th>
                </tr>
              </thead>
              <tbody>
                {bills.map(b => (
                  <tr key={b.id}>
                    <td className="px-4 fw-bold">{b.title}</td>
                    <td className="text-danger fw-bold">{formatCurrency(b.amount)}</td>
                    <td>{freqMap[b.frequency]}</td>
                    <td className="text-primary fw-medium">{b.nextDueDate}</td>
                    <td className="px-4 text-end">
                      <Button variant="light" size="sm" className="text-danger border-0" onClick={() => handleDelete(b.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))}
                {bills.length === 0 && <tr><td colSpan={5} className="text-center py-4 text-muted">Chưa có hóa đơn định kỳ nào.</td></tr>}
              </tbody>
            </Table>
          </Card>
        </Col>
      </Row>
    </div>
  );
}