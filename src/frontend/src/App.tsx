import { type JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';


const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};


function AppRoutes() {
  return (
    <Routes>

      <Route path="/login" element={<LoginPage />} />
      
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <div className="p-5 text-center">
               <h2>Chào mừng đến với trang Tổng Quan (Dashboard)</h2>
               <button onClick={() => {
                 localStorage.clear();
                 window.location.href = '/login';
               }} className="btn btn-danger mt-3">Đăng xuất</button>
            </div>
          </ProtectedRoute>
        } 
      />


      <Route path="*" element={<Navigate to="/login" replace />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;