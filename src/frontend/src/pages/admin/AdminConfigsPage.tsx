import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Spinner, Modal, Form, Badge } from 'react-bootstrap';
import { Settings, Edit } from 'lucide-react';
import settingService from '../../services/settingService';
import MySpinner from '../../components/MySpinner';

export default function AdminConfigsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editData, setEditData] = useState<{ key: string, value: string, description: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await settingService.getAllSettings();
      setSettings(data);
    } catch (error) {
      console.error("Lỗi lấy cấu hình:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleOpenEdit = (setting: any) => {
    setEditData({ key: setting.key, value: setting.value, description: setting.description });
    setShowModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    setIsSubmitting(true);
    try {
      await settingService.updateSetting(editData.key, editData.value);
      setShowModal(false);
      fetchSettings();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi cập nhật cấu hình!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <div className="bg-white p-2 rounded-circle shadow-sm">
            <Settings size={32} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="fw-bold text-dark mb-1">Cấu hình Hệ thống</h3>
            <p className="text-dark mb-0 opacity-75">Quản lý các tham số hoạt động chung của toàn hệ thống</p>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4 text-muted small fw-bold">MÃ CẤU HÌNH (KEY)</th>
              <th className="py-3 text-muted small fw-bold">MÔ TẢ</th>
              <th className="py-3 text-muted small fw-bold">GIÁ TRỊ HIỆN TẠI</th>
              <th className="py-3 px-4 text-end text-muted small fw-bold">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {settings.map((s) => (
              <tr key={s.key}>
                <td className="px-4 fw-bold text-dark">
                  <Badge bg="secondary" className="fw-normal font-monospace">{s.key}</Badge>
                </td>
                <td className="text-muted">{s.description}</td>
                <td className="fw-bold text-primary fs-5">{s.value}</td>
                <td className="px-4 text-end">
                  <Button variant="outline-primary" size="sm" className="rounded-pill px-3 fw-medium d-inline-flex align-items-center" onClick={() => handleOpenEdit(s)}>
                    <Edit size={16} className="me-2" /> Chỉnh sửa
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
          <Modal.Title className="fw-bold fs-5">Chỉnh sửa tham số</Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4 pt-3">
          <Form onSubmit={handleUpdate}>
            <div className="mb-3 p-3 bg-light rounded-3 text-muted small">
              <strong>Mô tả: </strong> {editData?.description}
            </div>
            <Form.Group className="mb-4">
              <Form.Label className="text-muted fw-bold small">Giá trị mới cho [{editData?.key}]</Form.Label>
              <Form.Control size="lg" type="text" className="bg-light border-0 fw-bold text-primary" required value={editData?.value || ''} onChange={(e) => setEditData(prev => prev ? {...prev, value: e.target.value} : null)} />
            </Form.Group>
            <Button type="submit" className="w-100 py-3 fs-6 fw-bold rounded-pill border-0" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
              {isSubmitting ? <Spinner size="sm" className="me-2"/> : null} Lưu cấu hình
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}