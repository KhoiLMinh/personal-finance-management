import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-white border-top py-3 mt-auto">
      <div className="container-fluid text-center text-muted small">
        &copy; {new Date().getFullYear()} FinManage - Phần mềm Quản lý Tài chính Cá nhân.
      </div>
    </footer>
  );
}