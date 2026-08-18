import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

export default function MainLayout() {
  return (
    <Container fluid className="p-0 vh-100 overflow-hidden d-flex bg-light">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
        <Header title="Tổng quan về tài chính" />
        <main className="flex-grow-1 overflow-auto d-flex flex-column" style={{ backgroundColor: '#ffffff' }}>
           <Outlet /> 
           <Footer />
        </main>
      </div>
      <style>{`
        .hover-bg-light:hover { background-color: #f8f9fa !important; }
        .hide-caret::after { display: none !important; }
      `}</style>
    </Container>
  );
}