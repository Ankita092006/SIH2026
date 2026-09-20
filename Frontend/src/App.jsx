import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import GameMenu from './pages/GameMenu';
import GameInstructions from './pages/GameInstructions';
import GameView from './pages/GameView';
import Results from './pages/Results';
import ResultsHistory from './pages/ResultsHistory';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';

import MemoryVault from './pages/MemoryVault';
import VoiceAssistantPage from './pages/VoiceAssistantPage';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';

import CaregiverLayout from './pages/caregiver/CaregiverLayout';
import CaregiverDashboard from './pages/caregiver/CaregiverDashboard';
import PatientProfile from './pages/caregiver/PatientProfile';
import Trends from './pages/caregiver/Trends';
import Adherence from './pages/caregiver/Adherence';
import Alerts from './pages/caregiver/Alerts';
import MemoryLibrary from './pages/caregiver/MemoryLibrary';
import CaregiverInsights from './pages/CaregiverDashboard';

import NavBar from './components/NavBar';
import SkipLink from './components/common/SkipLink';
import OfflineBanner from './components/common/OfflineBanner';

import { getGameResults, saveGameResult } from './services/gameService';
import { getReminders, saveReminders } from './services/reminderService';
import { patientResults, remindersData } from './data/mockData';

import { AuthProvider, useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { AccessibilityProvider } from './context/AccessibilityContext';

// App Layout wrapper to control navigation bar display
const AppLayout = ({ children }) => {
  const location = useLocation();

  const hideNavBarPaths = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/games/',
    '/instructions',
    '/play',
    '/unauthorized'
  ];

  const shouldShowNavBar =
    !hideNavBarPaths.some(path => location.pathname.includes(path)) ||
    location.pathname === '/games';

  const isAuthPage = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password'
  ].includes(location.pathname);

  // Caregiver pages have their own navigation
  const isCaregiver = location.pathname.startsWith('/caregiver');

  return (
    <div className="app-container">
      <SkipLink />
      <OfflineBanner />
      <main id="main-content" className="main-content" tabIndex="-1">
        {children}
      </main>
      {!isAuthPage && shouldShowNavBar && !isCaregiver && <NavBar />}
    </div>
  );
};

// Protected Route Guard
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Checking credentials...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

function App() {
  useEffect(() => {
    // Seed initial mock data if not already present
    if (getGameResults().length === 0) {
      [...patientResults].reverse().forEach(res => {
        saveGameResult({
          gameId: res.gameId,
          score: res.score,
          accuracy: res.accuracy,
          timeTaken: res.timeTaken,
          summary: res.summary
        });
      });
    }

    if (getReminders().length === 0) {
      saveReminders(
        remindersData.map(r => ({
          ...r,
          id: r.id.toString()
        }))
      );
    }
  }, []);

  return (
    <AccessibilityProvider>
      <LanguageProvider>
        <AuthProvider>
          <BrowserRouter>
            <AppLayout>
              <Routes>
                {/* Public Auth Routes */}
                <Route path="/" element={<Navigate to="/home" replace />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />

                {/* Core App Protected Routes */}
                <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/games" element={<ProtectedRoute><GameMenu /></ProtectedRoute>} />
                <Route path="/games/:gameId/instructions" element={<ProtectedRoute><GameInstructions /></ProtectedRoute>} />
                <Route path="/games/:gameId/play" element={<ProtectedRoute><GameView /></ProtectedRoute>} />
                <Route path="/games/:gameId/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
                <Route path="/results" element={<ProtectedRoute><ResultsHistory /></ProtectedRoute>} />
                <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                {/* Intelligent Systems Routes */}
                <Route path="/memory" element={<ProtectedRoute><MemoryVault /></ProtectedRoute>} />
                <Route path="/voice" element={<ProtectedRoute><VoiceAssistantPage /></ProtectedRoute>} />

                {/* Role-Based Caregiver Portal Routes */}
                <Route
                  path="/caregiver"
                  element={
                    <ProtectedRoute allowedRoles={['caregiver', 'admin']}>
                      <CaregiverLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<CaregiverDashboard />} />
                  <Route path="dashboard" element={<CaregiverDashboard />} />
                  <Route path="patient" element={<PatientProfile />} />
                  <Route path="trends" element={<Trends />} />
                  <Route path="adherence" element={<Adherence />} />
                  <Route path="alerts" element={<Alerts />} />
                  <Route path="memory" element={<MemoryLibrary />} />
                  <Route path="insights" element={<CaregiverInsights />} />
                </Route>

                {/* Error & Catch-all Fallbacks */}
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppLayout>
          </BrowserRouter>
        </AuthProvider>
      </LanguageProvider>
    </AccessibilityProvider>
  );
}

export default App;
