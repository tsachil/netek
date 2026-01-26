import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, FormControl, InputLabel, Select, MenuItem, DialogActions } from '@mui/material';
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

  // Form state
  const [role, setRole] = useState('');
  const [branchId, setBranchId] = useState('');

  const fetchData = async () => {
    try {
      const [uRes, bRes] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/branches')
      ]);
      setUsers(uRes.data);
      setBranches(bRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
          fetchData();
      } catch (err) {
          alert('עדכון המשתמש נכשל');
      }
  };

  return (
    <div>
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
    </div>
  );
};

export default Admin;
