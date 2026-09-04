import React, { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, Bell, CheckCheck, Trash2 } from 'lucide-react';
import { Dropdown, Badge, Spinner } from 'react-bootstrap';
import notificationService from '../services/notificationService';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Tổng quan về tài chính" }: HeaderProps) {
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
    <header
      className="bg-white border-bottom px-4 d-flex align-items-center justify-content-between flex-shrink-0"
      style={{ height: '70px', zIndex: 999 }}
    >
      <h5 className="fw-bold mb-0" style={{ color: 'var(--color-primary-darker)' }}>{title}</h5>

      <Dropdown align="end" onToggle={(isOpen) => isOpen && fetchNotifications()}>
        <Dropdown.Toggle as="div" className="position-relative d-flex align-items-center justify-content-center rounded-circle hide-caret"
          style={{ cursor: 'pointer', width: 40, height: 40, backgroundColor: 'var(--color-primary-lighter)' }}>
          
          <Bell size={20} color="var(--color-primary)" />
        
          {unreadCount > 0 && (
            <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle text-white d-flex align-items-center justify-content-center" style={{ width: '20px', height: '20px', fontSize: '10px', fontWeight: 'bold' }}>
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Dropdown.Toggle>

        <Dropdown.Menu className="shadow-lg border-0 rounded-4 p-0 mt-2" style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}>
          <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light">
            <h6 className="mb-0 fw-bold">Thông báo ({unreadCount} chưa đọc)</h6>
            {unreadCount > 0 && (
              <span style={{cursor:'pointer'}} className="text-primary small fw-medium" onClick={handleMarkAllAsRead}>
                <CheckCheck size={14} className="me-1"/>Đánh dấu đọc hết
              </span>
            )}
          </div>
          
          <div className="py-2">
            {loading ? (
              <div className="text-center p-3"><Spinner size="sm" variant="primary" /></div>
            ) : notifications.length === 0 ? (
              <div className="text-center text-muted p-4 small">Bạn không có thông báo nào.</div>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`p-3 border-bottom position-relative ${n.read ? 'bg-white' : (n.priority === 1 ? 'bg-danger bg-opacity-10' : 'bg-primary-lighter')}`}>
                  <div className="d-flex justify-content-between align-items-start mb-1">
                    <strong className={`small d-flex align-items-center ${n.priority === 1 && !n.read ? 'text-danger' : 'text-dark'}`}>
                      {n.priority === 1 && !n.read && <AlertTriangle size={14} className="me-1 text-danger flex-shrink-0" />}
                      <span className={n.priority === 1 && !n.read ? 'text-danger' : ''}>{n.title}</span>
                    </strong>
                    <Trash2 size={14} className="text-muted flex-shrink-0 ms-2" style={{cursor: 'pointer'}} onClick={() => handleDelete(n.id)} />
                  </div>
                  <p className="text-muted small mb-1" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{n.content}</p>
                  
                  <div className="d-flex justify-content-between align-items-center mt-2">
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {new Date(n.createAt).toLocaleString('vi-VN')}
                    </small>
                    {!n.read && (
                      <Badge bg={n.priority === 1 ? "danger" : "primary"} style={{cursor: 'pointer'}} onClick={() => handleMarkAsRead(n.id)}>
                        Đánh dấu đã đọc
                      </Badge>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </Dropdown.Menu>
      </Dropdown>
    </header>
  );
}