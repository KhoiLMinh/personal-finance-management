import React from 'react';
import { Button, Spinner } from 'react-bootstrap';
import { Bot, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  aiAdvice: string | null;
  aiLoading: boolean;
  aiError: boolean;
  onRequest: () => void;
  periodLabel: string;
}

function renderWithBold(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

// FR-03. Generated on request only: each call costs Gemini quota and the figures above are already exact.
export default function AiAdviceCard({ aiAdvice, aiLoading, aiError, onRequest, periodLabel }: Props) {
  const navigate = useNavigate();

  return (
    <section className="panel" aria-live="polite">
      <div className="panel-header">
        <h2 className="panel-title d-flex align-items-center gap-2"><Sparkles size={16} aria-hidden /> Nhận xét của trợ lý AI</h2>
        <span className="status-pill neutral">Do AI tạo, có thể chưa chính xác</span>
      </div>
      <div className="panel-body">
        {aiLoading ? (
          <div className="d-flex align-items-center gap-2 small text-secondary">
            <Spinner animation="border" size="sm" /> Đang phân tích số liệu {periodLabel.toLowerCase()}…
          </div>
        ) : aiAdvice ? (
          <div className="small" style={{ whiteSpace: 'pre-wrap', maxWidth: '75ch', lineHeight: 1.6 }}>{renderWithBold(aiAdvice)}</div>
        ) : (
          <p className="small text-secondary mb-0" style={{ maxWidth: '75ch' }}>
            {aiError
              ? 'Trợ lý AI chưa phản hồi được. Số liệu phía trên vẫn chính xác; bạn có thể thử lại sau.'
              : `Nhờ trợ lý đọc số liệu ${periodLabel.toLowerCase()} và gợi ý hai việc nên làm.`}
          </p>
        )}

        <div className="d-flex flex-wrap gap-2 mt-3">
          <Button size="sm" variant={aiAdvice ? 'outline-secondary' : 'primary'} onClick={onRequest} disabled={aiLoading}>
            {aiAdvice || aiError ? 'Phân tích lại' : 'Phân tích kỳ này'}
          </Button>
          <Button
            size="sm"
            variant="outline-secondary"
            className="d-inline-flex align-items-center gap-1"
            onClick={() => navigate('/ai-assistant', aiAdvice ? { state: { adviceContext: aiAdvice } } : undefined)}
          >
            <Bot size={16} aria-hidden /> Hỏi thêm trợ lý
          </Button>
        </div>
      </div>
    </section>
  );
}
