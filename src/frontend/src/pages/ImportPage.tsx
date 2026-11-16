import React, { useEffect, useState } from 'react';
import { Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { FileSpreadsheet, CheckCircle2, Columns } from 'lucide-react';
import { Link } from 'react-router-dom';

import walletService from '../services/walletService';
import { importService } from '../services/aiService';
import { EmptyState, LoadingState } from '../components/ui/PageState';
import { canWriteWallet } from '../utils/wallet';

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
      // import writes transactions, so VIEW-only shared wallets are not offered
      const walletRes = (await walletService.getMyWallets()).filter(canWriteWallet);
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

  const STEPS = ['Chọn ví và file', 'Ghép cột', 'Kết quả'];
  const current = result && step === 1 ? 3 : step;
  const columns: { key: keyof typeof mapping; label: string; hint: string }[] = [
    { key: 'dateCol', label: 'Ngày giao dịch', hint: 'VD: 15/08/2026 hoặc 2026-08-15' },
    { key: 'amountCol', label: 'Số tiền', hint: 'Số âm là khoản chi, số dương là khoản thu' },
    { key: 'descCol', label: 'Nội dung', hint: 'Dùng để tự phân loại và phát hiện trùng' },
  ];

  if (loadingData) return <div className="page"><div className="panel"><LoadingState /></div></div>;

  return (
    <div className="page">
      <section className="panel mx-auto" style={{ maxWidth: 820 }}>
        <ol className="import-steps" aria-label="Các bước nhập sao kê">
          {STEPS.map((label, idx) => (
            <li key={label} className={idx + 1 === current ? 'active' : idx + 1 < current ? 'done' : ''} aria-current={idx + 1 === current ? 'step' : undefined}>
              <span className="import-step-no">{idx + 1}</span> {label}
            </li>
          ))}
        </ol>

        <div className="panel-body">
          {errorMsg && <Alert variant="danger" className="py-2 small">{errorMsg}</Alert>}

          {wallets.length === 0 ? (
            <EmptyState title="Chưa có ví nào nhận được giao dịch" description="Bạn cần một ví của mình (hoặc ví được chia sẻ quyền chỉnh sửa) để nhập sao kê."
              action={<Link to="/wallets" className="btn btn-primary btn-sm">Tạo ví</Link>} />
          ) : step === 1 ? (
            <Form onSubmit={handlePreview}>
              <Form.Group className="mb-3" controlId="imp-wallet">
                <Form.Label className="small text-secondary">Nhập vào ví</Form.Label>
                <Form.Select value={selectedWalletId} onChange={(e) => setSelectedWalletId(e.target.value)} required>
                  <option value="">Chọn ví</option>
                  {wallets.map(w => (
                    <option key={w.id} value={w.id}>{w.name} · {Number(w.balance).toLocaleString('vi-VN')} đ</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3" controlId="imp-file">
                <Form.Label className="small text-secondary">File sao kê (.csv, .xlsx, .xls)</Form.Label>
                <label htmlFor="imp-file" className="import-drop">
                  <FileSpreadsheet size={28} aria-hidden className="text-secondary" />
                  <span className="fw-medium">{selectedFile ? selectedFile.name : 'Chọn file từ máy'}</span>
                  <span className="small text-secondary">{selectedFile ? 'Bấm để chọn file khác' : 'Dòng đầu tiên phải là tiêu đề cột'}</span>
                </label>
                <Form.Control type="file" accept=".csv,.xlsx,.xls" onChange={handleFileChange} className="visually-hidden" />
              </Form.Group>

              <Button type="submit" className="w-100 d-inline-flex align-items-center justify-content-center gap-2" disabled={!selectedFile || isProcessing}>
                {isProcessing ? <Spinner size="sm" /> : <Columns size={18} aria-hidden />} Đọc cột trong file
              </Button>
            </Form>
          ) : (
            <Form onSubmit={handleFinalImport}>
              <p className="small text-secondary">
                File <span className="fw-medium text-ink">{selectedFile?.name}</span> có {headers.length} cột. Chọn cột tương ứng cho từng thông tin; hệ thống đã đoán sẵn theo tên cột.
              </p>
              <Row className="g-3 mb-3">
                {columns.map(({ key, label, hint }) => (
                  <Col md={4} key={key}>
                    <Form.Group controlId={`imp-${key}`}>
                      <Form.Label className="small fw-semibold mb-1">{label}</Form.Label>
                      <Form.Select value={mapping[key]} onChange={(e) => setMapping({ ...mapping, [key]: e.target.value })} required>
                        <option value="">Chọn cột</option>
                        {headers.map((h, idx) => <option key={idx} value={idx}>{h || `Cột ${idx + 1}`}</option>)}
                      </Form.Select>
                      <Form.Text className="small">{hint}</Form.Text>
                    </Form.Group>
                  </Col>
                ))}
              </Row>
              <Alert variant="light" className="small border mb-3">
                Giao dịch được ghi vào ví ngay khi bạn bấm <strong>Nhập giao dịch</strong>. Dòng trùng ngày, số tiền và nội dung với giao dịch đã có sẽ được bỏ qua; nếu có dòng sai định dạng, cả file sẽ không được nhập.
              </Alert>
              <div className="d-flex gap-2 justify-content-end">
                <Button variant="outline-secondary" onClick={() => { setStep(1); setHeaders([]); setSelectedFile(null); }}>Chọn file khác</Button>
                <Button type="submit" disabled={isProcessing} className="d-inline-flex align-items-center gap-2">
                  {isProcessing && <Spinner animation="border" size="sm" />} {isProcessing ? 'Đang nhập và phân loại…' : 'Nhập giao dịch'}
                </Button>
              </div>
            </Form>
          )}

          {result && step === 1 && (
            <div className="mt-4 p-3 rounded" style={{ background: 'var(--income-tint)' }} role="status">
              <div className="d-flex align-items-center gap-2 fw-semibold text-income mb-2">
                <CheckCircle2 size={18} aria-hidden /> Đã nhập xong {result.fileName}
              </div>
              <div className="d-flex flex-wrap gap-4 small">
                <span>Dòng đọc được: <strong className="num">{result.totalRows}</strong></span>
                <span>Thêm mới: <strong className="num">{result.successRows}</strong></span>
                <span>Bỏ qua vì trùng: <strong className="num">{result.duplicatedRows}</strong></span>
              </div>
              <Link to="/transactions" className="small d-inline-block mt-2">Xem giao dịch vừa nhập</Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
