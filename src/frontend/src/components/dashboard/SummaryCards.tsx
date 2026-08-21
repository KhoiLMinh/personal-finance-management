import React from 'react';
import { Row, Col } from 'react-bootstrap';
import { TrendingDown, TrendingUp, Wallet, PiggyBank } from 'lucide-react';
import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import StatCard from '../ui/StatCard';

export default function SummaryCards({ overview }: { overview: DashboardOverview }) {
  return (
    <Row className="g-4 mb-4">
      <Col md={6} lg={3}>
        <StatCard
          label="Tổng tiền cá nhân"
          value={formatCurrency(overview.totalBalance)}
          icon={Wallet}
          tone="primary"
        />
      </Col>
      <Col md={6} lg={3}>
        <StatCard
          label="Thu nhập tháng này"
          value={formatCurrency(overview.totalIncome)}
          icon={TrendingUp}
          tone="success"
          subtext={`${overview.incomeChangePercent >= 0 ? '+' : ''}${overview.incomeChangePercent.toFixed(1)}% so với kỳ trước`}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatCard
          label="Chi tiêu tháng này"
          value={formatCurrency(overview.totalExpense)}
          icon={TrendingDown}
          tone="danger"
          subtext={`${overview.expenseChangePercent >= 0 ? '+' : ''}${overview.expenseChangePercent.toFixed(1)}% so với kỳ trước`}
        />
      </Col>
      <Col md={6} lg={3}>
        <StatCard
          label="Tiết kiệm ròng"
          value={formatCurrency(overview.netSavings)}
          icon={PiggyBank}
          tone={overview.netSavings >= 0 ? 'success' : 'danger'}
        />
      </Col>
    </Row>
  );
}