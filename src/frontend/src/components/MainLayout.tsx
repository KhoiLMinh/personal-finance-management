import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

const PAGE_TITLES = [
  { path: '/dashboard', title: 'Tổng quan tài chính' },
  { path: '/transactions', title: 'Sổ giao dịch' },
  { path: '/saving-goals', title: 'Mục tiêu tiết kiệm' },
  { path: '/budgets', title: 'Ngân sách chi tiêu' },
  { path: '/wallets', title: 'Quản lý ví' },
  { path: '/bills', title: 'Hóa đơn định kỳ' },
  { path: '/import', title: 'Nhập dữ liệu (Sao kê)' },
  { path: '/family', title: 'Quản lý Gia đình' },
  { path: '/ai-assistant', title: 'Trợ lý AI' },
  { path: '/profile', title: 'Hồ sơ cá nhân' },
  { path: '/change-password', title: 'Đổi mật khẩu' },
  { path: '/admin/users', title: 'Quản lý Người dùng' },
  { path: '/admin/categories', title: 'Danh mục hệ thống' },
  { path: '/admin/configs', title: 'Cấu hình hệ thống' },
  { path: '/categories', title: 'Tùy chỉnh danh mục' },
];

export default function MainLayout() {
  const location = useLocation();

  const currentTitle = useMemo(() => {
    const matchedRoute = PAGE_TITLES.find(route => location.pathname.startsWith(route.path));
    return matchedRoute ? matchedRoute.title : "FinManage";
  }, [location.pathname]);

  return (
    <Container fluid className="p-0 vh-100 overflow-hidden d-flex" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
        <Header title={currentTitle} />
        
        <main className="flex-grow-1 overflow-auto d-flex flex-column" style={{ backgroundColor: 'var(--color-bg)' }}>
          <Outlet />
          <Footer />
        </main>
      </div>
    </Container>
  );
}