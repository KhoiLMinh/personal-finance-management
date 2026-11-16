import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Bell, CheckCheck, Menu, Trash2 } from 'lucide-react';
import { Button, Dropdown, Spinner } from 'react-bootstrap';
import notificationService from '../services/notificationService';

interface HeaderProps {
  title?: string;
  onOpenNav: () => void;
}

export default function Header({ title = 'FinManage', onOpenNav }: HeaderProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // FR-11: 
  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await notificationService.getMyNotifications({ page: 0, size: 10 });
      
      const notiList = res.content || [];
      
      const unread = notiList.filter((noti: any) => !noti.read).length;
      
      setNotifications(notiList);
      setUnreadCount(unread);
      
    } catch (error) {
      console.error("Lỗi lấy thông báo:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const handleReload = () => {
      fetchNotifications();
    };

    window.addEventListener('reload-notifications', handleReload);
    return () => {
      window.removeEventListener('reload-notifications', handleReload);
    };
  }, [fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (error) {
      console.error("Lỗi đánh dấu đã đọc tất cả:", error);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      fetchNotifications();
    } catch (error) {
      console.error("Lỗi xóa thông báo:", error);
    }
  };

  return (
    <header className="app-header">
      <Button variant="link" className="d-lg-none text-secondary p-1" aria-label="Mở menu" onClick={onOpenNav}>
        <Menu size={22} aria-hidden />
      </Button>
      <h1 className="h6 fw-semibold mb-0 flex-grow-1 text-truncate">{title}</h1>

      <Dropdown align="end" onToggle={(isOpen) => isOpen && fetchNotifications()}>
        <Dropdown.Toggle
          variant="link"
          className="position-relative text-secondary p-1 hide-caret"
          aria-label={unreadCount > 0 ? `Thông báo, ${unreadCount} chưa đọc` : 'Thông báo'}
        >
          <Bell size={20} aria-hidden />
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.625rem' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="p-0 mt-2" style={{ width: 'min(360px, calc(100vw - 2rem))', maxHeight: 420, overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom">
            <span className="fw-semibold small">Thông báo</span>
            {unreadCount > 0 && (
              <Button variant="link" size="sm" className="p-0 text-decoration-none" onClick={handleMarkAllAsRead}>
                <CheckCheck size={14} className="me-1" aria-hidden />Đánh dấu đã đọc hết
              </Button>
            )}
          </div>

          {loading ? (
            <div className="text-center p-3"><Spinner size="sm" /></div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-secondary p-4 small">Chưa có thông báo nào.</div>
          ) : (
            notifications.map(n => {
              const urgent = n.priority === 1 && !n.read;
              return (
                <div key={n.id} className="px-3 py-2 border-bottom" style={{ background: n.read ? undefined : (urgent ? 'var(--danger-tint)' : 'var(--brand-tint)') }}>
                  <div className="d-flex justify-content-between align-items-start gap-2">
                    <span className={`small fw-semibold d-flex align-items-center gap-1 ${urgent ? 'text-danger-strong' : ''}`}>
                      {urgent && <AlertTriangle size={14} className="flex-shrink-0" aria-hidden />}
                      {n.title}
                    </span>
                    <Button variant="link" size="sm" className="p-0 text-secondary" aria-label="Xóa thông báo" onClick={() => handleDelete(n.id)}>
                      <Trash2 size={14} aria-hidden />
                    </Button>
                  </div>
                  <p className="text-secondary mb-1 mt-1" style={{ fontSize: 'var(--fs-xs)', whiteSpace: 'pre-wrap' }}>{n.content}</p>
                  <div className="d-flex justify-content-between align-items-center">
                    <small className="text-secondary" style={{ fontSize: 'var(--fs-xs)' }}>{new Date(n.createAt).toLocaleString('vi-VN')}</small>
                    {!n.read && (
                      <Button variant="link" size="sm" className="p-0 text-decoration-none" style={{ fontSize: 'var(--fs-xs)' }} onClick={() => handleMarkAsRead(n.id)}>
                        Đánh dấu đã đọc
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}
