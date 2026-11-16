import { useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const PAGE_TITLES = [
  { path: '/dashboard', title: 'Tổng quan' },
  { path: '/transactions', title: 'Giao dịch' },
  { path: '/saving-goals', title: 'Mục tiêu tiết kiệm' },
  { path: '/budgets', title: 'Ngân sách' },
  { path: '/reports', title: 'Báo cáo' },
  { path: '/wallets', title: 'Ví' },
  { path: '/bills', title: 'Hóa đơn định kỳ' },
  { path: '/import', title: 'Nhập sao kê' },
  { path: '/family', title: 'Gia đình' },
  { path: '/ai-assistant', title: 'Trợ lý AI' },
  { path: '/profile', title: 'Tài khoản' },
  { path: '/change-password', title: 'Đổi mật khẩu' },
  { path: '/admin/users', title: 'Quản lý người dùng' },
  { path: '/admin/categories', title: 'Danh mục hệ thống' },
  { path: '/admin/configs', title: 'Cấu hình hệ thống' },
  { path: '/categories', title: 'Danh mục' },
];

export default function MainLayout() {
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const currentTitle = useMemo(() => {
    const matchedRoute = PAGE_TITLES.find(route => location.pathname.startsWith(route.path));
    return matchedRoute ? matchedRoute.title : 'FinManage';
  }, [location.pathname]);

  return (
    <div className="d-flex vh-100 overflow-hidden" style={{ background: 'var(--canvas)' }}>
      <Sidebar show={navOpen} onHide={() => setNavOpen(false)} />
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden" style={{ minWidth: 0 }}>
        <Header title={currentTitle} onOpenNav={() => setNavOpen(true)} />
        <main className="flex-grow-1 overflow-auto d-flex flex-column">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
