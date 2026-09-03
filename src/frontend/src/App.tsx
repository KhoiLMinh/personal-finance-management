import { type JSX } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MainLayout from './components/MainLayout';
import TransactionsPage from './pages/TransactionsPage';
import SavingGoalsPage from './pages/SavingGoalsPage';
import BudgetsPage from './pages/BudgetsPage';
import WalletsPage from './pages/WalletsPage';
import ImportPage from './pages/ImportPage';
import AiAssistantPage from './pages/AiAssistantPage';
import ProfilePage from './pages/ProfilePage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminConfigsPage from './pages/admin/AdminConfigsPage'; // <-- Đã import
import FamilyPage from './pages/FamilyPage';
import RecurringBillsPage from './pages/RecurringBillsPage';
import CategoriesPage from './pages/CategoriesPage';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Component điều hướng luồng chính tự động
const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === 'ADMIN') return <Navigate to="/admin/users" replace />;
  return <Navigate to="/dashboard" replace />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      <Route 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/saving-goals" element={<SavingGoalsPage />} />
        <Route path="/budgets" element={<BudgetsPage />} />
        <Route path="/wallets" element={<WalletsPage />} />
        <Route path="/import" element={<ImportPage />} />
        <Route path="/ai-assistant" element={<AiAssistantPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/change-password" element={<ChangePasswordPage />} />
        <Route path="/categories" element={<CategoriesPage />} />
        
        {/* Admin Routes */}
        <Route path="/admin/users" element={<AdminUsersPage />} />
        <Route path="/admin/categories" element={<AdminCategoriesPage />} />
        <Route path="/admin/configs" element={<AdminConfigsPage />} />
        
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/bills" element={<RecurringBillsPage />} />
        
        <Route path="*" element={<RootRedirect />} />
      </Route>
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