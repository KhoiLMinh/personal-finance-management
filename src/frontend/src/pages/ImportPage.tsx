import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { UploadCloud, FileSpreadsheet, CheckCircle2 } from 'lucide-react';

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
  const [loadingData, setLoadingData] = useState(true);

  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const walletRes = await walletService.getMyWallets();
      setWallets(walletRes);
      if (walletRes.length > 0) {
        setSelectedWalletId(walletRes[0].id.toString());
      }
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    } finally {
      setLoadingData(false);
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

  const handleUploadCsv = async (e: React.SyntheticEvent) => {
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
      window.dispatchEvent(new Event('reload-notifications'));
      await fetchData();
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || 'Lỗi khi nhập sao kê. Vui lòng kiểm tra lại định dạng file!');
    } finally {
      setIsUploading(false);
    }
  };

  if (loadingData) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary-darker)' }}>Nhập liệu thông minh AI</h3>
            <p className="text-muted mb-0">Tự động hóa ghi chép thông qua CSV sao kê</p>
          </div>
          <div className="bg-primary-lighter p-2 rounded-circle">
            <UploadCloud size={32} color="var(--color-primary)" />
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center">
        <Card className="border-0 rounded-4 shadow-soft w-100" style={{ maxWidth: '800px' }}>
          <Card.Body className="p-4 p-md-5"> 
            
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <FileSpreadsheet size={24} className="me-2 text-primary"/>
              <h5 className="fw-bold mb-0 text-dark">Nhập file CSV sao kê</h5>
            </div>

            {errorMsg && <Alert variant="danger" className="border-0 rounded-3 fw-medium small">{errorMsg}</Alert>}
            
            <Form onSubmit={handleUploadCsv}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-medium text-muted small">Chọn Ví / Tài khoản ngân hàng</Form.Label>
                <Form.Select 
                  size="lg" className="bg-light border-0" 
                  value={selectedWalletId} 
                  onChange={(e) => setSelectedWalletId(e.target.value)} required disabled={isUploading}
                >
                  <option value="">-- Chọn ví nhận dòng tiền --</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} (Số dư: {w.balance.toLocaleString('vi-VN')} đ)</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-medium text-muted small">File sao kê (.csv)</Form.Label>
                <div className="position-relative p-5 text-center bg-light rounded-4" style={{ border: '2px dashed var(--color-border)' }}>
                  <FileSpreadsheet size={48} className="text-muted mb-3 opacity-50" />
                  <div>
                    <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>Nhấn vào đây để chọn file</span>
                  </div>
                  
                  <Form.Control 
                    type="file" accept=".csv" onChange={handleFileChange} disabled={isUploading}
                    className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: 'pointer' }}
                  />
                </div>
                
                {selectedFile && (
                  <div className="mt-3 p-3 bg-primary-lighter rounded-3 d-flex align-items-center border border-primary border-opacity-25">
                    <FileSpreadsheet size={20} className="me-2 text-primary" />
                    <span className="fw-medium text-primary flex-grow-1 text-truncate">{selectedFile.name}</span>
                  </div>
                )}
              </Form.Group>

              <Button 
                type="submit" size="lg" className="w-100 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center mt-4"
                style={{ backgroundColor: 'var(--color-primary)' }} disabled={!selectedFile || isUploading}
              >
                {isUploading ? <><Spinner animation="border" size="sm" className="me-2" /> Đang phân tích AI...</> : "Bắt đầu Import CSV"}
              </Button>
            </Form>

            {result && (
              <Card className="border-0 rounded-4 shadow-sm mt-4" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <CheckCircle2 size={24} className="me-2 text-success" />
                    <h5 className="fw-bold mb-0 text-success">Import CSV Thành Công!</h5>
                  </div>
                  <div className="d-flex justify-content-between text-dark fw-medium">
                    <span>Tổng số dòng: <strong className="ms-1 fs-5 text-primary">{result.totalRows}</strong></span>
                    <span>Thêm mới: <strong className="ms-1 fs-5 text-success">{result.successRows}</strong></span>
                    <span>Trùng lặp: <strong className="ms-1 fs-5 text-warning">{result.duplicatedRows}</strong></span>
                  </div>
                </Card.Body>
              </Card>
            )}

          </Card.Body>
        </Card>
      </div>
    </div>
  );
}