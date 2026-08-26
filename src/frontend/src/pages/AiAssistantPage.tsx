import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Bot, Send, User, Trash2 } from 'lucide-react';
import aiService from '../services/aiService';

interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

const STORAGE_KEY = 'finmanage_chat_history';

function renderWithBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part}</React.Fragment>
  );
}

export default function AiAssistantPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedChat = localStorage.getItem(STORAGE_KEY);
    if (savedChat) {
      return JSON.parse(savedChat);
    }
    return [
      {
        id: 'welcome-msg',
        role: 'ai',
        content: 'Xin chào! Tôi là Trợ lý AI Tài chính FinManage. Bạn cần tôi tư vấn về ngân sách, lập kế hoạch tiết kiệm hay đánh giá khoản chi tiêu nào?'
      }
    ];
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput('');

    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      const response = await aiService.chatWithAi(userText);
      const aiReplyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: response.reply
      };
      setMessages(prev => [...prev, aiReplyMsg]);
    } catch (error: any) {
      console.error("Lỗi Chat AI:", error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: 'Xin lỗi, hệ thống AI đang gặp sự cố. Vui lòng kiểm tra lại kết nối!'
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử trò chuyện này không?")) {
      const initialMsg: ChatMessage[] = [
        {
          id: 'welcome-msg',
          role: 'ai',
          content: 'Xin chào! Tôi là Trợ lý AI Tài chính FinManage. Bạn cần tôi tư vấn về ngân sách, lập kế hoạch tiết kiệm hay đánh giá khoản chi tiêu nào?'
        }
      ];
      setMessages(initialMsg);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initialMsg));
    }
  };

  return (
    <div className="p-4 flex-grow-1 d-flex flex-column" style={{ backgroundColor: 'var(--color-bg)', height: '100%' }}>
      <Card className="border-0 rounded-4 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden">
        
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-primary-lighter">
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{ width: 48, height: 48, backgroundColor: 'var(--color-primary)' }}
            >
              <Bot size={28} color="#ffffff" />
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-0">Trợ lý Phân tích AI FinManage</h5>
              <small className="text-muted">Powered by Google Gemini</small>
            </div>
          </div>
          
          <Button 
            variant="outline-secondary" 
            size="sm" 
            className="rounded-pill d-flex align-items-center fw-medium"
            onClick={handleClearChat}
            title="Làm mới cuộc trò chuyện"
          >
            <Trash2 size={16} className="me-2 text-danger" /> Xóa lịch sử
          </Button>
        </div>

        <Card.Body className="p-4 overflow-auto d-flex flex-column gap-3" style={{ backgroundColor: 'var(--color-bg)' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div 
                className={`p-3 rounded-4 shadow-sm ${msg.role === 'user' ? 'text-white' : 'text-dark'}`}
                style={{ 
                  maxWidth: '75%', 
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : '#ffffff',
                  border: msg.role === 'ai' ? '1px solid var(--color-border)' : 'none',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1 opacity-75 small fw-bold">
                  {msg.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                  {msg.role === 'user' ? 'Bạn' : 'AI Assistant'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '1rem' }}>
                  {renderWithBold(msg.content)}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="d-flex justify-content-start">
              <div className="p-3 rounded-4 shadow-sm bg-white border" style={{ borderBottomLeftRadius: '4px' }}>
                <Spinner animation="grow" size="sm" variant="primary" className="opacity-50" />
                <span className="ms-2 small text-muted">Đang phân tích dữ liệu...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </Card.Body>

        <div className="p-3 border-top bg-white">
          <Form onSubmit={handleSendMessage}>
            <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
              <Form.Control
                size="lg"
                className="border-0 shadow-none px-4"
                placeholder="Nhập câu hỏi tài chính của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <Button 
                type="submit" 
                className="px-4 border-0 d-flex align-items-center justify-content-center"
                disabled={!input.trim() || isLoading}
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                <Send size={20} className="text-white" />
              </Button>
            </InputGroup>
          </Form>
        </div>

      </Card>
    </div>
  );
}