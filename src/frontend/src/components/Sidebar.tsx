import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Dropdown } from 'react-bootstrap';
import { LayoutDashboard, ReceiptText, PiggyBank, PieChart, WalletCards, UploadCloud, Bot, Settings, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) => 
    `d-flex align-items-center px-4 py-3 text-decoration-none fw-medium ${
      isActive ? 'bg-info bg-opacity-25 text-primary border-end border-primary border-4' : 'text-dark hover-bg-light'
    }`;

  return (
    <div className="bg-white border-end d-flex flex-column h-100" style={{ width: '260px', zIndex: 1000 }}>
      <div className="d-flex align-items-center justify-content-center border-bottom py-4 flex-shrink-0" style={{ height: '70px' }}>
        <h3 className="fw-bolder mb-0 text-dark">FinManage</h3>
      </div>

      <div className="flex-grow-1 overflow-auto py-3">
        <NavLink to="/dashboard" className={navLinkClass}><LayoutDashboard size={20} className="me-3" /> Tổng quan</NavLink>
        <NavLink to="/transactions" className={navLinkClass}><ReceiptText size={20} className="me-3" /> Sổ giao dịch</NavLink>
        <NavLink to="/saving-goals" className={navLinkClass}><PiggyBank size={20} className="me-3" /> Tiết kiệm</NavLink>
        <NavLink to="/budgets" className={navLinkClass}><PieChart size={20} className="me-3" /> Ngân sách</NavLink>
        <NavLink to="/wallets" className={navLinkClass}><WalletCards size={20} className="me-3" /> Tài khoản ví</NavLink>
        <NavLink to="/import" className={navLinkClass}><UploadCloud size={20} className="me-3" /> Nhập sao kê</NavLink>
        
        <hr className="my-3 mx-4 text-muted" />
        <NavLink to="/ai-assistant" className={navLinkClass}><Bot size={20} className="me-3" /> Hỏi trợ lý AI</NavLink>
        <NavLink to="/settings" className={navLinkClass}><Settings size={20} className="me-3" /> Cài đặt</NavLink>
      </div>

      <div className="p-3 border-top d-flex align-items-center justify-content-between flex-shrink-0">
        <div className="d-flex align-items-center overflow-hidden">
          <div className="bg-light rounded-circle d-flex align-items-center justify-content-center border border-dark border-2 flex-shrink-0" style={{ width: 40, height: 40 }}>
            <span className="fw-bold fs-5 text-dark">{user?.fullName?.charAt(0) || 'U'}</span>
          </div>
          <div className="ms-3 lh-sm text-truncate">
            <div className="fw-bold text-dark text-truncate">{user?.fullName || user?.username}</div>
            <small className="text-muted">{user?.role === 'ADMIN' ? 'Quản trị viên' : 'Tài khoản Premium'}</small>
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