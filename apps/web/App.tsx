import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProtectedRoute } from './src/components/ProtectedRoute';
import { DashboardPage } from './src/pages/DashboardPage';
import { BuilderPage } from './src/pages/BuilderPage';
import { PublicFormPage } from './src/pages/PublicFormPage';
import { SubmissionsPage } from './src/pages/SubmissionsPage';
import { LoginPage } from './src/pages/LoginPage';
import { SignupPage } from './src/pages/SignupPage';
import { ProfilePage } from './src/pages/ProfilePage';
import { DemoPage } from './src/pages/DemoPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/f/:formId" element={<PublicFormPage />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder"
            element={
              <ProtectedRoute>
                <BuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/builder/:formId"
            element={
              <ProtectedRoute>
                <BuilderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/forms/:formId/submissions"
            element={
              <ProtectedRoute>
                <SubmissionsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
