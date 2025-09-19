// File: frontend/src/components/auth/LoginForm.jsx
import React, { useState } from 'react';
import {
  Box, Card, CardContent, TextField, Button, Typography, Alert,
  CircularProgress, Link, Divider
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((s) => ({ ...s, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (res.data?.success && res.data?.data) {
        const { token, user } = res.data.data; // <-- FIX
        localStorage.setItem('token', token);                    // store token as plain string
        localStorage.setItem('user', JSON.stringify(user));      // store user as JSON
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.data?.message || 'Login failed. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    setError('');

    const demoCredentials = {
      user: { email: 'demo.user@parkseva.com', password: 'demo123' },
      owner: { email: 'demo.owner@parkseva.com', password: 'demo123' },
    };

    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, demoCredentials[role]);

      if (res.data?.success && res.data?.data) {
        const { token, user } = res.data.data; // <-- FIX
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.data?.message || 'Demo login failed. Please try again.');
      }
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Demo login failed. Please use manual login or register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', bgcolor: '#f5f5f5', p: 2
    }}>
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
            Welcome Back
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to your ParkSeva account
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              required fullWidth label="Email Address" name="email" type="email"
              value={formData.email} onChange={handleChange} autoComplete="email" sx={{ mb: 2 }}
            />
            <TextField
              required fullWidth label="Password" name="password" type="password"
              value={formData.password} onChange={handleChange} autoComplete="current-password" sx={{ mb: 3 }}
            />

            <Button type="submit" fullWidth variant="contained" size="large" disabled={loading} sx={{ mb: 2 }}>
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>

            <Box textAlign="center" sx={{ mb: 2 }}>
              <Typography variant="body2">
                Don&apos;t have an account?{' '}
                <Link component={RouterLink} to="/signup">Create one here</Link>
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">OR</Typography>
            </Divider>

            <Typography variant="subtitle2" align="center" sx={{ mb: 2 }}>
              Try Demo Accounts
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
              <Button variant="outlined" size="small" fullWidth onClick={() => handleDemoLogin('user')} disabled={loading}>
                Demo User
              </Button>
              <Button variant="outlined" size="small" fullWidth onClick={() => handleDemoLogin('owner')} disabled={loading}>
                Demo Owner
              </Button>
            </Box>

            <Typography variant="caption" display="block" align="center" color="text.secondary">
              Demo accounts for testing the application
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoginForm;
