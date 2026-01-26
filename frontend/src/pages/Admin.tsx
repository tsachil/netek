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
          alert('Failed to update user');
      }
  };

  return (
    <div>
      <Typography variant="h4" gutterBottom>User Administration</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Branch</TableCell>
              <TableCell>Actions</TableCell>
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
                    <Button onClick={() => handleEdit(u)}>Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Edit User: {editUser?.name}</DialogTitle>
          <DialogContent sx={{ minWidth: 300, mt: 1 }}>
              <FormControl fullWidth margin="normal">
                  <InputLabel>Role</InputLabel>
                  <Select value={role} label="Role" onChange={(e) => setRole(e.target.value)}>
                      <MenuItem value="TELLER">Teller</MenuItem>
                      <MenuItem value="MANAGER">Manager</MenuItem>
                      <MenuItem value="ADMIN">Admin</MenuItem>
                  </Select>
              </FormControl>
              <FormControl fullWidth margin="normal">
                  <InputLabel>Branch</InputLabel>
                  <Select value={branchId} label="Branch" onChange={(e) => setBranchId(e.target.value)}>
                      {branches.map(b => (
                          <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                      ))}
                  </Select>
              </FormControl>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} color="primary">Save</Button>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default Admin;
