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
            לוח בקרה בנקאי
          </Typography>
          {user && (
            <Box display="flex" alignItems="center" gap={2}>
              <Button color="inherit" onClick={() => window.location.href='/dashboard'}>לקוחות</Button>
              <Button color="inherit" onClick={() => window.location.href='/transactions'}>תנועות</Button>
              {(user.role === 'MANAGER' || user.role === 'ADMIN') && (
                  <Button color="inherit" onClick={() => window.location.href='/admin'}>ניהול</Button>
              )}
              <Typography variant="body1">
                {user.name} ({user.role})
              </Typography>
              <Button color="inherit" onClick={logout}>יציאה</Button>
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
