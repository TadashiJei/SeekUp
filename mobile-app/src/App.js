import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Snackbar, Alert } from '@mui/material';

// Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Explore from './pages/Explore';
import EventDetail from './pages/EventDetail';
import Scan from './pages/Scan';
import Passport from './pages/Passport';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';

// Components
import BottomNavigation from './components/BottomNavigation';
import InstallPrompt from './components/InstallPrompt';

// Create theme for mobile app
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
      paper: '#ffffff',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '1.5rem',
      fontWeight: 500,
    },
    h2: {
      fontSize: '1.25rem',
      fontWeight: 500,
    },
    h3: {
      fontSize: '1.1rem',
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
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 56,
        },
      },
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Box sx={{ p: 3, textAlign: 'center' }}>Loading...</Box>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.userType)) {
    return <Navigate to="/" />;
  }

  return children;
};

function AppContent() {
  const { user, isAuthenticated, loading, error, clearError } = useAuth();
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [isFirstLaunch, setIsFirstLaunch] = useState(false);
  
  // Check if it's the user's first time using the app
  useEffect(() => {
    const hasLaunchedBefore = localStorage.getItem('hasLaunchedBefore');
    if (!hasLaunchedBefore && !loading) {
      setIsFirstLaunch(true);
      localStorage.setItem('hasLaunchedBefore', 'true');
    }
  }, [loading]);
  
  // Check if the app can be installed as PWA
  useEffect(() => {
    let deferredPrompt;
    
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      deferredPrompt = e;
      // Update UI to notify the user they can add to home screen
      setShowPWAPrompt(true);
    };
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);
  
  // Handle auth error
  useEffect(() => {
    if (error) {
      setSnackbarMessage(error);
      setSnackbarOpen(true);
    }
  }, [error]);
  
  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
    clearError();
  };

  return (
    <Box className="app-container">
      <Router>
        {isFirstLaunch && isAuthenticated && (
          <Navigate to="/onboarding" replace />
        )}
        
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={
            isAuthenticated ? <Navigate to="/" /> : <Login />
          } />
          <Route path="/register" element={
            isAuthenticated ? <Navigate to="/" /> : <Register />
          } />
          <Route path="/onboarding" element={
            <ProtectedRoute>
              <Onboarding />
            </ProtectedRoute>
          } />
          
          {/* Main App Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/home" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          <Route path="/explore" element={
            <ProtectedRoute>
              <Explore />
            </ProtectedRoute>
          } />
          <Route path="/events/:id" element={
            <ProtectedRoute>
              <EventDetail />
            </ProtectedRoute>
          } />
          <Route path="/scan" element={
            <ProtectedRoute>
              <Scan />
            </ProtectedRoute>
          } />
          <Route path="/passport" element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <Passport />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Bottom Navigation - only show when authenticated */}
        {isAuthenticated && !loading && (
          <BottomNavigation userType={user?.userType} />
        )}
      </Router>
      
      {/* PWA Install Prompt */}
      {showPWAPrompt && (
        <InstallPrompt onClose={() => setShowPWAPrompt(false)} />
      )}
      
      {/* Snackbar for Errors */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
