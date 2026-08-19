import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { TrendingDown, Wallet } from 'lucide-react';
import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import StatCard from '../ui/StatCard';

export default function SummaryCards({ overview }: { overview: DashboardOverview }) {
  return (
    <Row className="g-4 mb-4">
      <Col md={6}>
        <StatCard
          label="Chi tiêu tháng này"
          value={formatCurrency(overview.totalExpense)}
          icon={TrendingDown}
          tone="danger"
        />
      </Col>
      <Col md={6}>
        <StatCard
          label="Tổng tiền cá nhân"
          value={formatCurrency(overview.totalBalance)}
          icon={Wallet}
          tone="primary"
        />
      </Col>
    </Row>
  );
}