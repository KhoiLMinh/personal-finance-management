import React, { useEffect, useState } from 'react';
import { Modal, Table, Spinner, Badge } from 'react-bootstrap';
import { History } from 'lucide-react';
import transactionService from '../../services/transactionService';
import { formatCurrency } from '../../utils/format';

interface HistoryModalProps {
  transactionId: number;
  onClose: () => void;
}

const TransactionHistoryModal: React.FC<HistoryModalProps> = ({ transactionId, onClose }) => {
  const [histories, setHistories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await transactionService.getTransactionHistory(transactionId);
        setHistories(data);
      } catch (error) {
        console.error('Lỗi tải lịch sử:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [transactionId]);

  return (
    <Modal show onHide={onClose} centered size="lg" scrollable>
      <Modal.Header closeButton className="border-0 pb-0 pt-4 px-4">
        <Modal.Title className="fw-bold fs-5 d-flex align-items-center">
          <History size={20} className="me-2 text-primary" />
          Lịch sử đối soát giao dịch
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
            Giao dịch này chưa từng bị chỉnh sửa.
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
                    {h.oldAmount !== h.newAmount && (
                      <tr>
                        <td className="fw-medium">Số tiền</td>
                        <td className="text-decoration-line-through text-muted">
                          {formatCurrency(h.oldAmount)}
                        </td>
                        <td className="fw-bold">{formatCurrency(h.newAmount)}</td>
                      </tr>
                    )}
                    {h.oldType !== h.newType && (
                      <tr>
                        <td className="fw-medium">Loại giao dịch</td>
                        <td className="text-decoration-line-through text-muted">
                          {h.oldType === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                        </td>
                        <td className="fw-bold">
                          {h.newType === 'INCOME' ? 'Thu nhập' : 'Chi tiêu'}
                        </td>
                      </tr>
                    )}
                    {h.oldDescription !== h.newDescription && (
                      <tr>
                        <td className="fw-medium">Ghi chú</td>
                        <td className="text-decoration-line-through text-muted">
                          {h.oldDescription || <em>(trống)</em>}
                        </td>
                        <td className="fw-bold">{h.newDescription || <em>(trống)</em>}</td>
                      </tr>
                    )}
                    {h.oldDate !== h.newDate && (
                      <tr>
                        <td className="fw-medium">Ngày</td>
                        <td className="text-decoration-line-through text-muted">{h.oldDate}</td>
                        <td className="fw-bold">{h.newDate}</td>
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
};

export default TransactionHistoryModal;