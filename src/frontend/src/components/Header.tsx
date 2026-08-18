import React from 'react';
import { Bell } from 'lucide-react';

interface HeaderProps {
  title?: string;
}

export default function Header({ title = "Tổng quan về tài chính" }: HeaderProps) {
  return (
    <header className="bg-white border-bottom px-4 d-flex align-items-center justify-content-between flex-shrink-0" style={{ height: '70px' }}>
      <h5 className="fw-bold text-dark mb-0">{title}</h5>
      
      <div className="position-relative" style={{ cursor: 'pointer' }}>
        <Bell size={24} className="text-secondary" />
        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-light rounded-circle">
          <span className="visually-hidden">New alerts</span>
        </span>
      </div>
    </header>
  );
}