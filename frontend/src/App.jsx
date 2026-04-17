import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import AnalyzePage from './pages/AnalyzePage'
import ResultPage from './pages/ResultPage'
import AnalyticsPage from './pages/AnalyticsPage'
import AIInsightsPage from './pages/AIInsightsPage'
import HistoryPage from './pages/HistoryPage'
import ProfilePage from './pages/ProfilePage'
import AdminPage from './pages/AdminPage'

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          className: 'cyber-toast',
          style: {
            background: 'rgba(255, 255, 255, 0.8)',
            backdropFilter: 'blur(20px)',
            color: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.5)',
            fontSize: '13px',
            fontWeight: '700',
            fontFamily: 'Inter, sans-serif',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
            padding: '16px 24px',
          },
          success: { 
            iconTheme: { primary: '#10B981', secondary: '#FFFFFF' },
            style: { borderLeft: '4px solid #10B981' }
          },
          error: { 
            iconTheme: { primary: '#EF4444', secondary: '#FFFFFF' },
            style: { borderLeft: '4px solid #EF4444' }
          },
        }}
      />

      <Routes>
        {/* Public routes */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard"   element={<DashboardPage />} />
            <Route path="/analyze"     element={<AnalyzePage />} />
            <Route path="/result"      element={<ResultPage />} />
            <Route path="/analytics"   element={<AnalyticsPage />} />
            <Route path="/ai-insights" element={<AIInsightsPage />} />
            <Route path="/history"     element={<HistoryPage />} />
            <Route path="/profile"     element={<ProfilePage />} />
            <Route path="/integrations" element={<AdminPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  )
}
