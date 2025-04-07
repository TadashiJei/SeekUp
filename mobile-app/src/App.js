import React, { useState, useEffect } from 'react';
import { 
  BrowserRouter as Router, 
  Routes, 
  Route, 
  Navigate, 
  useLocation
} from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Snackbar, Alert, CircularProgress } from '@mui/material';

// Auth Provider
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Components
import AppBottomNavigation from './components/BottomNavigation';
import AppFeatureManager from './components/AppFeatureManager';
import InstallPrompt from './components/InstallPrompt';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import EventDetails from './pages/EventDetails';
import Explore from './pages/Explore';
import Scan from './pages/Scan';
import Passport from './pages/Passport';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import NotFound from './pages/NotFound';
import AnalyticsDashboard from './pages/AnalyticsDashboard';

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
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Store the requested page for redirect after login
    if (!isAuthenticated && !loading) {
      sessionStorage.setItem('redirectAfterLogin', location.pathname);
    }
  }, [isAuthenticated, loading, location]);

  // Loading state
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Check if user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role (if specified)
  if (
    allowedRoles.length > 0 &&
    user &&
    !allowedRoles.includes(user.userType)
  ) {
    return <Navigate to="/home" replace />;
  }

  // User is authenticated and has required role
  return children;
};

function AppContent() {
  const { user, isAuthenticated, loading, error, clearError } = useAuth();
  const [showPWAPrompt, setShowPWAPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
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
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can install the PWA
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
              <EventDetails />
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
          <Route path="/analytics" element={
            <ProtectedRoute allowedRoles={['organization']}>
              <AnalyticsDashboard />
            </ProtectedRoute>
          } />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        
        {/* Bottom Navigation - only show when authenticated */}
        {isAuthenticated && !loading && (
          <AppBottomNavigation userType={user?.userType} />
        )}
        
        {/* Add feature manager for notifications and offline support */}
        {isAuthenticated && !loading && (
          <AppFeatureManager />
        )}
        
        {/* PWA Install Prompt */}
        {showPWAPrompt && (
          <InstallPrompt
            deferredPrompt={deferredPrompt}
            onClose={() => setShowPWAPrompt(false)}
          />
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
      </Router>
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
