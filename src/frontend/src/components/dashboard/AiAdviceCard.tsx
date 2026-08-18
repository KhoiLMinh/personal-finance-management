import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Bot, Download, BellRing, Info } from 'lucide-react';
import type { DashboardOverview } from '../../types/dashboard';
import { formatCurrency } from '../../utils/format';

interface Props {
  aiAdvice: string;
  overview: DashboardOverview;
  onExport: () => void;
}

export default function AiAdviceCard({ aiAdvice, overview, onExport }: Props) {
  return (
    <Card className="border-0 rounded-4 mb-4" style={{ backgroundColor: '#cfd8dc' }}>
      <Card.Body className="p-4">
        <h4 className="fw-bold text-dark mb-4 lh-base" style={{ fontSize: '1.25rem' }}>"{aiAdvice}"</h4>
        <Row className="g-3 mb-4">
          <Col md={6}>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#b0bec5' }}>
              <span className="fw-medium text-dark d-flex align-items-start">
                <Info size={18} className="me-2 mt-1 flex-shrink-0"/>
                <span>Dự báo: Tháng này bạn có thể tiết kiệm thêm {formatCurrency(overview.netSavings > 0 ? overview.netSavings : 0)} nếu duy trì nhịp độ này.</span>
              </span>
            </div>
          </Col>
          <Col md={6}>
            <div className="p-3 rounded-3" style={{ backgroundColor: '#b0bec5' }}>
              <span className="fw-medium text-dark d-flex align-items-start">
                <BellRing size={18} className="me-2 mt-1 flex-shrink-0"/>
                <span>Cảnh báo: Kiểm tra lại các khoản chi vượt ngân sách (nếu có).</span>
              </span>
            </div>
          </Col>
        </Row>
        <div className="d-flex gap-3 flex-wrap">
          <Button variant="info" className="fw-bold px-4 rounded-pill text-white shadow-sm d-flex align-items-center" style={{ backgroundColor: '#29b6f6', border: 'none' }}>
            <Bot size={20} className="me-2" /> Hỏi AI về kế hoạch
          </Button>
          <Button onClick={onExport} variant="info" className="fw-bold px-4 rounded-pill text-white shadow-sm d-flex align-items-center" style={{ backgroundColor: '#29b6f6', border: 'none' }}>
            <Download size={20} className="me-2" /> Xuất báo cáo Excel
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
}