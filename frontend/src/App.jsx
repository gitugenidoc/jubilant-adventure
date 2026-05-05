import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import PatientListPage from "./pages/PatientListPage";
import PatientDetailPage from "./pages/PatientDetailPage";
import PatientCreatePage from "./pages/PatientCreatePage";
import DPIPage from "./pages/DPIPage";
import DMPPage from "./pages/DMPPage";
import ConsentPage from "./pages/ConsentPage";
import AuditPage from "./pages/AuditPage";
import LandingPage from "./pages/LandingPage";

// Protected Route Wrapper
function ProtectedRoute({ children }) {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute>
              <PatientListPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/:id"
          element={
            <ProtectedRoute>
              <PatientDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients/new"
          element={
            <ProtectedRoute>
              <PatientCreatePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dpi/:patientId"
          element={
            <ProtectedRoute>
              <DPIPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dmp/:patientId"
          element={
            <ProtectedRoute>
              <DMPPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consent/:patientId"
          element={
            <ProtectedRoute>
              <ConsentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit"
          element={
            <ProtectedRoute>
              <AuditPage />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
