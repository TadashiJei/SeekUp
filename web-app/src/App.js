import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EventsList from './pages/EventsList';
import EventDetail from './pages/EventDetail';
import CreateEvent from './pages/CreateEvent';
import Profile from './pages/Profile';
import OrganizationVerification from './pages/OrganizationVerification';
import Analytics from './pages/Analytics';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/Layout';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FFC107',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="events" element={<EventsList />} />
              <Route path="events/:id" element={<EventDetail />} />
              <Route path="events/create" element={
                <ProtectedRoute allowedRoles={['organization', 'admin']}>
                  <CreateEvent />
                </ProtectedRoute>
              } />
              <Route path="profile" element={<Profile />} />
              <Route path="verification" element={
                <ProtectedRoute allowedRoles={['organization']}>
                  <OrganizationVerification />
                </ProtectedRoute>
              } />
              <Route path="analytics" element={
                <ProtectedRoute allowedRoles={['organization', 'admin']}>
                  <Analytics />
                </ProtectedRoute>
              } />
            </Route>
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
