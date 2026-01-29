import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions, CircularProgress, Alert, Snackbar } from '@mui/material';
import api from '../api/axios';

interface Branch {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    branchId: string;
    branch?: Branch;
}

const Admin: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  // Form state
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState('');

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const [uRes, bRes] = await Promise.all([
          api.get('/admin/users', { signal }),
          api.get('/admin/branches', { signal })
      ]);
      setUsers(uRes.data);
      setBranches(bRes.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError('שגיאה בטעינת הנתונים');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  const handleEdit = (user: User) => {
      setEditUser(user);
      setRole(user.role);
      setBranchId(user.branchId);
      setOpen(true);
  };

  const handleSave = async () => {
      if (!editUser) return;
      try {
          await api.patch(`/admin/users/${editUser.id}`, { role, branchId });
          setOpen(false);
          setSnackbar({ open: true, message: 'המשתמש עודכן בהצלחה', severity: 'success' });
          fetchData();
      } catch (err) {
          setSnackbar({ open: true, message: 'עדכון המשתמש נכשל', severity: 'error' });
      }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <CircularProgress />
      </div>
    );
  }

  return (
    <div>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography variant="h4" gutterBottom>ניהול משתמשים</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>תפקיד</TableCell>
              <TableCell>סניף</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{u.branch?.name}</TableCell>
                <TableCell>
                    <Button onClick={() => handleEdit(u)}>עריכה</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>עריכת משתמש: {editUser?.name}</DialogTitle>
          <DialogContent sx={{ minWidth: 300, mt: 1 }}>
              <FormControl fullWidth margin="normal">
                  <InputLabel>תפקיד</InputLabel>
                  <Select value={role} label="תפקיד" onChange={(e) => setRole(e.target.value)}>
                      <MenuItem value="TELLER">כספר</MenuItem>
                      <MenuItem value="MANAGER">מנהל</MenuItem>
                      <MenuItem value="ADMIN">אדמין</MenuItem>
                  </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                  <InputLabel>סניף</InputLabel>
                  <Select value={branchId} label="סניף" onChange={(e) => setBranchId(e.target.value)}>
                      {branches.map(b => (
                          <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                      ))}
                  </Select>
              </FormControl>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpen(false)}>ביטול</Button>
              <Button onClick={handleSave} color="primary">שמור</Button>
          </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Admin;
