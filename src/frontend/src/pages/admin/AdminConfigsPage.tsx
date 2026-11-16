import React, { useCallback, useEffect, useState } from 'react';
import { Button, Spinner, Modal, Form, Alert } from 'react-bootstrap';
import { Pencil } from 'lucide-react';
import settingService from '../../services/settingService';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';

interface Setting { key: string; value: string; description: string }

// BudgetServiceImpl parses this as a number and silently falls back to 80 when it cannot, so validate here.
const isPercent = (key: string) => key.endsWith('_PERCENT');

export default function AdminConfigsPage() {
  const [settings, setSettings] = useState<Setting[] | null>(null);
  const [error, setError] = useState(false);
  const [editData, setEditData] = useState<Setting | null>(null);
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      setSettings(await settingService.getAllSettings());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editData) return;
    setIsSubmitting(true);
    setFormError('');
    try {
      await settingService.updateSetting(editData.key, editData.value.trim());
      setEditData(null);
      load();
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || 'Không lưu được cấu hình. Thử lại sau.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page">
      <p className="small text-secondary" style={{ maxWidth: '65ch' }}>Tham số áp dụng cho toàn hệ thống. Thay đổi có hiệu lực với các thao tác diễn ra sau khi lưu.</p>
      <section className="panel">
        {error ? (
          <ErrorState onRetry={load} />
        ) : settings === null ? (
          <LoadingState />
        ) : settings.length === 0 ? (
          <EmptyState title="Chưa có tham số cấu hình nào" />
        ) : (
          <ul className="list-unstyled mb-0">
            {settings.map((s) => (
              <li key={s.key} className="d-flex align-items-center gap-3 px-3 py-3 border-bottom">
                <div className="flex-grow-1" style={{ minWidth: 0 }}>
                  <div className="fw-medium">{s.description}</div>
                  <code className="small text-secondary">{s.key}</code>
                </div>
                <span className="num fs-5 fw-semibold">{s.value}{isPercent(s.key) && '%'}</span>
                <Button variant="outline-secondary" size="sm" className="d-inline-flex align-items-center gap-1" onClick={() => { setFormError(''); setEditData({ ...s }); }}>
                  <Pencil size={14} aria-hidden /> Sửa
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Modal show={editData !== null} onHide={() => setEditData(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title as="h2" className="h5 mb-0">Sửa tham số</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleUpdate}>
          <Modal.Body>
            {formError && <Alert variant="danger" className="py-2 small">{formError}</Alert>}
            <p className="small mb-1">{editData?.description}</p>
            <code className="small text-secondary d-block mb-3">{editData?.key}</code>
            <Form.Group controlId="setting-value">
              <Form.Label className="small text-secondary">Giá trị{editData && isPercent(editData.key) ? ' (%)' : ''}</Form.Label>
              {editData && isPercent(editData.key) ? (
                <Form.Control type="number" min={1} max={100} step="any" required className="num" value={editData.value}
                  onChange={(e) => setEditData({ ...editData, value: e.target.value })} />
              ) : (
                <Form.Control required value={editData?.value ?? ''} onChange={(e) => setEditData((p) => (p ? { ...p, value: e.target.value } : p))} />
              )}
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" onClick={() => setEditData(null)}>Hủy</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting && <Spinner size="sm" className="me-2" />}Lưu</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}
