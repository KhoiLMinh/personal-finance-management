import { type JSX } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Button } from "react-bootstrap";
import { ShieldAlert } from "lucide-react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MainLayout from "./components/MainLayout";
import TransactionsPage from "./pages/TransactionsPage";
import SavingGoalsPage from "./pages/SavingGoalsPage";
import BudgetsPage from "./pages/BudgetsPage";
import WalletsPage from "./pages/WalletsPage";
import ImportPage from "./pages/ImportPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import ProfilePage from "./pages/ProfilePage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminCategoriesPage from "./pages/admin/AdminCategoriesPage";
import AdminConfigsPage from "./pages/admin/AdminConfigsPage";
import FamilyPage from "./pages/FamilyPage";
import RecurringBillsPage from "./pages/RecurringBillsPage";
import CategoriesPage from "./pages/CategoriesPage";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
}: {
  children: JSX.Element;
  requireAdmin?: boolean;
}) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== "ADMIN") {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center w-100 h-100 p-5 text-center"
        style={{ backgroundColor: "#f8fafc", minHeight: "80vh" }}
      >
        <div className="bg-danger bg-opacity-10 p-4 rounded-circle mb-4">
          <ShieldAlert size={80} className="text-danger" />
        </div>
        <h1 className="fw-bolder text-dark mb-2" style={{ fontSize: "3rem" }}>
          403
        </h1>
        <h3 className="fw-bold text-dark mb-3">Truy cập bị từ chối!</h3>
        <p className="text-muted mb-4 fs-6" style={{ maxWidth: "400px" }}>
          Tài khoản của bạn không có đặc quyền quản trị viên (Admin) để xem
          trang này. Vui lòng quay lại trang tổng quan.
        </p>
        <Button
          variant="primary"
          className="rounded-pill px-4 py-2 fw-bold"
          onClick={() => (window.location.href = "/dashboard")}
        >
          Quay về trang chủ
        </Button>
      </div>
    );
  }

  return children;
};

const RootRedirect = () => {
  const { user } = useAuth();
  if (user?.role === "ADMIN") return <Navigate to="/admin/users" replace />;
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

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminCategoriesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/configs"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminConfigsPage />
            </ProtectedRoute>
          }
        />

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
