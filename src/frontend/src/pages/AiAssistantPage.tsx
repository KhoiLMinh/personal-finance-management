import React, { useState, useRef, useEffect } from 'react';
import { Card, Form, Button, InputGroup, Spinner } from 'react-bootstrap';
import { Bot, Send, User, Trash2 } from 'lucide-react'; // Thêm icon Trash2
import aiService from '../services/aiService';

// Định nghĩa kiểu dữ liệu cho 1 tin nhắn
interface ChatMessage {
  id: string;
  role: 'ai' | 'user';
  content: string;
}

const STORAGE_KEY = 'finmanage_chat_history'; // Tên key lưu trong LocalStorage

export default function AiAssistantPage() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // 1. Tự động lấy lịch sử từ LocalStorage khi mới vào trang
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const savedChat = localStorage.getItem(STORAGE_KEY);
    if (savedChat) {
      return JSON.parse(savedChat);
    }
    // Nếu chưa có lịch sử, hiển thị câu chào mặc định
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

  // 2. Mỗi khi mảng 'messages' thay đổi -> Tự động lưu xuống LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userText = input.trim();
    setInput(''); 

    // Thêm tin nhắn của User
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    try {
      // Gọi API Gemini
      const response = await aiService.chatWithAi(userText);
      
      // Thêm tin nhắn trả lời của AI
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

  // 3. Hàm xử lý Xóa lịch sử chat
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
    <div className="p-4 flex-grow-1 d-flex flex-column" style={{ backgroundColor: '#e2e8f0', height: '100%' }}>
      <Card className="border-0 rounded-4 shadow-sm flex-grow-1 d-flex flex-column overflow-hidden">
        
        {/* HEADER CHAT CÓ THÊM NÚT XÓA LỊCH SỬ */}
        <div className="p-3 border-bottom d-flex align-items-center justify-content-between" style={{ backgroundColor: '#9ca3af' }}>
          <div className="d-flex align-items-center gap-3">
            <div 
              className="d-flex align-items-center justify-content-center rounded-3 shadow-sm"
              style={{ width: 48, height: 48, backgroundColor: '#6b7280' }}
            >
              <Bot size={28} color="#ffffff" />
            </div>
            <div>
              <h5 className="fw-bold text-dark mb-0">Trợ lý Phân tích AI FinManage</h5>
              <small className="text-dark opacity-75">Powered by Google Gemini 1.5 Flash</small>
            </div>
          </div>
          
          <Button 
            variant="outline-dark" 
            size="sm" 
            className="rounded-pill d-flex align-items-center fw-medium border-0"
            onClick={handleClearChat}
            title="Làm mới cuộc trò chuyện"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
          >
            <Trash2 size={16} className="me-2 text-danger" /> Xóa lịch sử
          </Button>
        </div>

        {/* KHU VỰC HIỂN THỊ TIN NHẮN */}
        <Card.Body className="p-4 overflow-auto d-flex flex-column gap-3" style={{ backgroundColor: '#cfd8dc' }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`d-flex ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}
            >
              <div 
                className={`p-3 rounded-4 shadow-sm ${msg.role === 'user' ? 'text-white' : 'text-dark'}`}
                style={{ 
                  maxWidth: '75%', 
                  backgroundColor: msg.role === 'user' ? 'var(--color-primary)' : '#b0bec5',
                  borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                  borderBottomLeftRadius: msg.role === 'ai' ? '4px' : '16px',
                }}
              >
                <div className="d-flex align-items-center gap-2 mb-1 opacity-75 small fw-bold">
                  {msg.role === 'user' ? <User size={14}/> : <Bot size={14}/>}
                  {msg.role === 'user' ? 'Bạn' : 'AI Assistant'}
                </div>
                <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', fontSize: '1rem' }}>
                  {/* Sử dụng Regex đơn giản để format chữ in đậm (nếu AI trả về **bold**) */}
                  <span dangerouslySetInnerHTML={{ __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                </div>
              </div>
            </div>
          ))}

          {/* Hiển thị hiệu ứng AI đang gõ chữ */}
          {isLoading && (
            <div className="d-flex justify-content-start">
              <div className="p-3 rounded-4 shadow-sm" style={{ backgroundColor: '#b0bec5', borderBottomLeftRadius: '4px' }}>
                <Spinner animation="grow" size="sm" variant="dark" className="opacity-50" />
                <span className="ms-2 small text-dark opacity-75">Đang phân tích dữ liệu...</span>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </Card.Body>

        {/* KHU VỰC NHẬP TIN NHẮN */}
        <div className="p-3 border-top" style={{ backgroundColor: '#cfd8dc' }}>
          <Form onSubmit={handleSendMessage}>
            <InputGroup className="shadow-sm rounded-pill overflow-hidden border-0">
              <Form.Control
                size="lg"
                className="border-0 shadow-none px-4"
                style={{ backgroundColor: '#9ca3af', color: '#ffffff' }}
                placeholder="Nhập câu hỏi tài chính của bạn..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={isLoading}
                autoFocus
              />
              <Button 
                type="submit" 
                variant="dark" 
                className="px-4 border-0 d-flex align-items-center justify-content-center"
                disabled={!input.trim() || isLoading}
                style={{ backgroundColor: '#6b7280' }}
              >
                <Send size={20} className={input.trim() ? "text-white" : "opacity-50"} />
              </Button>
            </InputGroup>
          </Form>
        </div>

      </Card>
    </div>
  );
}