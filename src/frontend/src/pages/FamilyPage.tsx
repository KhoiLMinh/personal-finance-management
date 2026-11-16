import React, { useCallback, useEffect, useState } from 'react';
import { Button, Form, Row, Col, Spinner } from 'react-bootstrap';
import { Copy, RefreshCw, LogOut, Trash2, Check } from 'lucide-react';
import familyService from '../services/familyService';
import { useAuth } from '../context/AuthContext';
import { ErrorState, LoadingState } from '../components/ui/PageState';

interface Family { id: number; name: string; inviteCode: string; ownerId: number; ownerUsername: string }
interface Member { id: number; userId: number; username: string; fullName: string | null; role: 'MANAGER' | 'MEMBER' }

const ROLE_TEXT = { MANAGER: 'Quản lý', MEMBER: 'Thành viên' } as const;

export default function FamilyPage() {
  const { user } = useAuth();
  const [state, setState] = useState<'loading' | 'error' | 'none' | 'ready'>('loading');
  const [family, setFamily] = useState<Family | null>(null);
  const [members, setMembers] = useState<Member[]>([]);

  const [createName, setCreateName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [busy, setBusy] = useState<'create' | 'join' | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    setState('loading');
    try {
      const f = await familyService.getMyFamily();
      const m = await familyService.getMembers(f.id, { page: 0, size: 50 });
      setFamily(f);
      setMembers(m.content);
      setState('ready');
    } catch (err: any) {
      // the API answers 4xx when the user has no family; no response at all means the request failed
      setFamily(null);
      setMembers([]);
      setState(err.response ? 'none' : 'error');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const run = async (kind: 'create' | 'join', action: () => Promise<unknown>, fallback: string) => {
    setBusy(kind);
    try {
      await action();
      load();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || fallback);
    } finally {
      setBusy(null);
    }
  };

  const confirmThen = async (message: string, action: () => Promise<unknown>, fallback: string) => {
    if (!window.confirm(message)) return;
    try {
      await action();
      load();
    } catch (err: any) {
      alert(err.response?.data?.error?.message || fallback);
    }
  };

  const copyCode = async () => {
    if (!family) return;
    try {
      await navigator.clipboard.writeText(family.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert(`Mã mời: ${family.inviteCode}`);
    }
  };

  if (state === 'loading') return <div className="page"><div className="panel"><LoadingState /></div></div>;
  if (state === 'error') return <div className="page"><div className="panel"><ErrorState onRetry={load} /></div></div>;

  if (state === 'none' || !family) {
    return (
      <div className="page">
        <p className="small text-secondary" style={{ maxWidth: '65ch' }}>
          Gia đình cho phép bạn chia sẻ ví với người thân: mỗi người vẫn giữ ví riêng, chỉ những ví được chia sẻ mới xem hoặc chỉnh sửa chung được.
        </p>
        <Row className="g-3">
          <Col md={6}>
            <section className="panel h-100">
              <div className="panel-header"><h2 className="panel-title">Tạo gia đình</h2></div>
              <Form className="panel-body" onSubmit={(e: React.FormEvent) => { e.preventDefault(); run('create', () => familyService.createFamily({ name: createName }), 'Không tạo được gia đình. Thử lại sau.'); }}>
                <Form.Group className="mb-3" controlId="family-name">
                  <Form.Label className="small text-secondary">Tên gia đình</Form.Label>
                  <Form.Control required maxLength={100} placeholder="VD: Nhà mình" value={createName} onChange={(e) => setCreateName(e.target.value)} />
                </Form.Group>
                <Button type="submit" disabled={busy !== null}>{busy === 'create' && <Spinner size="sm" className="me-2" />}Tạo gia đình</Button>
              </Form>
            </section>
          </Col>
          <Col md={6}>
            <section className="panel h-100">
              <div className="panel-header"><h2 className="panel-title">Tham gia bằng mã mời</h2></div>
              <Form className="panel-body" onSubmit={(e: React.FormEvent) => { e.preventDefault(); run('join', () => familyService.joinFamily({ inviteCode: joinCode.trim() }), 'Mã mời không đúng hoặc đã hết hiệu lực.'); }}>
                <Form.Group className="mb-3" controlId="family-code">
                  <Form.Label className="small text-secondary">Mã mời (do chủ gia đình gửi)</Form.Label>
                  <Form.Control required maxLength={8} className="num text-uppercase" placeholder="8 ký tự" value={joinCode} onChange={(e) => setJoinCode(e.target.value)} />
                </Form.Group>
                <Button type="submit" variant="outline-primary" disabled={busy !== null}>{busy === 'join' && <Spinner size="sm" className="me-2" />}Tham gia</Button>
              </Form>
            </section>
          </Col>
        </Row>
      </div>
    );
  }

  const isOwner = family.ownerId === user?.id;

  return (
    <div className="page">
      <div className="page-toolbar">
        <div>
          <h2 className="h5 fw-semibold mb-0">{family.name}</h2>
          <div className="small text-secondary">Chủ gia đình: @{family.ownerUsername} · {members.length} thành viên</div>
        </div>
        {isOwner ? (
          <Button variant="outline-danger" size="sm" className="d-inline-flex align-items-center gap-1"
            onClick={() => confirmThen('Xóa gia đình? Mọi thành viên bị đưa ra khỏi nhóm và các ví đang chia sẻ giữa các thành viên sẽ bị thu hồi quyền.', () => familyService.deleteFamily(family.id), 'Không xóa được gia đình.')}>
            <Trash2 size={14} aria-hidden /> Xóa gia đình
          </Button>
        ) : (
          <Button variant="outline-danger" size="sm" className="d-inline-flex align-items-center gap-1"
            onClick={() => confirmThen('Rời gia đình? Bạn sẽ mất quyền truy cập các ví được chia sẻ, và ví bạn chia sẻ cho người khác cũng bị thu hồi.', () => familyService.leaveFamily(), 'Không rời được gia đình.')}>
            <LogOut size={14} aria-hidden /> Rời gia đình
          </Button>
        )}
      </div>

      <Row className="g-3">
        {isOwner && (
          <Col lg={4}>
            <section className="panel h-100">
              <div className="panel-header"><h2 className="panel-title">Mã mời</h2></div>
              <div className="panel-body">
                <div className="num fs-3 fw-semibold mb-2" style={{ letterSpacing: '0.15em' }}>{family.inviteCode}</div>
                <div className="d-flex gap-2 mb-2">
                  <Button size="sm" onClick={copyCode} className="d-inline-flex align-items-center gap-1" aria-live="polite">
                    {copied ? <Check size={14} aria-hidden /> : <Copy size={14} aria-hidden />} {copied ? 'Đã sao chép' : 'Sao chép'}
                  </Button>
                  <Button size="sm" variant="outline-secondary" className="d-inline-flex align-items-center gap-1"
                    onClick={() => confirmThen('Tạo mã mời mới? Mã cũ sẽ không dùng được nữa.', () => familyService.regenerateInviteCode(family.id), 'Không tạo được mã mới.')}>
                    <RefreshCw size={14} aria-hidden /> Tạo mã mới
                  </Button>
                </div>
                <p className="small text-secondary mb-0">Gửi mã này cho người thân để họ tham gia.</p>
              </div>
            </section>
          </Col>
        )}
        <Col lg={isOwner ? 8 : 12}>
          <section className="panel h-100">
            <div className="panel-header"><h2 className="panel-title">Thành viên</h2></div>
            <ul className="list-unstyled mb-0 mt-2">
              {members.map((m) => {
                const isFamilyOwner = m.userId === family.ownerId;
                const canManage = isOwner && !isFamilyOwner && m.userId !== user?.id;
                return (
                  <li key={m.id} className="d-flex flex-wrap align-items-center gap-2 px-3 py-2 border-top">
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      <div className="fw-medium text-truncate">{m.fullName || m.username}{m.userId === user?.id && <span className="text-secondary fw-normal"> (bạn)</span>}</div>
                      <div className="small text-secondary">@{m.username}</div>
                    </div>
                    {canManage ? (
                      <>
                        <Form.Select size="sm" className="w-auto" aria-label={`Vai trò của ${m.fullName || m.username}`} value={m.role}
                          onChange={(e) => confirmThen(`Đổi vai trò của ${m.fullName || m.username} thành ${ROLE_TEXT[e.target.value as Member['role']]}?`,
                            () => familyService.updateMemberRole(family.id, m.id, { role: e.target.value }), 'Không đổi được vai trò.')}>
                          <option value="MEMBER">Thành viên</option>
                          <option value="MANAGER">Quản lý</option>
                        </Form.Select>
                        <Button variant="link" size="sm" className="text-secondary p-1" aria-label={`Mời ${m.fullName || m.username} ra khỏi gia đình`}
                          onClick={() => confirmThen(`Mời ${m.fullName || m.username} ra khỏi gia đình? Quyền với các ví được chia sẻ cũng bị thu hồi.`, () => familyService.removeMember(family.id, m.id), 'Không xóa được thành viên.')}>
                          <Trash2 size={16} aria-hidden />
                        </Button>
                      </>
                    ) : (
                      <span className={`status-pill ${isFamilyOwner ? 'ok' : 'neutral'}`}>{isFamilyOwner ? 'Chủ gia đình' : ROLE_TEXT[m.role]}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        </Col>
      </Row>
    </div>
  );
}
