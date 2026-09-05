import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert } from 'lucide-react';
import { Button } from 'react-bootstrap';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center w-100 h-100 p-5 text-center" style={{ backgroundColor: '#f8fafc', minHeight: '80vh' }}>
        <div className="bg-danger bg-opacity-10 p-4 rounded-circle mb-4">
          <ShieldAlert size={80} className="text-danger" />
        </div>
        <h1 className="fw-bolder text-dark mb-2" style={{ fontSize: '3rem' }}>403</h1>
        <h3 className="fw-bold text-dark mb-3">Truy cập bị từ chối!</h3>
        <p className="text-muted mb-4 fs-6" style={{ maxWidth: '400px' }}>
          Tài khoản của bạn không có đặc quyền quản trị viên (Admin) để xem trang này. Vui lòng quay lại trang tổng quan.
        </p>
        <Button 
          variant="primary" 
          className="rounded-pill px-4 py-2 fw-bold"
          onClick={() => window.location.href = '/dashboard'}
        >
          Quay về trang chủ
        </Button>
      </div>
    );
  }

  return <>{children}</>;
}