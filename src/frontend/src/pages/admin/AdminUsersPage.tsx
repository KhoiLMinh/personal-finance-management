import React, { useEffect, useState } from "react";
import { Card, Table, Badge, Button } from "react-bootstrap";
import { Users, Trash2, ShieldAlert, Lock, Unlock } from "lucide-react";
import userService from "../../services/userService";
import { useAuth } from "../../context/AuthContext";
import MySpinner from "../../components/MySpinner";

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
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (
    userCode: string,
    isRoot: boolean,
    isSelf: boolean,
    username: string,
  ) => {
    if (isRoot) {
      alert("Không thể xóa Quản trị viên gốc của hệ thống!");
      return;
    }
    if (isSelf) {
      alert("Bạn không thể tự xóa chính mình!");
      return;
    }
    if (
      window.confirm(
        `Hành động này không thể hoàn tác. Bạn chắc chắn muốn xóa tài khoản "${username}" cùng toàn bộ dữ liệu (Ví, Giao dịch) của họ chứ?`,
      )
    ) {
      try {
        await userService.deleteUser(userCode);
        setUsers(users.filter((u) => u.userCode !== userCode));
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa người dùng!");
      }
    }
  };

  const handleToggleStatus = async (
    userCode: string,
    isRoot: boolean,
    isSelf: boolean,
    username: string,
    currentStatus: boolean,
  ) => {
    if (isRoot) {
      alert("Không thể khóa Quản trị viên gốc của hệ thống!");
      return;
    }
    if (isSelf) {
      alert("Bạn không thể tự khóa chính mình!");
      return;
    }

    const actionText = currentStatus ? "khóa" : "mở khóa";
    if (
      window.confirm(
        `Bạn có chắc chắn muốn ${actionText} tài khoản "${username}" không?`,
      )
    ) {
      try {
        await userService.toggleUserStatus(userCode);
        setUsers(
          users.map((u) =>
            u.userCode === userCode ? { ...u, active: !u.active } : u,
          ),
        );
      } catch (error: any) {
        alert(
          error.response?.data?.error?.message ||
            `Lỗi ${actionText} người dùng!`,
        );
      }
    }
  };

  if (loading) return <MySpinner />;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: "#e2e8f0" }}>
      <Card
        className="border-0 rounded-4 mb-4 shadow-sm"
        style={{ backgroundColor: "#b0bec5" }}
      >
        <Card.Body className="p-4 d-flex align-items-center gap-3">
          <div className="bg-white p-2 rounded-circle shadow-sm">
            <Users size={32} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="fw-bold text-dark mb-1">
              Quản lý Tài khoản (Users)
            </h3>
            <p className="text-dark mb-0 opacity-75">
              Hệ thống hiện có {users.length} tài khoản
            </p>
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
              <th className="py-3 text-muted small fw-bold">TRẠNG THÁI</th>
              <th className="py-3 px-4 text-end text-muted small fw-bold">
                THAO TÁC
              </th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr
                key={u.userCode}
                className={!u.active ? "bg-light opacity-75" : ""}
              >
                <td className="px-4 fw-medium text-muted font-monospace">
                  #{u.userCode.substring(0, 8)}
                </td>
                <td>
                  <div className="fw-bold text-dark">
                    {u.fullName || u.username}
                  </div>
                  <div className="small text-muted">@{u.username}</div>
                </td>
                <td className="text-muted">{u.email}</td>
                <td>
                  <Badge
                    bg={u.role === "ADMIN" ? "danger" : "primary"}
                    className="rounded-pill px-3 py-2"
                  >
                    {u.role === "ADMIN" ? (
                      <>
                        <ShieldAlert size={12} className="me-1" /> ADMIN
                      </>
                    ) : (
                      "USER"
                    )}
                  </Badge>
                </td>
                <td>
                  <Badge
                    bg={u.active ? "success" : "secondary"}
                    className="rounded-pill px-3 py-2"
                  >
                    {u.active ? "Hoạt động" : "Bị khóa"}
                  </Badge>
                </td>
                <td className="px-4 text-end">
                  <Button
                    variant={u.active ? "outline-warning" : "outline-success"}
                    size="sm"
                    className="rounded-circle p-2 border-0 me-2"
                    disabled={u.id === 1 || u.id === user?.id}
                    onClick={() =>
                      handleToggleStatus(
                        u.userCode,
                        u.id === 1,
                        u.id === user?.id,
                        u.username,
                        u.active,
                      )
                    }
                    title={
                      u.active ? "Khóa tài khoản này" : "Mở khóa tài khoản này"
                    }
                  >
                    {u.active ? <Lock size={18} /> : <Unlock size={18} />}
                  </Button>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    className="rounded-circle p-2 border-0"
                    disabled={u.id === 1 || u.id === user?.id}
                    onClick={() =>
                      handleDelete(
                        u.userCode,
                        u.id === 1,
                        u.id === user?.id,
                        u.username,
                      )
                    }
                    title="Xóa tài khoản"
                  >
                    <Trash2 size={18} />
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-5 text-muted">
                  Chưa có người dùng nào.
                </td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </div>
  );
}
