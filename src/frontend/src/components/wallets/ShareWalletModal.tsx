import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Form, Button, Spinner, Alert } from 'react-bootstrap';
import walletService from '../../services/walletService';
import type { Wallet } from '../../utils/wallet';
import { ErrorState, LoadingState } from '../ui/PageState';

interface Member {
  id: number;
  email: string;
  fullName: string | null;
  username: string;
  permission: 'VIEW' | 'EDIT';
}

interface Props {
  show: boolean;
  onHide: () => void;
  wallet: Wallet | null;
}

const PERMISSION_TEXT = { VIEW: 'Chỉ xem', EDIT: 'Chỉnh sửa' } as const;

// FR-13
export default function ShareWalletModal({ show, onHide, wallet }: Props) {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<'VIEW' | 'EDIT'>('VIEW');
  const [msg, setMsg] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [members, setMembers] = useState<Member[] | null>(null);
  const [membersError, setMembersError] = useState(false);

  const loadMembers = useCallback(async () => {
    if (!wallet) return;
    setMembers(null);
    setMembersError(false);
    try {
      setMembers(await walletService.getWalletMembers(wallet.id));
    } catch {
      setMembersError(true);
    }
  }, [wallet]);

  useEffect(() => {
    if (show) {
      setMsg(null);
      setEmail('');
      setPermission('VIEW');
      loadMembers();
    }
  }, [show, loadMembers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet) return;
    setLoading(true);
    setMsg(null);
    try {
      await walletService.shareWallet(wallet.id, { email, permission });
      setMsg({ type: 'success', text: `Đã chia sẻ với ${email} (${PERMISSION_TEXT[permission].toLowerCase()}).` });
      setEmail('');
      loadMembers();
    } catch (error: any) {
      setMsg({ type: 'danger', text: error.response?.data?.error?.message || 'Không chia sẻ được ví. Thử lại sau.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title as="h2" className="h5 mb-0">Chia sẻ ví “{wallet?.name}”</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h3 className="small fw-semibold mb-2">Đang chia sẻ với</h3>
        {membersError ? (
          <ErrorState onRetry={loadMembers} />
        ) : members === null ? (
          <LoadingState compact />
        ) : members.length === 0 ? (
          <p className="small text-secondary">Chưa chia sẻ với ai.</p>
        ) : (
          <ul className="list-unstyled mb-3">
            {members.map((m) => (
              <li key={m.id} className="d-flex justify-content-between align-items-center py-2 border-bottom small">
                <span className="text-truncate">
                  <span className="fw-medium">{m.fullName || m.username}</span>
                  <span className="text-secondary"> · {m.email}</span>
                </span>
                <span className={`status-pill ${m.permission === 'EDIT' ? 'warning' : 'neutral'}`}>{PERMISSION_TEXT[m.permission]}</span>
              </li>
            ))}
          </ul>
        )}

        <h3 className="small fw-semibold mb-2 mt-3">Mời thêm hoặc đổi quyền</h3>
        <p className="small text-secondary mb-3">
          Chỉ chia sẻ được cho thành viên cùng gia đình. Mời lại một email đã có để đổi quyền của người đó.
        </p>
        {msg && <Alert variant={msg.type} className="py-2 small">{msg.text}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="share-email">
            <Form.Label className="small text-secondary">Email</Form.Label>
            <Form.Control type="email" required placeholder="nguoi.than@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Form.Group>
          <Form.Group className="mb-3" controlId="share-permission">
            <Form.Label className="small text-secondary">Quyền</Form.Label>
            <Form.Select value={permission} onChange={(e) => setPermission(e.target.value as 'VIEW' | 'EDIT')}>
              <option value="VIEW">Chỉ xem – xem số dư và giao dịch</option>
              <option value="EDIT">Chỉnh sửa – được thêm, sửa, xóa giao dịch</option>
            </Form.Select>
          </Form.Group>
          <Button type="submit" className="w-100" disabled={loading}>
            {loading && <Spinner size="sm" className="me-2" />} Chia sẻ
          </Button>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
