import React, { useEffect, useState } from 'react';
import { Modal, Table, Spinner, Badge } from 'react-bootstrap';
import { History } from 'lucide-react';
import budgetService from '../../services/budgetService';
import { formatCurrency } from '../../utils/format';

interface Props {
  budgetId: number;
  onClose: () => void;
}

export default function BudgetHistoryModal({ budgetId, onClose }: Props) {
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await budgetService.getBudgetHistory(budgetId);
        setHistories(data);
      } catch (error) {
        console.error('Lỗi tải lịch sử ngân sách:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [budgetId]);

  return (
    <Modal show onHide={onClose} centered size="lg" scrollable>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5 d-flex align-items-center">
          <History size={20} className="me-2 text-primary" />
          Lịch sử điều chỉnh Ngân sách
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="px-4 pb-4 pt-3">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" size="sm" />
            <div className="text-muted small mt-2">Đang tải dữ liệu...</div>
          </div>
        ) : histories.length === 0 ? (
          <div className="text-center py-5 text-muted">
            Ngân sách này chưa từng bị điều chỉnh hạn mức.
          </div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {histories.map((h, index) => (
              <div key={h.id} className="p-3 bg-light border rounded-4 position-relative">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <Badge bg="primary" className="rounded-pill px-3 py-2">
                    Lần sửa {histories.length - index}
                  </Badge>
                  <small className="text-muted">
                    {new Date(h.createAt).toLocaleString('vi-VN')}
                  </small>
                </div>

                <Table borderless size="sm" className="mb-0 bg-white rounded-3 overflow-hidden">
                  <thead>
                    <tr className="border-bottom">
                      <th className="text-muted small fw-bold">Trường</th>
                      <th className="text-danger small fw-bold">Giá trị cũ</th>
                      <th className="text-success small fw-bold">Giá trị mới</th>
                    </tr>
                  </thead>
                  <tbody>
                    {h.oldLimitAmount !== h.newLimitAmount && (
                      <tr>
                        <td className="fw-medium">Hạn mức (VNĐ)</td>
                        <td className="text-decoration-line-through text-muted">{formatCurrency(h.oldLimitAmount)}</td>
                        <td className="fw-bold">{formatCurrency(h.newLimitAmount)}</td>
                      </tr>
                    )}
                    {h.oldWarningPercent !== h.newWarningPercent && (
                      <tr>
                        <td className="fw-medium">Ngưỡng cảnh báo</td>
                        <td className="text-decoration-line-through text-muted">{h.oldWarningPercent}%</td>
                        <td className="fw-bold">{h.newWarningPercent}%</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
}