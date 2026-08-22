import React from 'react';
import { Card, Button, Spinner, Placeholder, Dropdown } from 'react-bootstrap';
import { Bot, Download, Sparkles, RefreshCw, FileText, FileSpreadsheet } from 'lucide-react';
import { useNavigate } from 'react-router-dom'; // 🌟 Import useNavigate
import type { DashboardOverview } from '../../types/dashboard';

interface Props {
  aiAdvice: string | null;
  aiLoading: boolean;
  aiError: boolean;
  onRetryAi: () => void;
  overview: DashboardOverview;
  onExportExcel: () => void;
  onExportPdf: () => void;
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
//FR03
export default function AiAdviceCard({ aiAdvice, aiLoading, aiError, onRetryAi, onExportExcel, onExportPdf }: Props) {
  const navigate = useNavigate();

  const handleAskAIPlan = () => {
    if (aiAdvice) {
      navigate('/ai-assistant', { state: { adviceContext: aiAdvice } });
    } else {
      navigate('/ai-assistant');
    }
  };

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

        <div className="d-flex gap-3 flex-wrap align-items-center mt-2">
          <Button
            className="fw-bold px-4 rounded-pill d-flex align-items-center border-0"
            style={{ backgroundColor: '#ffffff', color: '#1d4ed8' }}
            onClick={handleAskAIPlan}
          >
            <Bot size={20} className="me-2" /> Hỏi AI về kế hoạch
          </Button>

          <Dropdown>
            <Dropdown.Toggle 
              variant="outline-light" 
              className="fw-bold px-4 rounded-pill d-flex align-items-center hide-caret border"
            >
              <Download size={20} className="me-2" /> Xuất báo cáo
            </Dropdown.Toggle>

            <Dropdown.Menu className="shadow border-0 rounded-3 mt-2">
              <Dropdown.Item onClick={onExportExcel} className="d-flex align-items-center py-2 fw-medium">
                <FileSpreadsheet size={18} className="me-2 text-success" /> Định dạng Excel (.xlsx)
              </Dropdown.Item>
              <Dropdown.Divider className="my-1" />
              <Dropdown.Item onClick={onExportPdf} className="d-flex align-items-center py-2 fw-medium">
                <FileText size={18} className="me-2 text-danger" /> Định dạng PDF (.pdf)
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
        </div>
      </Card.Body>
    </Card>
  );
}