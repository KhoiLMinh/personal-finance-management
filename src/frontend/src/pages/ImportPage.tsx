import React, { useEffect, useState } from 'react';
import { Card, Button, Form, Spinner, Row, Col, Alert, Tabs, Tab } from 'react-bootstrap';
import { UploadCloud, FileSpreadsheet, CheckCircle2, Camera, Scan, Save } from 'lucide-react';

import walletService from '../services/walletService';
import categoryService from '../services/categoryService';
import transactionService from '../services/transactionService';
import aiService, { importService } from '../services/aiService';
import MySpinner from '../components/MySpinner';

interface ImportResult {
  fileName: string;
  totalRows: number;
  successRows: number;
  duplicatedRows: number;
}
//FR06
export default function ImportPage() {
  const [wallets, setWallets] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);


  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<ImportResult | null>(null);


  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [walletRes, catRes] = await Promise.all([
        walletService.getMyWallets(),
        categoryService.getMyCategories()
      ]);
      setWallets(walletRes);
      setCategories(catRes);
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
      console.error(error);
      setErrorMsg(error.response?.data?.error?.message || 'Lỗi khi nhập sao kê. Vui lòng kiểm tra lại định dạng file!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setScannedData(null);
    }
  };

  const handleScanReceipt = async () => {
    if (!selectedImage) return;
    setIsScanning(true);
    try {
      const res = await aiService.scanReceipt(selectedImage);
      
      let formattedDate = new Date().toISOString().split('T')[0];
      if (res.date && res.date.includes('/')) {
        const parts = res.date.split('/');
        if (parts.length === 3) {
          formattedDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
      }

      setScannedData({
        amount: res.amount || '',
        date: formattedDate,
        description: res.description || '',
        categoryId: res.categoryId || (categories.length > 0 ? categories[0].id : ''),
        walletId: selectedWalletId
      });
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi quét ảnh. Đảm bảo ảnh rõ nét và đúng định dạng!");
    } finally {
      setIsScanning(false);
    }
  };

  const handleSaveScannedData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsUploading(true);
    try {
      await transactionService.createTransaction({
        type: 'EXPENSE',
        amount: Number(scannedData.amount),
        categoryId: Number(scannedData.categoryId),
        walletId: Number(scannedData.walletId),
        date: scannedData.date,
        description: scannedData.description
      });
      alert('Đã lưu giao dịch thành công!');
  
      setScannedData(null);
      setSelectedImage(null);
      setImagePreview('');
      window.dispatchEvent(new Event('reload-notifications'));
      fetchData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi lưu giao dịch!");
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
            <p className="text-muted mb-0">Tự động hóa ghi chép thông qua CSV sao kê hoặc Hình ảnh hóa đơn</p>
          </div>
          <div className="bg-primary-lighter p-2 rounded-circle">
            <UploadCloud size={32} color="var(--color-primary)" />
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4 justify-content-center">
        <Col md={10} lg={8} xl={7}>
          <Card className="border-0 rounded-4 shadow-soft h-100">
            <Card.Body className="p-4"> 
              <Tabs defaultActiveKey="csv" id="import-tabs" className="mb-4 custom-tabs fw-bold">
                
                <Tab eventKey="csv" title={<span className="d-flex align-items-center"><FileSpreadsheet size={18} className="me-2"/> Nhập CSV</span>}>
                  {errorMsg && <Alert variant="danger" className="border-0 rounded-3 fw-medium small">{errorMsg}</Alert>}
                  
                  <Form onSubmit={handleUploadCsv}>
                    <Form.Group className="mb-4 mt-2">
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
                      type="submit" size="lg" className="w-100 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center"
                      style={{ backgroundColor: 'var(--color-primary)' }} disabled={!selectedFile || isUploading}
                    >
                      {isUploading ? <><Spinner animation="border" size="sm" className="me-2" /> Đang phân tích AI...</> : "Bắt đầu Import CSV"}
                    </Button>
                  </Form>

                  {/* KẾT QUẢ IMPORT CSV */}
                  {result && (
                    <Card className="border-0 rounded-4 shadow-sm mt-4" style={{ backgroundColor: 'var(--color-success-bg)' }}>
                      <Card.Body className="p-3 px-4">
                        <div className="d-flex align-items-center mb-2">
                          <CheckCircle2 size={20} className="me-2 text-success" />
                          <h6 className="fw-bold mb-0 text-success">Import CSV Thành Công!</h6>
                        </div>
                        <div className="d-flex justify-content-between text-dark small">
                          <span>Tổng số dòng: <strong className="ms-1">{result.totalRows}</strong></span>
                          <span>Thêm mới: <strong className="ms-1">{result.successRows}</strong></span>
                          <span>Trùng lặp: <strong className="ms-1">{result.duplicatedRows}</strong></span>
                        </div>
                      </Card.Body>
                    </Card>
                  )}
                </Tab>

                <Tab eventKey="image" title={<span className="d-flex align-items-center"><Camera size={18} className="me-2"/> Quét Hóa Đơn</span>}>
                  {!scannedData ? (
                    <div className="mt-2">
                      <div className="position-relative p-4 text-center bg-light rounded-4 mb-4" style={{ border: '2px dashed var(--color-border)' }}>
                        {imagePreview ? (
                           <img src={imagePreview} alt="Receipt Preview" className="img-fluid rounded-3 shadow-sm" style={{ maxHeight: '250px', objectFit: 'contain' }} />
                        ) : (
                          <>
                            <Camera size={48} className="text-muted mb-3 opacity-50" />
                            <div className="fw-bold text-primary">Nhấn để chọn ảnh hóa đơn</div>
                          </>
                        )}
                        <Form.Control 
                          type="file" accept="image/*" onChange={handleImageChange} disabled={isScanning}
                          className="position-absolute top-0 start-0 w-100 h-100 opacity-0" style={{ cursor: 'pointer' }}
                        />
                      </div>

                      <Button 
                        size="lg" className="w-100 fw-bold rounded-pill border-0 d-flex align-items-center justify-content-center"
                        style={{ backgroundColor: 'var(--color-primary)' }} 
                        disabled={!selectedImage || isScanning}
                        onClick={handleScanReceipt}
                      >
                        {isScanning ? <><Spinner animation="border" size="sm" className="me-2" /> AI đang trích xuất dữ liệu...</> : <><Scan size={20} className="me-2"/> Quét Hóa Đơn AI</>}
                      </Button>
                    </div>
                  ) : (
                    <Form onSubmit={handleSaveScannedData} className="bg-light p-4 rounded-4 border mt-2">
                      <div className="d-flex align-items-center mb-3 text-success">
                        <CheckCircle2 size={24} className="me-2" />
                        <h6 className="fw-bold mb-0">Trích xuất thành công! Vui lòng xác nhận:</h6>
                      </div>
                      
                      <Form.Group className="mb-3">
                        <Form.Label className="text-muted small fw-medium">Số tiền (VNĐ)</Form.Label>
                        <Form.Control type="number" required className="border-0 shadow-sm" value={scannedData.amount} onChange={e => setScannedData({...scannedData, amount: e.target.value})} />
                      </Form.Group>

                      <Row>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted small fw-medium">Ngày</Form.Label>
                            <Form.Control type="date" required className="border-0 shadow-sm" value={scannedData.date} onChange={e => setScannedData({...scannedData, date: e.target.value})} />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group className="mb-3">
                            <Form.Label className="text-muted small fw-medium">Danh mục AI dự đoán</Form.Label>
                            <Form.Select required className="border-0 shadow-sm" value={scannedData.categoryId} onChange={e => setScannedData({...scannedData, categoryId: e.target.value})}>
                               <option value="">-- Chọn danh mục --</option>
                               {categories.filter(c => c.type === 'EXPENSE').map(c => (
                                  <option key={c.id} value={c.id}>{c.name}</option>
                               ))}
                            </Form.Select>
                          </Form.Group>
                        </Col>
                      </Row>

                      <Form.Group className="mb-3">
                        <Form.Label className="text-muted small fw-medium">Ví thanh toán</Form.Label>
                        <Form.Select required className="border-0 shadow-sm" value={scannedData.walletId} onChange={e => setScannedData({...scannedData, walletId: e.target.value})}>
                            {wallets.map(w => (
                              <option key={w.id} value={w.id}>{w.name} (Số dư: {w.balance.toLocaleString('vi-VN')} đ)</option>
                            ))}
                        </Form.Select>
                      </Form.Group>

                      <Form.Group className="mb-4">
                        <Form.Label className="text-muted small fw-medium">Nội dung</Form.Label>
                        <Form.Control type="text" className="border-0 shadow-sm" value={scannedData.description} onChange={e => setScannedData({...scannedData, description: e.target.value})} />
                      </Form.Group>

                      <div className="d-flex gap-2">
                        <Button variant="outline-secondary" className="rounded-pill fw-medium w-50" onClick={() => setScannedData(null)}>Hủy bỏ</Button>
                        <Button type="submit" variant="primary" className="rounded-pill fw-bold border-0 w-50 d-flex justify-content-center align-items-center" disabled={isUploading}>
                          {isUploading ? <Spinner size="sm"/> : <><Save size={18} className="me-1"/> Lưu giao dịch</>}
                        </Button>
                      </div>
                    </Form>
                  )}
                </Tab>

              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
}