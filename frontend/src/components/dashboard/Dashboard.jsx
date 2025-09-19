// File: frontend/src/components/dashboard/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  AccountCircle,
  DirectionsCar,
  Add,
  LocationOn,
  ExitToApp,
  Dashboard as DashboardIcon,
  BookmarkBorder,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Safe JSON getter
function getJSON(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw == null || raw === '') return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    activeParkingSpots: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    // Read user/token from storage safely
    const storedUser = getJSON('user', null);
    const token = localStorage.getItem('token') || null;

    if (!storedUser || !token) {
      navigate('/login', { replace: true });
      return;
    }

    setUser(storedUser);

    // Fetch profile/stats
    fetchUserStats(token);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const fetchUserStats = async (token) => {
    try {
      const res = await axios.get(`${API_BASE}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // You can use res.data.data.user if you want live profile data:
      // setUser(res.data.data.user);

      // Placeholder stats until you wire real endpoints
      setStats({
        totalBookings: 0,
        activeParkingSpots: 0,
        totalEarnings: 0,
      });
    } catch (error) {
      console.error('Error fetching profile/stats:', error?.response?.data || error.message);
      // If token is invalid/expired, force re-login
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login', { replace: true });
      }
    }
  };

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navigateToAddSpot = () => navigate('/add-parking-spot');
  const navigateToSearch = () => navigate('/search-parking');

  if (!user) return <Box sx={{ p: 3 }}>Loading...</Box>;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Nav Bar */}
      <AppBar position="static" color="primary">
        <Toolbar>
          <DirectionsCar sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ParkSeva
          </Typography>

          <Typography variant="body1" sx={{ mr: 2 }}>
            Welcome, {user.name}
          </Typography>

          <IconButton size="large" onClick={handleMenuOpen} color="inherit">
            <AccountCircle />
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => navigate('/profile')}>Profile</MenuItem>
            <MenuItem onClick={handleLogout}>
              <ExitToApp sx={{ mr: 1 }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Welcome */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {user.role === 'owner'
              ? 'Manage your parking spaces and bookings'
              : 'Find and book parking spaces near you'}
          </Typography>
        </Box>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <BookmarkBorder color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.totalBookings}</Typography>
                    <Typography color="text.secondary">
                      {user.role === 'owner' ? 'Total Bookings' : 'My Bookings'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOn color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">{stats.activeParkingSpots}</Typography>
                    <Typography color="text.secondary">
                      {user.role === 'owner' ? 'Listed Spots' : 'Favorites'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DashboardIcon color="primary" sx={{ mr: 2 }} />
                  <Box>
                    <Typography variant="h4">₹{stats.totalEarnings}</Typography>
                    <Typography color="text.secondary">
                      {user.role === 'owner' ? 'Total Earnings' : 'Total Spent'}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {user.role === 'owner' ? (
            <>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer' }} onClick={navigateToAddSpot}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <Add color="primary" sx={{ mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Add Parking Spot</Typography>
                        <Typography color="text.secondary">List a new parking space for rent</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/my-spots')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <LocationOn color="primary" sx={{ mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Manage My Spots</Typography>
                        <Typography color="text.secondary">View and edit your listed parking spaces</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer' }} onClick={navigateToSearch}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <LocationOn color="primary" sx={{ mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">Find Parking</Typography>
                        <Typography color="text.secondary">Search for parking spaces near you</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/my-bookings')}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
                      <BookmarkBorder color="primary" sx={{ mr: 2, fontSize: 40 }} />
                      <Box>
                        <Typography variant="h6">My Bookings</Typography>
                        <Typography color="text.secondary">View your current and past bookings</Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </>
          )}
        </Grid>

        {/* Account Info */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Account Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{user.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{user.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{user.phone}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Account Type
                </Typography>
                <Chip
                  label={user.role === 'owner' ? 'Parking Owner' : 'User'}
                  color={user.role === 'owner' ? 'primary' : 'default'}
                  size="small"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => navigate('/profile')}>
                Edit Profile
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default Dashboard;
