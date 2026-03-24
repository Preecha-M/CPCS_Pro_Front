import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage";
import GuidePage from "./pages/GuidePage";
import AdminPage from "./pages/AdminPage";
import HistoryDetailPage from "./pages/HistoryDetailPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./auth/ProtectedRoute";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import DevDashboard from "./pages/DevDashboard";
import LogsPage from "./pages/LogsPage";
import PageViewBeacon from "./components/PageViewBeacon";

export default function App() {
  return (
    <>
      <PageViewBeacon />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/guide" element={<GuidePage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/register"
          element={
            <ProtectedRoute allow={["admin"]}>
              <RegisterPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={["admin", "researcher"]}>
              <AdminPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/history/:recordId"
          element={
            <ProtectedRoute allow={["admin", "researcher"]}>
              <HistoryDetailPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dev/dashboard"
          element={
            <ProtectedRoute allow={["admin"]}>
              <DevDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/logs"
          element={
            <ProtectedRoute allow={["admin"]}>
              <LogsPage />
            </ProtectedRoute>
          }
        />

        <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
