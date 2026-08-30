import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Columns } from 'lucide-react';

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

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [headers, setHeaders] = useState<string[]>([]);
  const [mapping, setMapping] = useState({ dateCol: '', amountCol: '', descCol: '' });

  const [isProcessing, setIsProcessing] = useState(false);
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
      const validExtensions = ['.csv', '.xlsx', '.xls'];
      const isValid = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isValid) {
        setErrorMsg('Hệ thống chỉ hỗ trợ định dạng .csv, .xlsx, .xls');
        setSelectedFile(null);
        e.target.value = '';
      } else {
        setErrorMsg('');
        setSelectedFile(file);
      }
    }
  };

  const handlePreview = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedWalletId) {
      setErrorMsg('Vui lòng chọn ví và file để tải lên!');
      return;
    }
    setIsProcessing(true);
    setErrorMsg('');
    
    try {
      const data = await importService.previewFile(selectedFile);
      setHeaders(data.headers);
      
      let guessDate = '', guessAmount = '', guessDesc = '';
      data.headers.forEach((h: string, idx: number) => {
        const lowerH = h.toLowerCase();
        if (lowerH.includes('ngày') || lowerH.includes('date') || lowerH.includes('thời gian')) guessDate = idx.toString();
        if (lowerH.includes('tiền') || lowerH.includes('amount') || lowerH.includes('phát sinh')) guessAmount = idx.toString();
        if (lowerH.includes('nội dung') || lowerH.includes('ghi chú') || lowerH.includes('desc')) guessDesc = idx.toString();
      });

      setMapping({ dateCol: guessDate, amountCol: guessAmount, descCol: guessDesc });
      setStep(2); 
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || 'Lỗi khi đọc file. File bị hỏng hoặc không đúng chuẩn!');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalImport = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!mapping.dateCol || !mapping.amountCol || !mapping.descCol) {
      setErrorMsg('Vui lòng ánh xạ đầy đủ 3 cột bắt buộc: Ngày, Số tiền, và Nội dung!');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    try {
      const response = await importService.importData(
        Number(selectedWalletId),
        Number(mapping.dateCol),
        Number(mapping.amountCol),
        Number(mapping.descCol),
        selectedFile!
      );
      setResult(response);
      window.dispatchEvent(new Event('reload-notifications'));
      await fetchData();
      setStep(1);
      setSelectedFile(null);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error?.message || 'Lỗi khi xử lý dữ liệu. Vui lòng kiểm tra lại file!');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loadingData) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary-darker)' }}>Nhập Sao kê (Excel / CSV)</h3>
            <p className="text-muted mb-0">Ánh xạ cột linh hoạt & Phân tích thông minh bằng AI</p>
          </div>
          <div className="bg-primary-lighter p-2 rounded-circle">
            <UploadCloud size={32} color="var(--color-primary)" />
          </div>
        </Card.Body>
      </Card>

      <div className="d-flex justify-content-center">
        <Card className="border-0 rounded-4 shadow-soft w-100" style={{ maxWidth: '850px' }}>
          <Card.Body className="p-4 p-md-5"> 
            
            <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
              <FileSpreadsheet size={24} className="me-2 text-primary"/>
              <h5 className="fw-bold mb-0 text-dark">
                {step === 1 ? 'Bước 1: Tải lên file sao kê' : 'Bước 2: Cấu hình ánh xạ cột dữ liệu'}
              </h5>
            </div>

            {errorMsg && <Alert variant="danger" className="border-0 rounded-3 fw-medium small">{errorMsg}</Alert>}
            
            {step === 1 ? (
              <Form onSubmit={handlePreview}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small">Chọn Ví nhận dòng tiền</Form.Label>
                  <Form.Select size="lg" className="bg-light border-0" value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)} required>
                    <option value="">-- Chọn ví --</option>
                    {wallets.map(w => (
                      <option key={w.id} value={w.id}>{w.name} (Số dư: {w.balance.toLocaleString('vi-VN')} đ)</option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-medium text-muted small">File sao kê (.csv, .xlsx, .xls)</Form.Label>
                  <div className="position-relative p-5 text-center bg-light rounded-4" style={{ border: '2px dashed var(--color-border)' }}>
                    <FileSpreadsheet size={48} className="text-muted mb-3 opacity-50" />
                    <div>
                      <span className="fw-bold" style={{ color: 'var(--color-primary)' }}>Nhấn vào đây để chọn file Excel/CSV</span>
                    </div>
                    <Form.Control type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: 'pointer' }} />
                  </div>
                  {selectedFile && (
                    <div className="mt-3 p-3 bg-primary-lighter rounded-3 d-flex align-items-center border border-primary border-opacity-25">
                      <FileSpreadsheet size={20} className="me-2 text-primary" />
                      <span className="fw-medium text-primary flex-grow-1 text-truncate">{selectedFile.name}</span>
                    </div>
                  )}
                </Form.Group>

                <Button type="submit" size="lg" className="w-100 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--color-primary)' }} disabled={!selectedFile || isProcessing}>
                  {isProcessing ? <Spinner size="sm" className="me-2" /> : <Columns size={20} className="me-2" />} Phân tích File
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleFinalImport}>
                <Alert variant="info" className="small border-0 mb-4 rounded-3 d-flex align-items-start">
                  <Columns size={18} className="me-2 flex-shrink-0 mt-1" />
                  <div>Hệ thống đã nhận diện được <strong>{headers.length}</strong> cột trong file của bạn. Hãy chọn đúng các cột tương ứng để nhập liệu.</div>
                </Alert>

                <Row className="g-4 mb-4">
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-dark">Cột NGÀY GIAO DỊCH <span className="text-danger">*</span></Form.Label>
                      <Form.Select size="lg" className="bg-light border-0" value={mapping.dateCol} onChange={(e) => setMapping({...mapping, dateCol: e.target.value})} required>
                        <option value="">-- Trống --</option>
                        {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-dark">Cột SỐ TIỀN <span className="text-danger">*</span></Form.Label>
                      <Form.Select size="lg" className="bg-light border-0" value={mapping.amountCol} onChange={(e) => setMapping({...mapping, amountCol: e.target.value})} required>
                        <option value="">-- Trống --</option>
                        {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={4}>
                    <Form.Group>
                      <Form.Label className="fw-bold small text-dark">Cột NỘI DUNG <span className="text-danger">*</span></Form.Label>
                      <Form.Select size="lg" className="bg-light border-0" value={mapping.descCol} onChange={(e) => setMapping({...mapping, descCol: e.target.value})} required>
                        <option value="">-- Trống --</option>
                        {headers.map((h, i) => <option key={i} value={i}>{h}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3">
                  <Button variant="light" size="lg" className="fw-bold rounded-pill text-muted px-4" onClick={() => { setStep(1); setHeaders([]); setSelectedFile(null); }}>
                    Hủy bỏ
                  </Button>
                  <Button type="submit" size="lg" className="flex-grow-1 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center" style={{ backgroundColor: 'var(--color-primary)' }} disabled={isProcessing}>
                    {isProcessing ? <><Spinner animation="border" size="sm" className="me-2" /> Đang phân tích AI...</> : "Bắt đầu Nhập dữ liệu"}
                  </Button>
                </div>
              </Form>
            )}

            {result && step === 1 && (
              <Card className="border-0 rounded-4 shadow-sm mt-4" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                <Card.Body className="p-4">
                  <div className="d-flex align-items-center mb-3">
                    <CheckCircle2 size={24} className="me-2 text-success" />
                    <h5 className="fw-bold mb-0 text-success">Import Thành Công!</h5>
                  </div>
                  <div className="d-flex justify-content-between text-dark fw-medium">
                    <span>Tổng số dòng: <strong className="ms-1 fs-5 text-primary">{result.totalRows}</strong></span>
                    <span>Thêm mới: <strong className="ms-1 fs-5 text-success">{result.successRows}</strong></span>
                    <span>Bỏ qua (Trùng/Lỗi): <strong className="ms-1 fs-5 text-warning">{result.totalRows - result.successRows}</strong></span>
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