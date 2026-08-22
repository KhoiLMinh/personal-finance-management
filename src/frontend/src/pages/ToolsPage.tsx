import React, { useState } from 'react';
import { Card, Form, Button, Row, Col, Spinner, Tabs, Tab, Table, Alert } from 'react-bootstrap';
import { Calculator, ArrowRightLeft, Landmark, Percent } from 'lucide-react';
import toolService from '../services/toolService';
import { formatCurrency } from '../utils/format';

export default function ToolsPage() {
  const [currencyData, setCurrencyData] = useState({ from: 'USD', to: 'VND', amount: '1' });
  const [currencyResult, setCurrencyResult] = useState<any>(null);
  const [currencyLoading, setCurrencyLoading] = useState(false);
  const [currencyError, setCurrencyError] = useState('');

  const [loanData, setLoanData] = useState({ principal: '100000000', annualRate: '10', months: '12', type: 'REDUCING' });
  const [loanResult, setLoanResult] = useState<any>(null);
  const [loanLoading, setLoanLoading] = useState(false);

  const CURRENCIES = ['VND', 'USD', 'EUR', 'JPY', 'GBP', 'CNY', 'KRW', 'SGD', 'THB', 'AUD'];

  const handleConvertCurrency = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setCurrencyLoading(true);
    setCurrencyError('');
    setCurrencyResult(null);
    try {
      const res = await toolService.convertCurrency(currencyData.from, currencyData.to, Number(currencyData.amount));
      setCurrencyResult(res.result);
    } catch (error: any) {
      setCurrencyError(error.response?.data?.error?.message || "Lỗi khi lấy tỷ giá!");
    } finally {
      setCurrencyLoading(false);
    }
  };

  const handleCalculateLoan = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setLoanLoading(true);
    setLoanResult(null);
    try {
      const payload = {
        principal: Number(loanData.principal),
        annualRate: Number(loanData.annualRate),
        months: Number(loanData.months),
        type: loanData.type
      };
      const res = await toolService.calculateLoanInterest(payload);
      setLoanResult(res.result);
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi tính toán!");
    } finally {
      setLoanLoading(false);
    }
  };

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <div className="bg-primary-lighter p-2 rounded-circle">
            <Calculator size={32} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="fw-bold mb-1" style={{ color: 'var(--color-primary-darker)' }}>Công cụ Tài chính</h3>
            <p className="text-muted mb-0">Hỗ trợ tính toán lãi suất vay và quy đổi tỷ giá ngoại tệ real-time</p>
          </div>
        </Card.Body>
      </Card>

      <Row className="justify-content-center">
        <Col xl={10}>
          <Card className="border-0 rounded-4 shadow-soft">
            <Card.Body className="p-4">
              <Tabs defaultActiveKey="currency" id="tools-tabs" className="mb-4 custom-tabs fw-bold">
                
                {/* TAB 1: ĐỔI NGOẠI TỆ */}
                <Tab eventKey="currency" title={<span className="d-flex align-items-center"><ArrowRightLeft size={18} className="me-2"/> Đổi Ngoại Tệ</span>}>
                  <Row className="g-4">
                    <Col md={5}>
                      <Form onSubmit={handleConvertCurrency} className="bg-light p-4 rounded-4 border">
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium text-muted small">Số tiền cần đổi</Form.Label>
                          <Form.Control type="number" step="0.01" min="0.01" required className="border-0 shadow-sm"
                            value={currencyData.amount} onChange={e => setCurrencyData({...currencyData, amount: e.target.value})} />
                        </Form.Group>
                        <Row>
                          <Col xs={6}>
                            <Form.Group className="mb-4">
                              <Form.Label className="fw-medium text-muted small">Từ đồng (From)</Form.Label>
                              <Form.Select className="border-0 shadow-sm fw-bold text-primary"
                                value={currencyData.from} onChange={e => setCurrencyData({...currencyData, from: e.target.value})}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col xs={6}>
                            <Form.Group className="mb-4">
                              <Form.Label className="fw-medium text-muted small">Sang đồng (To)</Form.Label>
                              <Form.Select className="border-0 shadow-sm fw-bold text-success"
                                value={currencyData.to} onChange={e => setCurrencyData({...currencyData, to: e.target.value})}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>
                        <Button type="submit" className="w-100 fw-bold rounded-pill border-0 py-2" disabled={currencyLoading} style={{ backgroundColor: 'var(--color-primary)' }}>
                          {currencyLoading ? <Spinner size="sm" className="me-2" /> : <ArrowRightLeft size={18} className="me-2" />}
                          Quy đổi tỷ giá
                        </Button>
                      </Form>
                      {currencyError && <Alert variant="danger" className="mt-3 small">{currencyError}</Alert>}
                    </Col>
                    
                    <Col md={7}>
                      {currencyResult ? (
                        <Card className="border-0 bg-primary-lighter h-100 rounded-4">
                          <Card.Body className="p-4 d-flex flex-column justify-content-center text-center">
                            <h6 className="text-muted fw-bold mb-3">Kết quả quy đổi</h6>
                            <h2 className="fw-bolder text-primary mb-2">
                              {currencyResult.originalAmount.toLocaleString()} {currencyResult.fromCurrency}
                            </h2>
                            <div className="text-muted mb-2"><ArrowRightLeft size={24}/></div>
                            <h1 className="fw-bolder text-success mb-4" style={{ fontSize: '3rem' }}>
                              {currencyResult.toCurrency === 'VND' 
                                ? formatCurrency(currencyResult.convertedAmount) 
                                : `${currencyResult.convertedAmount.toLocaleString()} ${currencyResult.toCurrency}`}
                            </h1>
                            <div className="small text-muted border-top pt-3">
                              Tỷ giá: 1 {currencyResult.fromCurrency} = {currencyResult.exchangeRate.toLocaleString()} {currencyResult.toCurrency}
                              <br/>
                              <small>Cập nhật lần cuối: {currencyResult.lastUpdate}</small>
                            </div>
                          </Card.Body>
                        </Card>
                      ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted border rounded-4 bg-light p-5 text-center">
                          Hãy nhập số tiền và chọn loại tiền tệ để xem kết quả quy đổi tỷ giá thị trường.
                        </div>
                      )}
                    </Col>
                  </Row>
                </Tab>

                {/* TAB 2: TÍNH LÃI VAY */}
                <Tab eventKey="loan" title={<span className="d-flex align-items-center"><Landmark size={18} className="me-2"/> Tính Lãi Vay</span>}>
                  <Row className="g-4">
                    <Col lg={4}>
                      <Form onSubmit={handleCalculateLoan} className="bg-light p-4 rounded-4 border">
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium text-muted small">Số tiền vay (VNĐ)</Form.Label>
                          <Form.Control type="number" min="100000" required className="border-0 shadow-sm"
                            value={loanData.principal} onChange={e => setLoanData({...loanData, principal: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium text-muted small">Lãi suất theo năm (%)</Form.Label>
                          <Form.Control type="number" step="0.1" min="0.1" required className="border-0 shadow-sm"
                            value={loanData.annualRate} onChange={e => setLoanData({...loanData, annualRate: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label className="fw-medium text-muted small">Kỳ hạn vay (Tháng)</Form.Label>
                          <Form.Control type="number" min="1" required className="border-0 shadow-sm"
                            value={loanData.months} onChange={e => setLoanData({...loanData, months: e.target.value})} />
                        </Form.Group>
                        <Form.Group className="mb-4">
                          <Form.Label className="fw-medium text-muted small">Phương thức tính lãi</Form.Label>
                          <Form.Select className="border-0 shadow-sm" value={loanData.type} onChange={e => setLoanData({...loanData, type: e.target.value})}>
                            <option value="REDUCING">Dư nợ giảm dần</option>
                            <option value="FLAT">Dư nợ ban đầu (Cố định)</option>
                          </Form.Select>
                        </Form.Group>
                        <Button type="submit" className="w-100 fw-bold rounded-pill border-0 py-2" disabled={loanLoading} style={{ backgroundColor: 'var(--color-primary)' }}>
                          {loanLoading ? <Spinner size="sm" className="me-2" /> : <Percent size={18} className="me-2" />}
                          Bắt đầu tính toán
                        </Button>
                      </Form>
                    </Col>
                    
                    <Col lg={8}>
                      {loanResult ? (
                        <div className="d-flex flex-column h-100">
                          <Row className="g-3 mb-3">
                            <Col sm={4}>
                              <Card className="border-0 bg-primary-lighter rounded-4 text-center p-3 h-100">
                                <span className="small text-muted fw-bold">Tổng tiền vay</span>
                                <h5 className="fw-bold text-primary mt-1 mb-0">{formatCurrency(loanResult.loanAmount)}</h5>
                              </Card>
                            </Col>
                            <Col sm={4}>
                              <Card className="border-0 bg-danger bg-opacity-10 rounded-4 text-center p-3 h-100">
                                <span className="small text-danger fw-bold">Tổng lãi phải trả</span>
                                <h5 className="fw-bold text-danger mt-1 mb-0">{formatCurrency(loanResult.totalInterest)}</h5>
                              </Card>
                            </Col>
                            <Col sm={4}>
                              <Card className="border-0 bg-success bg-opacity-10 rounded-4 text-center p-3 h-100">
                                <span className="small text-success fw-bold">Tổng gốc + lãi</span>
                                <h5 className="fw-bold text-success mt-1 mb-0">{formatCurrency(loanResult.totalPayment)}</h5>
                              </Card>
                            </Col>
                          </Row>

                          <div className="border rounded-4 overflow-hidden shadow-sm flex-grow-1 d-flex flex-column" style={{ maxHeight: '400px' }}>
                            <div className="bg-light p-3 border-bottom fw-bold text-dark d-flex justify-content-between align-items-center">
                              <span>Lịch trả nợ chi tiết</span>
                              <span className="badge bg-secondary">{loanResult.monthlyPaymentInfo}</span>
                            </div>
                            <div className="overflow-auto bg-white p-0">
                              <Table hover className="mb-0 small align-middle text-center">
                                <thead className="position-sticky top-0 bg-white" style={{ zIndex: 1 }}>
                                  <tr>
                                    <th className="py-2 text-muted">Kỳ (Tháng)</th>
                                    <th className="py-2 text-muted">Gốc phải trả</th>
                                    <th className="py-2 text-muted">Lãi phải trả</th>
                                    <th className="py-2 text-primary fw-bold">Tổng thanh toán</th>
                                    <th className="py-2 text-muted">Dư nợ còn lại</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {loanResult.schedule.map((row: any) => (
                                    <tr key={row.month}>
                                      <td className="fw-bold text-dark">{row.month}</td>
                                      <td>{formatCurrency(row.principalPaid)}</td>
                                      <td className="text-danger">{formatCurrency(row.interestPaid)}</td>
                                      <td className="fw-bold text-primary">{formatCurrency(row.totalPayment)}</td>
                                      <td>{formatCurrency(row.remainingBalance)}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="h-100 d-flex align-items-center justify-content-center text-muted border rounded-4 bg-light p-5 text-center">
                          Nhập thông tin khoản vay để xem chi tiết lịch trả nợ (Gốc và Lãi) qua từng tháng.
                        </div>
                      )}
                    </Col>
                  </Row>
                </Tab>

              </Tabs>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
}