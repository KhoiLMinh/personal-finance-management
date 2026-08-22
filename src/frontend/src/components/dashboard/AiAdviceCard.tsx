import React from 'react';
import { Card, Row, Col, Button, Spinner, Placeholder } from 'react-bootstrap';
import { Bot, Download, BellRing, Info, Sparkles, RefreshCw } from 'lucide-react';
import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';
import InsightBadge from './InsightBadge';

interface Props {
  aiAdvice: string | null;
  aiLoading: boolean;
  aiError: boolean;
  onRetryAi: () => void;
  overview: DashboardOverview;
  onExport: () => void;
}

function renderWithBold(text: string | null) {
  if (!text) return null;
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}
//FR-03
export default function AiAdviceCard({ aiAdvice, aiLoading, aiError, onRetryAi, overview, onExport }: Props) {
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


        {aiLoading ? (
          <div className="mb-4">
            <Placeholder as="div" animation="glow">
              <Placeholder xs={9} size="lg" bg="light" style={{ opacity: 0.3, borderRadius: 6 }} />
              <br />
              <Placeholder xs={6} size="lg" bg="light" style={{ opacity: 0.3, borderRadius: 6 }} />
            </Placeholder>
            <div className="d-flex align-items-center gap-2 mt-2 text-white" style={{ opacity: 0.75 }}>
              <Spinner animation="border" size="sm" />
              <span className="small">Đang phân tích số liệu tháng này...</span>
            </div>
          </div>
        ) : aiError ? (
          <div className="mb-4 d-flex align-items-center justify-content-between flex-wrap gap-2">
            <span className="text-white small" style={{ opacity: 0.85 }}>
              Trợ lý AI hiện chưa phản hồi được. Bạn có thể thử lại.
            </span>
            <Button
              size="sm"
              variant="outline-light"
              className="rounded-pill d-flex align-items-center"
              onClick={onRetryAi}
            >
              <RefreshCw size={14} className="me-1" /> Thử lại
            </Button>
          </div>
        ) : (
          <div 
            className="text-white mb-4 lh-base" 
            style={{ fontSize: '1.15rem', whiteSpace: 'pre-wrap', fontWeight: 500 }}
          >
            {renderWithBold(aiAdvice)}
          </div>
        )}

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