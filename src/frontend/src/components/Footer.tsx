import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <div className="container-fluid text-center small" style={{ color: 'var(--color-text-muted)' }}>
        &copy; {new Date().getFullYear()} <span className="fw-semibold" style={{ color: 'var(--color-primary)' }}>FinManage</span> - Phần mềm Quản lý Tài chính Cá nhân.
      </div>
    </footer>
  );
}