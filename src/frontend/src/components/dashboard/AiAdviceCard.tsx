import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Bot, Download, BellRing, Info, Sparkles } from 'lucide-react';
import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import InsightBadge from './InsightBadge';

interface Props {
  aiAdvice: string;
  overview: DashboardOverview;
  onExport: () => void;
}

export default function AiAdviceCard({ aiAdvice, overview, onExport }: Props) {
  return (
    <Card
      className="border-0 rounded-4 mb-4"
      style={{
        background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 45%, #2563eb 100%)',
      }}
    >
      <Card.Body className="p-4">
        <div className="d-flex align-items-center gap-2 mb-3 text-white">
          <Sparkles size={18} />
          <span className="fw-semibold text-uppercase small" style={{ letterSpacing: '0.06em', opacity: 0.85 }}>
            Trợ lý AI
          </span>
        </div>

        <h4 className="fw-bold text-white mb-4 lh-base" style={{ fontSize: '1.2rem' }}>
          "{aiAdvice}"
        </h4>

        <Row className="g-3 mb-4">
          <Col md={6}>
            <InsightBadge icon={Info}>
              Dự báo: Tháng này bạn có thể tiết kiệm thêm{' '}
              {formatCurrency(overview.netSavings > 0 ? overview.netSavings : 0)} nếu duy trì nhịp độ này.
            </InsightBadge>
          </Col>
          <Col md={6}>
            <InsightBadge icon={BellRing}>
              Cảnh báo: Kiểm tra lại các khoản chi vượt ngân sách (nếu có).
            </InsightBadge>
          </Col>
        </Row>

        <div className="d-flex gap-3 flex-wrap">
          <Button
            className="fw-bold px-4 rounded-pill d-flex align-items-center border-0"
            style={{ backgroundColor: '#ffffff', color: '#1d4ed8' }}
          >
            <Bot size={20} className="me-2" /> Hỏi AI về kế hoạch
          </Button>
          <Button
            onClick={onExport}
            variant="outline-light"
            className="fw-bold px-4 rounded-pill d-flex align-items-center"
          >
            <Download size={20} className="me-2" /> Xuất báo cáo Excel
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}