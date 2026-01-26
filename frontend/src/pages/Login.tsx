import React from 'react';
import { Button, Container, Box, Typography } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

const Login: React.FC = () => {
  const { login, user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <Container maxWidth="sm">
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" minHeight="100vh">
        <Typography variant="h4" component="h1" gutterBottom>
          Banker's Daily
        </Typography>
        <Button variant="contained" color="primary" onClick={login}>
          Sign in with Google
        </Button>
      </Box>
    </Container>
  );
};

export default Login;
