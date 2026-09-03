import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import GameMenu from './pages/GameMenu';
import GameInstructions from './pages/GameInstructions';
import GameView from './pages/GameView';
import Results from './pages/Results';
import ResultsHistory from './pages/ResultsHistory';
import Reminders from './pages/Reminders';
import Profile from './pages/Profile';
import NavBar from './components/NavBar';
import { getGameResults, saveGameResult } from './services/gameService';
import { getReminders, saveReminders } from './services/reminderService';
import { patientResults, remindersData } from './data/mockData';

// A wrapper component to conditionally show the NavBar
const AppLayout = ({ children }) => {
  const location = useLocation();
  const hideNavBarPaths = ['/login', '/games/', '/instructions', '/play'];
  const shouldShowNavBar = !hideNavBarPaths.some(path => location.pathname.includes(path)) || location.pathname === '/games';
  
  // Special exception: don't show on login
  const isLogin = location.pathname === '/login';

  return (
    <div className="app-container">
      <div className="main-content">
        {children}
      </div>
      {!isLogin && shouldShowNavBar && <NavBar />}
    </div>
  );
};

// A wrapper for protected routes
const ProtectedRoute = ({ children }) => {
  if (localStorage.getItem('isAuthenticated') !== 'true') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  useEffect(() => {
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
      saveReminders(remindersData.map(r => ({ ...r, id: r.id.toString() })));
    }
  }, []);

  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/games" element={<ProtectedRoute><GameMenu /></ProtectedRoute>} />
          <Route path="/games/:gameId/instructions" element={<ProtectedRoute><GameInstructions /></ProtectedRoute>} />
          <Route path="/games/:gameId/play" element={<ProtectedRoute><GameView /></ProtectedRoute>} />
          <Route path="/games/:gameId/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
          <Route path="/results" element={<ProtectedRoute><ResultsHistory /></ProtectedRoute>} />
          <Route path="/reminders" element={<ProtectedRoute><Reminders /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}

export default App;
