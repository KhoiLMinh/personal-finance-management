import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Send, Trash2 } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import aiService from '../services/aiService';
import { chatHistoryKey, useAuth } from '../context/AuthContext';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
  error?: boolean;
}

const WELCOME: ChatMessage = {
  id: 'welcome-msg',
  role: 'ai',
  content: 'Chào bạn! Mình có thể gợi ý cách lập ngân sách, tiết kiệm và giải thích các khái niệm tài chính. Hãy hỏi mình bất cứ điều gì.',
};

const SUGGESTIONS = [
  'Gợi ý cách chia thu nhập theo quy tắc 50/30/20',
  'Làm sao để lập quỹ dự phòng khẩn cấp?',
  'Mẹo cắt giảm chi tiêu ăn uống mỗi tháng',
];

/** Minimal rendering of Gemini's markdown: **bold**, "- "/"* " bullets and "1. " numbered lines. Everything else is plain text. */
function inline(text: string) {
  return text.split(/(\*\*.*?\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : <React.Fragment key={i}>{part}</React.Fragment>,
  );
}

function RichText({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;
  const flush = () => {
    if (!list) return;
    const Tag = list.ordered ? 'ol' : 'ul';
    blocks.push(<Tag key={blocks.length} className="mb-2 ps-3">{list.items.map((it, i) => <li key={i}>{inline(it)}</li>)}</Tag>);
    list = null;
  };
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const numbered = /^\d+\.\s+(.*)$/.exec(line);
    if (bullet || numbered) {
      const ordered = !!numbered;
      if (!list || list.ordered !== ordered) { flush(); list = { ordered, items: [] }; }
      list.items.push((bullet ?? numbered)![1]);
    } else {
      flush();
      if (line) blocks.push(<p key={blocks.length} className="mb-2">{inline(line)}</p>);
    }
  }
  flush();
  return <>{blocks}</>;
}

export default function AiAssistantPage() {
  const location = useLocation();
  const { user } = useAuth();
  const storageKey = chatHistoryKey(user?.id ?? 0);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [WELCOME];
    } catch {
      return [WELCOME];
    }
  });
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(messages)); } catch { /* storage full or blocked: history just won't persist */ }
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, storageKey]);

  useEffect(() => {
    if (location.state?.adviceContext) {
      const advice = String(location.state.adviceContext).replace(/\*\*/g, '').replace(/\n/g, ' ').trim();
      setInput(`Dựa trên nhận xét: "${advice}". Hãy lập cho tôi một kế hoạch chi tiêu và tiết kiệm chi tiết cho tháng tới.`);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || isLoading) return;
    setInput('');
    setMessages((prev) => [...prev, { id: `${Date.now()}`, role: 'user', content: question }]);
    setIsLoading(true);
    try {
      const res = await aiService.chatWithAi(question);
      setMessages((prev) => [...prev, { id: `${Date.now()}a`, role: 'ai', content: res.reply }]);
    } catch (e: any) {
      const msg = e.response?.data?.error?.message || 'Không kết nối được tới trợ lý AI. Kiểm tra mạng rồi gửi lại câu hỏi.';
      setMessages((prev) => [...prev, { id: `${Date.now()}e`, role: 'ai', content: msg, error: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clear = () => {
    if (window.confirm('Xóa toàn bộ cuộc trò chuyện trên trình duyệt này?')) setMessages([WELCOME]);
  };

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  return (
    <div className="page d-flex flex-column flex-grow-1" style={{ minHeight: 0 }}>
      <section className="panel d-flex flex-column flex-grow-1 mx-auto w-100" style={{ maxWidth: 880, minHeight: 0 }}>
        <div className="panel-header pb-3 border-bottom">
          <div>
            <h2 className="panel-title">Trợ lý tài chính</h2>
            <div className="small text-secondary">Câu trả lời do AI tạo, có thể chưa chính xác; không thay thế tư vấn tài chính chuyên nghiệp.</div>
          </div>
          <Button variant="outline-secondary" size="sm" onClick={clear} className="d-inline-flex align-items-center gap-1 flex-shrink-0">
            <Trash2 size={14} aria-hidden /> Xóa hội thoại
          </Button>
        </div>

        <div className="flex-grow-1 overflow-auto p-3 d-flex flex-column gap-3" aria-live="polite" style={{ minHeight: 240 }}>
          {messages.map((m) => (
            <div key={m.id} className={`d-flex ${m.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
              <div className={`chat-bubble ${m.role}${m.error ? ' error' : ''}`}>
                <div className="chat-who">{m.role === 'user' ? 'Bạn' : 'Trợ lý AI'}</div>
                {m.role === 'ai' ? <RichText text={m.content} /> : <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{m.content}</p>}
                {m.error && lastUser && (
                  <Button size="sm" variant="link" className="p-0" onClick={() => send(lastUser.content)} disabled={isLoading}>Gửi lại câu hỏi</Button>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="d-flex justify-content-start">
              <div className="chat-bubble ai d-flex align-items-center gap-2 text-secondary small">
                <Spinner animation="border" size="sm" /> Đang soạn câu trả lời…
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-top p-3">
          {messages.length <= 1 && (
            <div className="d-flex flex-wrap gap-2 mb-2">
              {SUGGESTIONS.map((s) => (
                <Button key={s} size="sm" variant="outline-secondary" className="rounded-pill" onClick={() => send(s)} disabled={isLoading}>{s}</Button>
              ))}
            </div>
          )}
          <Form onSubmit={(e) => { e.preventDefault(); send(input); }} className="d-flex gap-2">
            <Form.Control
              aria-label="Câu hỏi cho trợ lý"
              placeholder="Nhập câu hỏi…"
              value={input}
              maxLength={2000}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              autoFocus
            />
            <Button type="submit" disabled={!input.trim() || isLoading} aria-label="Gửi câu hỏi">
              <Send size={18} aria-hidden />
            </Button>
          </Form>
          <div className="small text-secondary mt-2">
            Mỗi câu hỏi được trả lời độc lập; trợ lý chỉ biết tổng số dư hiện tại của bạn, không xem được từng giao dịch. Số liệu chi tiết xem ở mục Báo cáo.
          </div>
        </div>
      </section>
    </div>
  );
}
