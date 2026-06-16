import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Feature Pages
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import Roadmap from './pages/Roadmap';
import SkillGap from './pages/SkillGap';
import ProjectGenerator from './pages/ProjectGenerator';
import ResourceHub from './pages/ResourceHub';
import InternshipTracker from './pages/InternshipTracker';
import DailyTasks from './pages/DailyTasks';
import AICoach from './pages/AICoach';

export const App: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const isGuest = localStorage.getItem('isGuest') === 'true';
  const showDashboard = isAuthenticated || isGuest;

  return (
    <Router>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Conditional Root & App Layout */}
        {showDashboard ? (
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="resume" element={<ResumeAnalyzer />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="skill-gap" element={<SkillGap />} />
            <Route path="projects" element={<ProjectGenerator />} />
            <Route path="resources" element={<ResourceHub />} />
            <Route path="internships" element={<InternshipTracker />} />
            <Route path="daily-tasks" element={<DailyTasks />} />
            <Route path="coach" element={<AICoach />} />
          </Route>
        ) : (
          <Route path="/" element={<LandingPage />} />
        )}

        {/* Redirect Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
