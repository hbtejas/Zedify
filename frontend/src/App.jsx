import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import PrivateRoute from './components/PrivateRoute';

import Login from './pages/Login';
import Register from './pages/Register';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import VideoSession from './pages/VideoSession';
import VideoSessions from './pages/VideoSessions';
import Exchange from './pages/Exchange';
import EditProfile from './pages/EditProfile';
import Settings from './pages/Settings';
import Network from './pages/Network';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <div className="page-fade-in">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route path="/feed" element={<PrivateRoute><Home /></PrivateRoute>} />
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              {/* /profile/edit MUST come before /profile/:id to avoid 'edit' being treated as an id */}
              <Route path="/profile/edit" element={<PrivateRoute><EditProfile /></PrivateRoute>} />
              <Route path="/profile/:id" element={<PrivateRoute><Profile /></PrivateRoute>} />
              <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/chat/:userId" element={<PrivateRoute><Chat /></PrivateRoute>} />
              <Route path="/video" element={<PrivateRoute><VideoSessions /></PrivateRoute>} />
              <Route path="/video/session/:sessionId" element={<PrivateRoute><VideoSession /></PrivateRoute>} />
              <Route path="/exchange" element={<PrivateRoute><Exchange /></PrivateRoute>} />
              <Route path="/network" element={<PrivateRoute><Network /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
