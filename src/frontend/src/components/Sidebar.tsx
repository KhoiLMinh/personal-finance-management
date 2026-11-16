import { NavLink, useNavigate, Link } from 'react-router-dom';
import { Dropdown, Offcanvas } from 'react-bootstrap';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, ReceiptText, PiggyBank, PieChart, WalletCards, UploadCloud, Bot, Settings, LogOut, Wallet,
  Users, List, CalendarClock, Settings2, Tags, BarChart3,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavItem { to: string; label: string; icon: LucideIcon }

const USER_NAV: NavItem[][] = [
  [
    { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/transactions', label: 'Giao dịch', icon: ReceiptText },
    { to: '/wallets', label: 'Ví', icon: WalletCards },
    { to: '/budgets', label: 'Ngân sách', icon: PieChart },
    { to: '/reports', label: 'Báo cáo', icon: BarChart3 },
    { to: '/saving-goals', label: 'Tiết kiệm', icon: PiggyBank },
  ],
  [
    { to: '/categories', label: 'Danh mục', icon: Tags },
    { to: '/bills', label: 'Hóa đơn định kỳ', icon: CalendarClock },
    { to: '/import', label: 'Nhập sao kê', icon: UploadCloud },
    { to: '/family', label: 'Gia đình', icon: Users },
  ],
  [{ to: '/ai-assistant', label: 'Trợ lý AI', icon: Bot }],
];

const ADMIN_NAV: NavItem[][] = [
  [
    { to: '/admin/users', label: 'Người dùng', icon: Users },
    { to: '/admin/categories', label: 'Danh mục mặc định', icon: List },
    { to: '/admin/configs', label: 'Cấu hình hệ thống', icon: Settings2 },
  ],
];

const linkClass = ({ isActive }: { isActive: boolean }) => `nav-item-link${isActive ? ' active' : ''}`;

interface Props {
  /** Below lg the sidebar is an off-canvas drawer controlled by the header's menu button. */
  show: boolean;
  onHide: () => void;
}

export default function Sidebar({ show, onHide }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const groups = user?.role === 'ADMIN' ? ADMIN_NAV : USER_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Offcanvas show={show} onHide={onHide} responsive="lg" placement="start" className="app-sidebar" aria-label="Điều hướng chính">
      <Offcanvas.Header closeButton className="d-lg-none">
        <Offcanvas.Title as="span" className="fw-semibold">FinManage</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="d-flex flex-column p-0 w-100">
        <Link to={user?.role === 'ADMIN' ? '/admin/users' : '/dashboard'} className="app-brand d-none d-lg-flex" onClick={onHide}>
          <span className="app-brand-mark"><Wallet size={16} aria-hidden /></span>
          FinManage
        </Link>

        <nav className="flex-grow-1 overflow-auto py-2">
          {groups.map((group, i) => (
            <div key={i} className={i > 0 ? 'nav-group' : undefined}>
              {group.map(({ to, label, icon: Icon }) => (
                <NavLink key={to} to={to} className={linkClass} onClick={onHide}>
                  <Icon size={18} aria-hidden /> {label}
                </NavLink>
              ))}
            </div>
          ))}
          <div className="nav-group">
            <NavLink to="/profile" className={linkClass} onClick={onHide}>
              <Settings size={18} aria-hidden /> Tài khoản
            </NavLink>
          </div>
        </nav>

        <div className="app-user">
          <span className="app-avatar" aria-hidden>{(user?.fullName || user?.username || 'U').charAt(0).toUpperCase()}</span>
          <div className="text-truncate flex-grow-1 lh-sm">
            <div className="fw-semibold text-truncate small">{user?.fullName || user?.username}</div>
            <div className="text-secondary text-truncate" style={{ fontSize: 'var(--fs-xs)' }}>{user?.role === 'ADMIN' ? 'Quản trị viên' : user?.email}</div>
          </div>
          <Dropdown drop="up" align="end">
            <Dropdown.Toggle variant="link" className="text-secondary p-1 hide-caret" aria-label="Tùy chọn tài khoản">
              <LogOut size={18} aria-hidden />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={handleLogout} className="text-danger">Đăng xuất</Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
}
