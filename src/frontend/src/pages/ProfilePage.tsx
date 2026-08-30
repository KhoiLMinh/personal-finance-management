import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert, Image, Spinner, Badge } from 'react-bootstrap';
import { User, ShieldCheck, Mail, ShieldAlert, KeyRound, Save, Download, Upload, Database } from 'lucide-react';

import userService from '../services/userService';
import authService from '../services/authService';
import { useAuth } from '../context/AuthContext';
import MySpinner from '../components/MySpinner';
import { Link } from 'react-router-dom';
import { backupService } from '../services/backupService';

export default function ProfilePage() {
  const { user, login, token } = useAuth(); 
  const [loading, setLoading] = useState(true);

  const [profileData, setProfileData] = useState({ username: '', email: '', fullName: '', role: '' });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  const [passData, setPassData] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg, setPassMsg] = useState({ type: '', text: '' });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setProfileData({
        username: data.username,
        email: data.email,
        fullName: data.fullName || '',
        role: data.role
      });
    } catch (error) {
      console.error("Lỗi lấy thông tin cá nhân:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileMsg({ type: '', text: '' });
    try {
      await userService.updateProfile({ fullName: profileData.fullName });
      
      if (token) {
        const newData = await userService.getProfile();
        login(newData, token);
      }
      
      setProfileMsg({ type: 'success', text: 'Cập nhật hồ sơ thành công! 🎉' });
    } catch (error: any) {
      setProfileMsg({ type: 'danger', text: error.response?.data?.error?.message || 'Cập nhật thất bại!' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg({ type: '', text: '' });

    if (passData.newPassword !== passData.confirmPassword) {
      setPassMsg({ type: 'danger', text: 'Mật khẩu xác nhận không trùng khớp!' });
      return;
    }

    setPassSaving(true);
    try {
      await authService.changePassword({
        oldPassword: passData.oldPassword,
        newPassword: passData.newPassword
      });
      setPassMsg({ type: 'success', text: 'Đổi mật khẩu thành công! Hãy ghi nhớ mật khẩu mới nhé.' });
      setPassData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPassMsg({ type: 'danger', text: error.response?.data?.error?.message || 'Đổi mật khẩu thất bại!' });
    } finally {
      setPassSaving(false);
    }
  };

  const handleExport = async () => {
    try {
      await backupService.exportData();
      alert("Đã tải xuống bản sao lưu thành công!");
    } catch (error) {
      alert("Lỗi khi tải bản sao lưu.");
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!window.confirm("CẢNH BÁO: Việc phục hồi sẽ nạp thêm dữ liệu vào tài khoản của bạn. Bạn có chắc chắn muốn tiếp tục?")) {
      return;
    }

    setIsRestoring(true);
    try {
      await backupService.restoreData(file);
      alert("Phục hồi dữ liệu thành công! Trang sẽ tự động tải lại.");
      window.location.reload();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi khi phục hồi dữ liệu.");
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      <h3 className="fw-bold text-dark mb-4">Quản lý Tài khoản</h3>

      <Row className="g-4">
        
        <Col lg={5} xl={4}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden h-100">
            <div className="pt-5 pb-4 px-4 text-center" style={{ backgroundColor: 'var(--color-primary)' }}>
              <div 
                className="mx-auto rounded-circle d-flex align-items-center justify-content-center bg-white shadow mb-3"
                style={{ width: '100px', height: '100px', border: '4px solid rgba(255,255,255,0.8)' }}
              >
                <span className="fw-bold text-primary" style={{ fontSize: '2.5rem' }}>
                  {profileData.fullName ? profileData.fullName.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <h5 className="fw-bold text-white mb-1">{profileData.fullName || profileData.username}</h5>
              <Badge bg="light" text="primary" className="fw-medium px-3 py-1 rounded-pill">
                {profileData.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên tài khoản'}
              </Badge>
            </div>

            <Card.Body className="p-4">
              <h6 className="fw-bold text-dark mb-3">Chỉnh sửa hồ sơ</h6>
              
              {profileMsg.text && (
                <Alert variant={profileMsg.type} className="py-2 small rounded-3 fw-medium">
                  {profileMsg.text}
                </Alert>
              )}

              <Form onSubmit={handleUpdateProfile}>
                <Form.Group className="mb-4">
                  <Form.Label className="text-muted small fw-medium mb-1">Họ và tên hiển thị</Form.Label>
                  <Form.Control 
                    size="lg"
                    type="text" 
                    value={profileData.fullName} 
                    onChange={(e) => setProfileData({...profileData, fullName: e.target.value})}
                    className="bg-light border-0"
                    placeholder="Nhập tên của bạn..."
                    required
                  />
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 rounded-pill fw-bold py-2 d-flex justify-content-center align-items-center border-0"
                  disabled={profileSaving}
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  {profileSaving ? <Spinner size="sm" className="me-2" /> : <Save size={18} className="me-2" />}
                  Lưu thay đổi
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={7} xl={8}>
          
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div className="bg-primary-light p-2 rounded-circle me-3">
                  <ShieldCheck size={24} className="text-primary" />
                </div>
                <h5 className="fw-bold mb-0 text-dark">Thông tin xác thực</h5>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                      <User size={14} className="me-1"/> Tên đăng nhập (Username)
                    </Form.Label>
                    <Form.Control size="lg" type="text" value={profileData.username} className="bg-light border-0 text-muted" disabled />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="text-muted small fw-medium mb-1 d-flex align-items-center">
                      <Mail size={14} className="me-1"/> Địa chỉ Email
                    </Form.Label>
                    <Form.Control size="lg" type="email" value={profileData.email} className="bg-light border-0 text-muted" disabled />
                  </Form.Group>
                </Col>
              </Row>
              <div className="text-muted small mt-3 d-flex align-items-center">
                <ShieldAlert size={14} className="me-1 text-warning"/> 
                <em>Email và Username là thông tin định danh hệ thống, không thể thay đổi.</em>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Body className="p-4 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <div className="p-2 rounded-circle me-3" style={{ backgroundColor: '#fee2e2' }}>
                  <KeyRound size={24} className="text-danger" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Mật khẩu và bảo mật</h5>
                  <small className="text-muted">Cập nhật mật khẩu để bảo vệ tài khoản</small>
                </div>
              </div>
              <Link to="/change-password" className="btn btn-danger fw-bold rounded-pill px-4">
                Đổi mật khẩu
              </Link>
            </Card.Body>
          </Card>

          {/* COMPONENT SAO LƯU & PHỤC HỒI DỮ LIỆU */}
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-3">
                <div className="p-2 rounded-circle me-3" style={{ backgroundColor: '#d1fae5' }}>
                  <Database size={24} className="text-success" />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark">Sao lưu & Phục hồi dữ liệu</h5>
                  <small className="text-muted">Lưu trữ an toàn toàn bộ dữ liệu tài chính (.json)</small>
                </div>
              </div>
              
              <p className="text-muted small mb-4 ms-5">
                Bạn có thể tải xuống toàn bộ dữ liệu chi tiêu, danh mục, ngân sách và mục tiêu tiết kiệm. 
                Hoặc tải lên file sao lưu cũ để phục hồi. 
              </p>

              <div className="d-flex gap-3 ms-5">
                <Button 
                  variant="outline-primary" 
                  className="rounded-pill px-4 fw-medium d-flex align-items-center" 
                  onClick={handleExport}
                >
                  <Download size={18} className="me-2" />
                  Tải bản sao lưu
                </Button>
                
                <Button 
                  variant="success" 
                  className="rounded-pill px-4 fw-medium text-white d-flex align-items-center" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRestoring}
                >
                  {isRestoring ? <Spinner size="sm" className="me-2" /> : <Upload size={18} className="me-2" />}
                  {isRestoring ? 'Đang phục hồi...' : 'Phục hồi dữ liệu'}
                </Button>

                <input 
                  type="file" 
                  accept=".json" 
                  ref={fileInputRef} 
                  onChange={handleRestore} 
                  className="d-none" 
                />
              </div>
            </Card.Body>
          </Card>

        </Col>
      </Row>
      
    </div>
  );
}