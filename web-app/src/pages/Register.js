import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Link, 
  Paper, 
  Container,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validate = () => {
    const errors = {};
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
      isValid = false;
    }

    // Email validation
    if (!formData.email) {
      errors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    // User type validation
    if (!formData.userType) {
      errors.userType = 'Please select a user type';
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
        // Remove confirmPassword before sending to API
        const { confirmPassword, ...registerData } = formData;
        await register(registerData);
        navigate('/dashboard');
      } catch (err) {
        // Error is handled in the AuthContext
        console.error('Registration error:', err);
      }
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginY: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
          SEEKUP
        </Typography>
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          <Typography component="h2" variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
            Create an Account
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
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              error={!!formErrors.name}
              helperText={formErrors.name}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleChange}
              error={!!formErrors.email}
              helperText={formErrors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleChange}
              error={!!formErrors.password}
              helperText={formErrors.password}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={!!formErrors.confirmPassword}
              helperText={formErrors.confirmPassword}
            />
            <FormControl 
              fullWidth 
              margin="normal" 
              required
              error={!!formErrors.userType}
            >
              <InputLabel id="user-type-label">I am a</InputLabel>
              <Select
                labelId="user-type-label"
                id="userType"
                name="userType"
                value={formData.userType}
                label="I am a"
                onChange={handleChange}
              >
                <MenuItem value="volunteer">Volunteer</MenuItem>
                <MenuItem value="organization">Organization</MenuItem>
              </Select>
              {formErrors.userType && (
                <FormHelperText>{formErrors.userType}</FormHelperText>
              )}
            </FormControl>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5, fontSize: '1rem' }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {"Already have an account? Sign In"}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
}

export default Register;
