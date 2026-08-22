import React, { useEffect, useState } from 'react';
import { Card, Button, Form, InputGroup, Row, Col, Table, Badge, Spinner } from 'react-bootstrap';
import { Users, Home, UserPlus, Copy, RefreshCw, LogOut, Trash2, ShieldAlert } from 'lucide-react';
import familyService from '../services/familyService';
import { useAuth } from '../context/AuthContext';
import MySpinner from '../components/MySpinner';

export default function FamilyPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [family, setFamily] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);

  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFamilyData = async () => {
    setLoading(true);
    try {
      const familyData = await familyService.getMyFamily();
      setFamily(familyData);
      const membersData = await familyService.getMembers(familyData.id, { page: 0, size: 50 });
      setMembers(membersData.content);
    } catch (error: any) {
      setFamily(null);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilyData();
  }, []);

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await familyService.createFamily({ name: createName });
      fetchFamilyData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Lỗi tạo gia đình!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleJoinFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await familyService.joinFamily({ inviteCode: joinCode });
      fetchFamilyData();
    } catch (error: any) {
      alert(error.response?.data?.error?.message || "Mã mời không hợp lệ!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(family?.inviteCode);
    alert("Đã copy mã mời!");
  };

  const handleRegenerateCode = async () => {
    if (window.confirm("Đổi mã mời mới sẽ khiến mã cũ không còn hiệu lực. Tiếp tục?")) {
      try {
        await familyService.regenerateInviteCode(family.id);
        fetchFamilyData();
      } catch (error: any) {
        alert("Lỗi khi tạo mã mới!");
      }
    }
  };

  const handleLeaveFamily = async () => {
    if (window.confirm("Bạn chắc chắn muốn rời khỏi gia đình này? Bạn sẽ mất toàn bộ quyền truy cập.")) {
      try {
        await familyService.leaveFamily();
        fetchFamilyData();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi rời gia đình!");
      }
    }
  };

  const handleDeleteFamily = async () => {
    if (window.confirm("Hành động này sẽ XÓA TOÀN BỘ gia đình và đuổi tất cả thành viên. Chắc chắn xóa?")) {
      try {
        await familyService.deleteFamily(family.id);
        fetchFamilyData();
      } catch (error: any) {
        alert("Lỗi xóa gia đình!");
      }
    }
  };

  const handleRemoveMember = async (memberId: number, memberName: string) => {
    if (window.confirm(`Xóa thành viên "${memberName}" khỏi gia đình?`)) {
      try {
        await familyService.removeMember(family.id, memberId);
        fetchFamilyData();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi xóa thành viên!");
      }
    }
  };

  const handleChangeRole = async (memberId: number, newRole: string) => {
    if (window.confirm("Thay đổi quyền hạn của thành viên này?")) {
      try {
        await familyService.updateMemberRole(family.id, memberId, { role: newRole });
        fetchFamilyData();
      } catch (error: any) {
        alert(error.response?.data?.error?.message || "Lỗi đổi quyền!");
      }
    }
  };

  if (loading) return <MySpinner />;
  if (!family) {
    return (
      <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
        <h3 className="fw-bold mb-4 text-dark text-center">Gia Đình & Nhóm</h3>
        <Row className="g-4 justify-content-center">
          <Col md={5}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 p-md-5 text-center">
                <div className="bg-primary-lighter rounded-circle d-inline-flex p-3 mb-4">
                  <Home size={40} className="text-primary" />
                </div>
                <h4 className="fw-bold text-dark">Tạo gia đình mới</h4>
                <p className="text-muted small mb-4">Tạo nhóm để mời người thân cùng theo dõi và quản lý chi tiêu chung.</p>
                <Form onSubmit={handleCreateFamily}>
                  <Form.Control size="lg" type="text" placeholder="Tên gia đình (VD: Tổ ấm của Khôi)" className="mb-3 bg-light border-0" required value={createName} onChange={e => setCreateName(e.target.value)} />
                  <Button type="submit" className="w-100 rounded-pill py-2 fw-bold border-0" disabled={isSubmitting} style={{ backgroundColor: 'var(--color-primary)' }}>
                    {isSubmitting ? <Spinner size="sm" /> : 'Tạo mới ngay'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          <Col md={5}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4 p-md-5 text-center">
                <div className="bg-light rounded-circle d-inline-flex p-3 mb-4">
                  <UserPlus size={40} className="text-secondary" />
                </div>
                <h4 className="fw-bold text-dark">Vào nhà người thân</h4>
                <p className="text-muted small mb-4">Nhập mã mời gồm 8 ký tự do chủ gia đình cung cấp để tham gia nhóm.</p>
                <Form onSubmit={handleJoinFamily}>
                  <Form.Control size="lg" type="text" placeholder="Nhập mã mời..." className="mb-3 bg-light border-0 text-center fw-bold text-uppercase" required value={joinCode} onChange={e => setJoinCode(e.target.value)} maxLength={8} />
                  <Button type="submit" variant="dark" className="w-100 rounded-pill py-2 fw-bold">
                    {isSubmitting ? <Spinner size="sm" /> : 'Tham gia'}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    );
  }
  const isOwner = family.ownerId === user?.id;

  return (
    <div className="p-4 flex-grow-1" style={{ backgroundColor: 'var(--color-bg)' }}>
      
      <Card className="border-0 rounded-4 mb-4 shadow-soft">
        <Card.Body className="p-4 d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-primary-lighter p-3 rounded-circle">
              <Home size={32} className="text-primary" />
            </div>
            <div>
              <h3 className="fw-bold mb-1 text-dark">{family.name}</h3>
              <p className="text-muted mb-0 small">Chủ sở hữu: <strong>@{family.ownerUsername}</strong></p>
            </div>
          </div>
          
          <div className="d-flex align-items-center gap-2">
            {isOwner ? (
              <Button variant="outline-danger" className="rounded-pill px-3 fw-medium d-flex align-items-center" onClick={handleDeleteFamily}>
                <Trash2 size={16} className="me-2" /> Xóa gia đình
              </Button>
            ) : (
              <Button variant="outline-danger" className="rounded-pill px-3 fw-medium d-flex align-items-center" onClick={handleLeaveFamily}>
                <LogOut size={16} className="me-2" /> Rời khỏi
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <Row className="g-4">
        {isOwner && (
          <Col md={4}>
            <Card className="border-0 rounded-4 shadow-sm h-100" style={{ backgroundColor: 'var(--color-primary)' }}>
              <Card.Body className="p-4 text-white text-center d-flex flex-column justify-content-center">
                <h5 className="fw-bold mb-3 text-white">Mã mời tham gia</h5>
                <div className="bg-white text-dark py-3 px-4 rounded-3 fs-3 fw-bolder mb-3" style={{ letterSpacing: '2px' }}>
                  {family.inviteCode}
                </div>
                <div className="d-flex gap-2 justify-content-center">
                  <Button variant="light" className="rounded-pill text-primary fw-bold px-3 d-flex align-items-center" onClick={handleCopyCode}>
                    <Copy size={16} className="me-1" /> Copy mã
                  </Button>
                  <Button variant="outline-light" className="rounded-pill px-3 d-flex align-items-center" onClick={handleRegenerateCode}>
                    <RefreshCw size={16} className="me-1" /> Đổi mã
                  </Button>
                </div>
                <p className="mt-3 small opacity-75 mb-0">Hãy gửi mã này cho người thân để họ tham gia vào gia đình của bạn.</p>
              </Card.Body>
            </Card>
          </Col>
        )}


        <Col md={isOwner ? 8 : 12}>
          <Card className="border-0 rounded-4 shadow-sm h-100 overflow-hidden">
            <Card.Header className="bg-white border-0 pt-4 pb-2 px-4 d-flex align-items-center gap-2">
              <Users size={20} className="text-primary" />
              <h5 className="fw-bold mb-0 text-dark">Thành viên ({members.length})</h5>
            </Card.Header>
            <Card.Body className="p-0">
              <Table hover responsive className="mb-0 align-middle">
                <thead className="bg-light text-muted small">
                  <tr>
                    <th className="px-4 py-3 fw-bold">THÀNH VIÊN</th>
                    <th className="py-3 fw-bold text-center">VAI TRÒ</th>
                    {isOwner && <th className="px-4 py-3 fw-bold text-end">THAO TÁC</th>}
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => (
                    <tr key={m.id}>
                      <td className="px-4 py-3">
                        <div className="fw-bold text-dark">{m.fullName || m.username}</div>
                        <div className="small text-muted">@{m.username}</div>
                      </td>
                      <td className="text-center py-3">
                        <Badge bg={m.role === 'MANAGER' ? 'danger' : 'primary'} className="rounded-pill px-3 py-2 fw-medium">
                          {m.role === 'MANAGER' ? <><ShieldAlert size={12} className="me-1"/> Chủ nhà</> : 'Thành viên'}
                        </Badge>
                      </td>
                      {isOwner && (
                        <td className="px-4 py-3 text-end">
                          {m.userId !== user?.id && (
                            <div className="d-flex gap-2 justify-content-end">
                              <Form.Select 
                                size="sm" 
                                className="w-auto bg-light border-0" 
                                value={m.role}
                                onChange={(e) => handleChangeRole(m.id, e.target.value)}
                              >
                                <option value="MEMBER">Làm Thành viên</option>
                                <option value="MANAGER">Làm Quản lý</option>
                              </Form.Select>
                              <Button variant="outline-danger" size="sm" className="border-0 rounded-3 px-2" onClick={() => handleRemoveMember(m.id, m.fullName || m.username)}>
                                <Trash2 size={16} />
                              </Button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}