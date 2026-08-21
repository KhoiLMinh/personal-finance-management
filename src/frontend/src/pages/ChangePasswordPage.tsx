import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert, Spinner, Row, Col } from 'react-bootstrap';
import { ArrowLeft, KeyRound, Eye, EyeOff } from 'lucide-react';
import authService from '../services/authService';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [message, setMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (formData.newPassword !== formData.confirmPassword) {
      setMessage({ type: 'danger', text: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setIsLoading(true);

    try {
      await authService.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword
      });

      setMessage({ type: 'success', text: 'Thay đổi mật khẩu thành công! Đang quay lại...' });
      setFormData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      
      setTimeout(() => navigate('/profile'), 2000);

    } catch (error: any) {
      console.error("Lỗi đổi mật khẩu:", error);
      
      const errorMsg = error.response?.data?.error?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!';
      setMessage({ type: 'danger', text: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 flex-grow-1 d-flex flex-column align-items-center justify-content-center" style={{ backgroundColor: '#e2e8f0' }}>
      <Row className="w-100 justify-content-center">
        <Col md={8} lg={6} xl={5}>
          
          <Link to="/profile" className="btn btn-link text-decoration-none text-muted mb-3 px-0 d-flex align-items-center">
            <ArrowLeft size={18} className="me-2" /> Quay lại hồ sơ
            </Link>

          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4 p-md-5">
              <div className="text-center mb-4">
                <div 
                  className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                  style={{ width: '64px', height: '64px', backgroundColor: '#fee2e2' }}
                >
                  <KeyRound size={32} className="text-danger" />
                </div>
                <h4 className="fw-bold text-dark">Đổi Mật Khẩu</h4>
                <p className="text-muted small">Vui lòng nhập mật khẩu cũ và mật khẩu mới để bảo vệ tài khoản của bạn.</p>
              </div>

              {message.text && (
                <Alert variant={message.type} className="py-2 small fw-medium text-center rounded-3">
                  {message.text}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3 position-relative">
                  <Form.Label className="small fw-bold text-secondary">MẬT KHẨU HIỆN TẠI</Form.Label>
                  <Form.Control 
                    size="lg"
                    type={showOldPass ? "text" : "password"} 
                    className="bg-light border-0 pe-5" 
                    name="oldPassword" 
                    value={formData.oldPassword} 
                    onChange={handleChange} 
                    required 
                  />
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary" style={{ cursor: 'pointer', marginTop: '12px' }} onClick={() => setShowOldPass(!showOldPass)}>
                    {showOldPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3 position-relative">
                  <Form.Label className="small fw-bold text-secondary">MẬT KHẨU MỚI</Form.Label>
                  <Form.Control 
                    size="lg"
                    type={showNewPass ? "text" : "password"} 
                    className="bg-light border-0 pe-5" 
                    name="newPassword" 
                    value={formData.newPassword} 
                    onChange={handleChange} 
                    required 
                  />
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary" style={{ cursor: 'pointer', marginTop: '12px' }} onClick={() => setShowNewPass(!showNewPass)}>
                    {showNewPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </Form.Group>

                <Form.Group className="mb-4 position-relative">
                  <Form.Label className="small fw-bold text-secondary">XÁC NHẬN MẬT KHẨU MỚI</Form.Label>
                  <Form.Control 
                    size="lg"
                    type={showConfirmPass ? "text" : "password"} 
                    className="bg-light border-0 pe-5" 
                    name="confirmPassword" 
                    value={formData.confirmPassword} 
                    onChange={handleChange} 
                    required 
                  />
                  <div className="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary" style={{ cursor: 'pointer', marginTop: '12px' }} onClick={() => setShowConfirmPass(!showConfirmPass)}>
                    {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </div>
                </Form.Group>

                <div className="d-grid mt-2">
                  <Button variant="danger" type="submit" className="fw-bold py-3 rounded-pill shadow-sm border-0 d-flex justify-content-center align-items-center" disabled={isLoading}>
                    {isLoading ? (
                      <><Spinner as="span" animation="border" size="sm" className="me-2" /> Đang xử lý...</>
                    ) : (
                      <><KeyRound size={18} className="me-2"/> Đổi mật khẩu ngay</>
                    )}
                  </Button>
                </div>
              </Form>
              
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}