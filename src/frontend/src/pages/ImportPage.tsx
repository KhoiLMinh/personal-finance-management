import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Row, Col, Alert } from 'react-bootstrap';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Bot } from 'lucide-react';

import walletService from '../services/walletService';
import { importService } from '../services/aiService';
import MySpinner from '../components/MySpinner';

interface ImportResult {
  fileName: string;
  totalRows: number;
  successRows: number;
  duplicatedRows: number;
}

export default function ImportPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);

  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetchWallets();
  }, []);

  const fetchWallets = async () => {
    try {
      const res = await walletService.getMyWallets();
      setWallets(res);
      setSelectedWalletId(prev => {
        if (prev && res.some((w: any) => w.id.toString() === prev)) return prev;
        return res.length > 0 ? res[0].id.toString() : '';
      });
    } catch (error) {
      console.error("Lỗi tải danh sách ví:", error);
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.csv')) {
        setErrorMsg('Hệ thống chỉ hỗ trợ file định dạng .csv');
        setSelectedFile(null);
        e.target.value = '';
      } else {
        setErrorMsg('');
        setSelectedFile(file);
      }
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedWalletId) {
      setErrorMsg('Vui lòng chọn ví và file CSV để tải lên!');
      return;
    }

    setIsUploading(true);
    setErrorMsg('');
    setResult(null);

    try {
      const response = await importService.importCsv(Number(selectedWalletId), selectedFile);
      setResult(response);
      setSelectedFile(null);

      await fetchWallets();
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.response?.data?.error?.message || 'Lỗi khi nhập sao kê. Vui lòng kiểm tra lại định dạng file!');
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingWallets) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary-darker)' }}>Nhập sao kê ngân hàng</h3>
            <p className="text-muted mb-0">Tự động hóa việc ghi chép chi tiêu với sự hỗ trợ của Trợ lý AI</p>
          </div>
          <div className="bg-primary-lighter p-2 rounded-circle">
            <UploadCloud size={32} color="var(--color-primary)" />
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        <Col md={7} lg={8}>
          <Card className="border-0 rounded-4 shadow-soft h-100">
            <Card.Body className="p-4 p-md-5">
              <h5 className="fw-bold mb-4 text-dark">Tải lên file dữ liệu</h5>
              
              {errorMsg && <Alert variant="danger" className="border-0 rounded-3 fw-medium small">{errorMsg}</Alert>}

              <Form onSubmit={handleUpload}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small">Chọn Ví / Tài khoản ngân hàng</Form.Label>
                  <Form.Select 
                    size="lg" 
                    className="bg-light border-0" 
                    value={selectedWalletId} 
                    onChange={(e) => setSelectedWalletId(e.target.value)}
                    required
                    disabled={isUploading}
                  >
                    <option value="">-- Chọn ví nhận dòng tiền --</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Số dư hiện tại: {w.balance.toLocaleString('vi-VN')} đ)</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small">File sao kê (.csv)</Form.Label>
                  
                  <div className="position-relative p-5 text-center bg-light rounded-4" style={{ border: '2px dashed var(--color-border)' }}>
                    <FileSpreadsheet size={48} className="text-muted mb-3 opacity-50" />
                    <div>
                      <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>Nhấn vào đây để chọn file</span>
                      <span className="text-muted"> hoặc kéo thả file CSV của bạn</span>
                    </div>
                    <p className="text-muted small mt-2 mb-0">Hỗ trợ file CSV xuất từ các ngân hàng (Vietcombank, Techcombank,...)</p>
                    
                    <Form.Control 
                      type="file" 
                      accept=".csv"
                      onChange={handleFileChange}
                      disabled={isUploading}
                      className="position-absolute top-0 start-0 w-100 h-100 opacity-0"
                      style={{ cursor: 'pointer' }}
                    />
                  </div>
                  
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-primary-lighter rounded-3 d-flex align-items-center border border-primary border-opacity-25">
                      <FileSpreadsheet size={20} className="me-2 text-primary" />
                      <span className="fw-medium text-primary flex-grow-1 text-truncate">{selectedFile.name}</span>
                      <span className="text-muted small">{(selectedFile.size / 1024).toFixed(2)} KB</span>
                    </div>
                  )}
                </Form.Group>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-100 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  disabled={!selectedFile || isUploading}
                >
                  {isUploading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" /> 
                      Đang xử lý dữ liệu và phân tích AI (Có thể mất vài phút)...
                    </>
                  ) : (
                    <>Bắt đầu Import Dữ liệu</>
                  )}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col md={5} lg={4}>
          <div className="d-flex flex-column gap-4 h-100">
            
            {result && (
              <Card className="border-0 rounded-4 shadow-soft" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <CheckCircle2 size={24} className="me-2 text-success" />
                    <h5 className="fw-bold mb-0 text-success">Import Thành Công!</h5>
                  </div>
                  <hr className="my-3" />
                  <div className="d-flex justify-content-between mb-2 text-dark">
                    <span>Tổng số dòng:</span>
                    <span className="fw-bold fs-5">{result.totalRows}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2 text-dark">
                    <span>Thêm mới:</span>
                    <span className="fw-bold fs-5">{result.successRows}</span>
                  </div>
                  <div className="d-flex justify-content-between text-dark">
                    <span>Bỏ qua (Trùng lặp):</span>
                    <span className="fw-bold fs-5">{result.duplicatedRows}</span>
                  </div>
                </Card.Body>
              </Card>
            )}

            <Card className="border-0 rounded-4 shadow-soft flex-grow-1">
              <Card.Body className="p-4">
                <h5 className="fw-bold text-dark mb-4">Hướng dẫn định dạng CSV</h5>
                <ul className="text-muted small ps-3 mb-4" style={{ lineHeight: '1.8' }}>
                  <li>Dòng đầu tiên (Header) sẽ bị bỏ qua.</li>
                  <li>Cột 1: <strong>Ngày giao dịch</strong> (Định dạng: dd/MM/yyyy).</li>
                  <li>Cột 2: <strong>Số tiền</strong> (Dấu trừ (-) cho khoản chi, bỏ dấu phẩy ngăn cách ngàn).</li>
                  <li>Cột 3: <strong>Nội dung giao dịch</strong> (Diễn giải chi tiết).</li>
                </ul>

                <div className="p-3 bg-light rounded-3 border">
                  <div className="fw-bold text-dark mb-2 d-flex align-items-center">
                    <Bot size={18} className="me-2 text-primary" /> Cơ chế AI
                  </div>
                  <p className="small text-muted mb-0" style={{ textAlign: 'justify' }}>
                    Nếu nội dung giao dịch không khớp với quy tắc bạn tự đặt, hệ thống sẽ gửi nội dung đó cho AI xử lý ngôn ngữ tự nhiên để tự động chọn đúng danh mục (Ăn uống, Lương, Mua sắm...). 
                  </p>
                </div>
              </Card.Body>
            </Card>

          </div>
        </Col>
      </Row>

    </div>
  );
}