import { useCallback, useEffect, useState } from 'react';
import { Button, Form, InputGroup } from 'react-bootstrap';
import { Lock, Search, Trash2, Unlock } from 'lucide-react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/PageState';

interface AdminUser { id: number; userCode: string; username: string; fullName: string | null; email: string; role: 'ADMIN' | 'USER'; active: boolean }

const ROOT_ADMIN_ID = 1;

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

  const load = useCallback(async () => {
    setError(false);
    try {
      setUsers(await userService.getAllUsers());
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const protectedReason = (u: AdminUser) =>
    u.id === ROOT_ADMIN_ID ? 'Quản trị viên gốc của hệ thống' : u.id === user?.id ? 'Tài khoản của bạn' : null;

  const handleDelete = async (u: AdminUser) => {
    if (protectedReason(u)) return;
    if (!window.confirm(`Xóa tài khoản "${u.username}" cùng toàn bộ ví và giao dịch của họ? Thao tác này không hoàn tác được.`)) return;
    try {
      await userService.deleteUser(u.userCode);
      setUsers((prev) => (prev ?? []).filter((x) => x.userCode !== u.userCode));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || 'Không xóa được tài khoản.');
    }
  };

  const handleToggle = async (u: AdminUser) => {
    if (protectedReason(u)) return;
    const action = u.active ? 'Khóa' : 'Mở khóa';
    const extra = u.active ? ' Người dùng sẽ bị đăng xuất ở lần thao tác tiếp theo.' : '';
    if (!window.confirm(`${action} tài khoản "${u.username}"?${extra}`)) return;
    try {
      await userService.toggleUserStatus(u.userCode);
      setUsers((prev) => (prev ?? []).map((x) => (x.userCode === u.userCode ? { ...x, active: !x.active } : x)));
    } catch (err: any) {
      alert(err.response?.data?.error?.message || `Không ${action.toLowerCase()} được tài khoản.`);
    }
  };

  const q = query.trim().toLowerCase();
  const shown = (users ?? []).filter((u) => !q || [u.username, u.fullName ?? '', u.email].some((f) => f.toLowerCase().includes(q)));
  const lockedCount = (users ?? []).filter((u) => !u.active).length;

  return (
    <div className="page">
      <div className="page-toolbar">
        <div className="small text-secondary">{users ? `${users.length} tài khoản · ${lockedCount} đang bị khóa` : ' '}</div>
        <InputGroup size="sm" style={{ maxWidth: 320 }}>
          <InputGroup.Text><Search size={14} aria-hidden /></InputGroup.Text>
          <Form.Control aria-label="Tìm người dùng" placeholder="Tên, username hoặc email" value={query} onChange={(e) => setQuery(e.target.value)} />
        </InputGroup>
      </div>

      <section className="panel">
        {error ? (
          <ErrorState onRetry={load} />
        ) : users === null ? (
          <LoadingState />
        ) : shown.length === 0 ? (
          <EmptyState title={q ? 'Không có tài khoản khớp từ khóa' : 'Chưa có người dùng nào'} />
        ) : (
          <ul className="list-unstyled mb-0">
            {shown.map((u) => {
              const reason = protectedReason(u);
              return (
                <li key={u.userCode} className={`d-flex flex-wrap align-items-center gap-2 px-3 py-2 border-bottom ${u.active ? '' : 'opacity-75'}`}>
                  <div className="flex-grow-1" style={{ minWidth: 200 }}>
                    <div className="fw-medium text-truncate">{u.fullName || u.username} <span className="text-secondary fw-normal small">@{u.username}</span></div>
                    <div className="small text-secondary text-truncate">{u.email}</div>
                  </div>
                  {u.role === 'ADMIN' && <span className="status-pill warning">Quản trị viên</span>}
                  <span className={`status-pill ${u.active ? 'ok' : 'over'}`}>{u.active ? 'Hoạt động' : 'Bị khóa'}</span>
                  <div className="d-flex" title={reason ?? undefined}>
                    <Button variant="link" size="sm" className="text-secondary p-1" disabled={!!reason} onClick={() => handleToggle(u)}
                      aria-label={`${u.active ? 'Khóa' : 'Mở khóa'} ${u.username}${reason ? ` (${reason})` : ''}`}>
                      {u.active ? <Lock size={16} aria-hidden /> : <Unlock size={16} aria-hidden />}
                    </Button>
                    <Button variant="link" size="sm" className="text-secondary p-1" disabled={!!reason} onClick={() => handleDelete(u)}
                      aria-label={`Xóa ${u.username}${reason ? ` (${reason})` : ''}`}>
                      <Trash2 size={16} aria-hidden />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
