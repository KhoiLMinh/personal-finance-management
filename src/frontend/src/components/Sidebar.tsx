import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { LayoutDashboard, ReceiptText, PiggyBank, PieChart, WalletCards, UploadCloud, Bot, Settings, LogOut, Wallet, Users, List, Calculator, CalendarClock, Settings2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `d-flex align-items-center px-4 py-3 text-decoration-none fw-medium rounded-3 mx-2 mb-1 ${
      isActive
        ? 'text-white'
        : 'text-dark hover-bg-light'
    }`;

  const navLinkStyle = ({ isActive }: { isActive: boolean }) =>
    isActive ? { backgroundColor: 'var(--color-primary)' } : undefined;

  return (
    <div className="bg-white border-end d-flex flex-column h-100" style={{ width: '260px', zIndex: 1000 }}>
      <div className="d-flex align-items-center gap-2 justify-content-center border-bottom py-4 flex-shrink-0" style={{ height: '70px' }}>
        <div
          className="d-flex align-items-center justify-content-center rounded-3"
          style={{ width: 34, height: 34, backgroundColor: 'var(--color-primary-light)' }}
        >
          <Wallet size={18} color="var(--color-primary)" />
        </div>
        <h3 className="fw-bolder mb-0" style={{ color: 'var(--color-primary-darker)' }}>FinManage</h3>
      </div>

      <div className="flex-grow-1 overflow-auto py-3">
        {user?.role === 'ADMIN' ? (
          <>
            <div className="px-4 py-2 mt-1 mb-2 text-uppercase small fw-bold" style={{ color: 'var(--color-primary)', letterSpacing: '1px' }}>
              Quản trị hệ thống
            </div>
            <NavLink to="/admin/users" className={navLinkClass} style={navLinkStyle}>
              <Users size={20} className="me-3" /> Quản lý Người dùng
            </NavLink>
            <NavLink to="/admin/categories" className={navLinkClass} style={navLinkStyle}>
              <List size={20} className="me-3" /> Danh mục mặc định
            </NavLink>
            <NavLink to="/admin/configs" className={navLinkClass} style={navLinkStyle}>
              <Settings2 size={20} className="me-3" /> Cấu hình hệ thống
            </NavLink>
          </>
        ) : (
          <>
            <NavLink to="/dashboard" className={navLinkClass} style={navLinkStyle}><LayoutDashboard size={20} className="me-3" /> Tổng quan</NavLink>
            <NavLink to="/transactions" className={navLinkClass} style={navLinkStyle}><ReceiptText size={20} className="me-3" /> Sổ giao dịch</NavLink>
            <NavLink to="/saving-goals" className={navLinkClass} style={navLinkStyle}><PiggyBank size={20} className="me-3" /> Tiết kiệm</NavLink>
            <NavLink to="/budgets" className={navLinkClass} style={navLinkStyle}><PieChart size={20} className="me-3" /> Ngân sách</NavLink>
            <NavLink to="/wallets" className={navLinkClass} style={navLinkStyle}><WalletCards size={20} className="me-3" /> Tài khoản ví</NavLink>
            <NavLink to="/bills" className={navLinkClass} style={navLinkStyle}>
              <CalendarClock size={20} className="me-3" /> Hóa đơn định kỳ
            </NavLink>
            <NavLink to="/import" className={navLinkClass} style={navLinkStyle}><UploadCloud size={20} className="me-3" /> Nhập sao kê</NavLink>
            <NavLink to="/family" className={navLinkClass} style={navLinkStyle}><Users size={20} className="me-3" /> Gia đình</NavLink>
            <NavLink to="/tools" className={navLinkClass} style={navLinkStyle}><Calculator size={20} className="me-3" /> Công cụ</NavLink>
            <hr className="my-3 mx-4 text-muted" />
            <NavLink to="/ai-assistant" className={navLinkClass} style={navLinkStyle}><Bot size={20} className="me-3" /> Hỏi trợ lý AI</NavLink>
          </>
        )}

        {user?.role === 'ADMIN' && <hr className="my-3 mx-4 text-muted" />}
        <NavLink to="/profile" className={navLinkClass} style={navLinkStyle}>
          <Settings size={20} className="me-3" /> Cài đặt tài khoản
        </NavLink>
      </div>

      <div className="p-3 border-top d-flex align-items-center justify-content-between flex-shrink-0">
        <div className="d-flex align-items-center overflow-hidden">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 40, height: 40, backgroundColor: 'var(--color-primary-light)' }}
          >
            <span className="fw-bold fs-5" style={{ color: 'var(--color-primary)' }}>
              {user?.fullName?.charAt(0) || 'U'}
            </span>
          </div>
          <div className="ms-3 lh-sm text-truncate">
            <div className="fw-bold text-dark text-truncate">{user?.fullName || user?.username}</div>
            <small className="text-muted">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Tài khoản người dùng'}</small>
          </div>
        </div>
        <Dropdown drop="up">
          <Dropdown.Toggle variant="light" className="border-0 bg-transparent p-1 shadow-none hide-caret">
            <LogOut size={18} className="text-muted" />
          </Dropdown.Toggle>
          <Dropdown.Menu className="shadow border-0 rounded-3">
            <Dropdown.Item onClick={handleLogout} className="text-danger fw-medium">
              <LogOut size={16} className="me-2" /> Đăng xuất
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </div>
    </div>
  );
}