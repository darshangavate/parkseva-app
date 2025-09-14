// File: frontend/src/components/common/LandingPage.jsx
import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Stack
} from '@mui/material';
import {
  DirectionsCar,
  LocationOn,
  Security,
  Payment,
  Star
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <LocationOn sx={{ fontSize: 40 }} />,
      title: 'Find Parking Anywhere',
      description: 'Discover available parking spots in your area with real-time updates'
    },
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: 'Secure & Safe',
      description: 'All parking locations are verified and secure for your peace of mind'
    },
    {
      icon: <Payment sx={{ fontSize: 40 }} />,
      title: 'Easy Payments',
      description: 'Multiple payment options including UPI, cards, and digital wallets'
    },
    {
      icon: <Star sx={{ fontSize: 40 }} />,
      title: 'Rated Locations',
      description: 'Choose from highly rated parking spaces with user reviews'
    }
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar>
          <DirectionsCar sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            ParkSeva
          </Typography>
          <Button color="inherit" onClick={() => navigate('/login')}>
            Login
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/signup')}
            sx={{ ml: 1 }}
          >
            Sign Up
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" gutterBottom>
            Find Parking. List Spaces.
          </Typography>
          <Typography variant="h5" component="p" sx={{ mb: 4 }}>
            India's first peer-to-peer parking marketplace. Connect with parking space owners and find the perfect spot for your vehicle.
          </Typography>
          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2} 
            justifyContent="center"
          >
            <Button
              variant="contained"
              size="large"
              color="secondary"
              onClick={() => navigate('/signup')}
              sx={{ minWidth: 200 }}
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              size="large"
              sx={{ 
                color: 'white', 
                borderColor: 'white',
                minWidth: 200,
                '&:hover': {
                  borderColor: 'white',
                  bgcolor: 'rgba(255,255,255,0.1)'
                }
              }}
              onClick={() => navigate('/login')}
            >
              Sign In
            </Button>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography 
          variant="h3" 
          component="h2" 
          textAlign="center" 
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose ParkSeva?
        </Typography>
        
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card sx={{ height: '100%', textAlign: 'center', p: 2 }}>
                <CardContent>
                  <Box sx={{ color: 'primary.main', mb: 2 }}>
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How It Works */}
      <Box sx={{ bgcolor: '#f5f5f5', py: 8 }}>
        <Container maxWidth="lg">
          <Typography 
            variant="h3" 
            component="h2" 
            textAlign="center" 
            gutterBottom
            sx={{ mb: 6 }}
          >
            How It Works
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  1
                </Box>
                <Typography variant="h6" gutterBottom>
                  Search & Find
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Enter your location and find available parking spaces near you
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  2
                </Box>
                <Typography variant="h6" gutterBottom>
                  Book & Pay
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Select your preferred time slot and make secure payment online
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Box textAlign="center">
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    fontSize: '2rem',
                    fontWeight: 'bold'
                  }}
                >
                  3
                </Box>
                <Typography variant="h6" gutterBottom>
                  Park & Go
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Navigate to your spot and enjoy hassle-free parking
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          bgcolor: 'secondary.main',
          color: 'white',
          py: 6,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="h6" sx={{ mb: 4 }}>
            Join thousands of users who trust ParkSeva for their parking needs
          </Typography>
          <Button
            variant="contained"
            size="large"
            color="primary"
            onClick={() => navigate('/signup')}
            sx={{ minWidth: 200 }}
          >
            Join ParkSeva Today
          </Button>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: '#333', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                ParkSeva
              </Typography>
              <Typography variant="body2">
                India's leading peer-to-peer parking marketplace. Making parking simple and accessible for everyone.
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Quick Links
              </Typography>
              <Button color="inherit" onClick={() => navigate('/login')}>
                Login
              </Button>
              <br />
              <Button color="inherit" onClick={() => navigate('/signup')}>
                Sign Up
              </Button>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6" gutterBottom>
                Contact
              </Typography>
              <Typography variant="body2">
                Email: info@parkseva.com
              </Typography>
              <Typography variant="body2">
                Phone: +91 98765 43210
              </Typography>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 4, pt: 2, borderTop: '1px solid #555', textAlign: 'center' }}>
            <Typography variant="body2">
              © 2024 ParkSeva. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;