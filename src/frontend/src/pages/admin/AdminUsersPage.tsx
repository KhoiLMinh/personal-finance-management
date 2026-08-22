import React, { useEffect, useState } from 'react';
import { Card, Table, Badge, Button, Spinner } from 'react-bootstrap';
import { Users, Trash2, ShieldAlert } from 'lucide-react';
import userService from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import MySpinner from '../../components/MySpinner';
//FR-15
export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userService.getAllUsers();
      setUsers(data);
    } catch (error) {
      console.error("Lỗi lấy danh sách user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id: number, username: string) => {
    if (id === user?.id) {
      alert("Bạn không thể tự xóa chính mình!");
      return;
    }
    if (window.confirm(`Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản "${username}" cùng toàn bộ dữ liệu (Ví, Giao dịch) của họ chứ?`)) {
      try {
        await userService.deleteUser(id);
        setUsers(users.filter(u => u.id !== id));
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa người dùng!");
      }
    }
  };

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: '#e2e8f0' }}>
      <Card className="border-0 rounded-4 mb-4 shadow-sm" style={{ backgroundColor: '#b0bec5' }}>
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <div className="bg-white p-2 rounded-circle shadow-sm">
            <Users size={32} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="fw-bold text-dark mb-1">Quản lý Tài khoản (Users)</h3>
            <p className="text-dark mb-0 opacity-75">Hệ thống hiện có {users.length} tài khoản</p>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 rounded-4 shadow-sm overflow-hidden">
        <Table hover responsive className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th className="py-3 px-4 text-muted small fw-bold">ID</th>
              <th className="py-3 text-muted small fw-bold">USER</th>
              <th className="py-3 text-muted small fw-bold">EMAIL</th>
              <th className="py-3 text-muted small fw-bold">VAI TRÒ</th>
              <th className="py-3 text-muted small fw-bold">NGÀY TẠO</th>
              <th className="py-3 px-4 text-end text-muted small fw-bold">THAO TÁC</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 fw-medium text-muted">#{u.id}</td>
                <td>
                  <div className="fw-bold text-dark">{u.fullName || u.username}</div>
                  <div className="small text-muted">@{u.username}</div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <Badge bg={u.role === 'ADMIN' ? 'danger' : 'primary'} className="rounded-pill px-3 py-2">
                    {u.role === 'ADMIN' ? <><ShieldAlert size={12} className="me-1"/> ADMIN</> : 'USER'}
                  </Badge>
                </td>
                <td className="text-muted small">
                  {new Date(u.createAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-4 text-end">
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    className="rounded-circle p-2 border-0"
                    disabled={u.id === user?.id} // Vô hiệu hóa nút xóa chính mình
                    onClick={() => handleDelete(u.id, u.username)}
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">Chưa có người dùng nào.</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}