import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container, Box } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Banker Dashboard
          </Typography>
          {user && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button color="inherit" onClick={() => window.location.href='/dashboard'}>Customers</Button>
              <Button color="inherit" onClick={() => window.location.href='/transactions'}>Transactions</Button>
              <Typography variant="body1">
                {user.name} ({user.role})
              </Typography>
              <Button color="inherit" onClick={logout}>Logout</Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 4 }}>
        <Outlet />
      </Container>
    </>
  );
};

export default Layout;
