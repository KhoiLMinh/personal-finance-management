import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// Per-user key: chat history holds private financial questions and must never be shown to another account on the same browser.
export const chatHistoryKey = (userId: number) => `finmanage_chat_history_${userId}`;
const LEGACY_CHAT_KEY = 'finmanage_chat_history';

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string | null;
  role: 'ADMIN' | 'USER';
  provider: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (userData: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const isValidToken = (token: string | null) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch (e) {
    return false;
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  
  const [user, setUser] = useState<User | null>(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');
    
    if (savedUser && isValidToken(savedToken)) {
      return JSON.parse(savedUser);
    }
    return null;
  });

  const [token, setToken] = useState<string | null>(() => {
    const savedToken = localStorage.getItem('access_token');
    
    if (isValidToken(savedToken)) {
      return savedToken;
    }
    
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    return null;
  });

  const login = useCallback((userData: User, newToken: string) => {
    setUser(userData);
    setToken(newToken);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('access_token', newToken);
  }, []);

  const logout = useCallback(() => {
    if (user) localStorage.removeItem(chatHistoryKey(user.id));
    localStorage.removeItem(LEGACY_CHAT_KEY);
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};