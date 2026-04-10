import { Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

// Pages
import LandingPage from "./pages/LandingPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import LeadsPage from "./pages/dashboard/LeadsPage";
import CadencesPage from "./pages/dashboard/CadencesPage";
import CadenceEditorPage from "./pages/dashboard/CadenceEditorPage";
import LessonsPage from "./pages/dashboard/LessonsPage";
import LessonDetailPage from "./pages/dashboard/LessonDetailPage";
import SettingsPage from "./pages/dashboard/SettingsPage";

function PrivateRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("access_token");
  return !token ? children : <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={<PrivateRoute><DashboardLayout /></PrivateRoute>}
      >
        <Route index element={<DashboardHome />} />
        <Route path="leads" element={<LeadsPage />} />
        <Route path="cadences" element={<CadencesPage />} />
        <Route path="cadences/new" element={<CadenceEditorPage />} />
        <Route path="cadences/:id/edit" element={<CadenceEditorPage />} />
        <Route path="lessons" element={<LessonsPage />} />
        <Route path="lessons/:slug" element={<LessonDetailPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
