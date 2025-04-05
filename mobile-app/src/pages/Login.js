import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Link, 
  Paper, 
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const { login, loading, error, clearError } = useAuth();

  const validate = () => {
    const errors = {};
    let isValid = true;

    if (!email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    if (validate()) {
      try {
        await login(email, password);
        // Redirect is handled in App.js with Protected Routes
      } catch (err) {
        // Error is handled in the AuthContext
        console.error('Login error:', err);
      }
    }
  };

  return (
    <Box className="auth-container">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          maxWidth: '100%'
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 3, 
            fontWeight: 'bold', 
            color: 'primary.main',
            fontSize: { xs: '1.75rem', sm: '2rem' }
          }}
        >
          SEEKUP
        </Typography>
        <Paper
          elevation={2}
          sx={{
            p: 3,
            width: '100%',
            maxWidth: 360,
            borderRadius: 3,
          }}
          className="auth-paper"
        >
          <Typography 
            component="h2" 
            variant="h5" 
            sx={{ 
              mb: 3, 
              textAlign: 'center',
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            Sign In
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!!formErrors.email}
              helperText={formErrors.email}
              inputProps={{
                autoCapitalize: 'none'
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Don't have an account? Sign Up"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

export default Login;
