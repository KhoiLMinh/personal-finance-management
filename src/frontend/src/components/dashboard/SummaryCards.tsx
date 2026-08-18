import React from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

export default function SummaryCards({ overview }: { overview: DashboardOverview }) {
  return (
    <Row className="g-4 mb-4">
      <Col md={6}>
        <Card className="border-0 rounded-4 h-100 text-center py-4 shadow-sm" style={{ backgroundColor: '#cfd8dc' }}>
          <h6 className="fw-bold text-dark mb-3">Chi tiêu tháng này</h6>
          <h2 className="fw-bolder mb-0 text-danger" style={{ fontSize: '2.5rem' }}>{formatCurrency(overview.totalExpense)}</h2>
        </Card>
      </Col>
      <Col md={6}>
        <Card className="border-0 rounded-4 h-100 text-center py-4 shadow-sm" style={{ backgroundColor: '#cfd8dc' }}>
          <h6 className="fw-bold text-dark mb-3">Tổng tiền cá nhân</h6>
          <h2 className="fw-bolder mb-0 text-success" style={{ fontSize: '2.5rem' }}>{formatCurrency(overview.totalBalance)}</h2>
        </Card>
      </Col>
    </Row>
  );
}