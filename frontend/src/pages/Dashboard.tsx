import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  accounts: any[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/customers');
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredCustomers(customers.filter(c => 
        c.name.toLowerCase().includes(lower) || 
        c.email?.toLowerCase().includes(lower) || 
        c.phone?.includes(lower)
    ));
  }, [searchTerm, customers]);

  const handleCreate = async () => {
    try {
        await api.post('/customers', newCustomer);
        setOpen(false);
        fetchCustomers();
        setNewCustomer({ name: '', email: '', phone: '' });
    } catch (err) {
        alert('יצירת הלקוח נכשלה');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <Typography variant="h4">לקוחות הסניף</Typography>
        <div style={{ display: 'flex', gap: '20px' }}>
            <TextField 
                size="small" 
                label="חיפוש לקוחות" 
                variant="outlined" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Button variant="contained" onClick={() => setOpen(true)}>הוסף לקוח</Button>
        </div>
      </div>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>שם</TableCell>
              <TableCell>אימייל</TableCell>
              <TableCell>חשבונות</TableCell>
              <TableCell>פעולות</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.map((c) => (
              <TableRow key={c.id}>
                <TableCell>{c.name}</TableCell>
                <TableCell>{c.email}</TableCell>
                <TableCell>{c.accounts?.length || 0}</TableCell>
                <TableCell>
                    <Button onClick={() => navigate(`/customers/${c.id}`)}>צפייה</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>הוספת לקוח חדש</DialogTitle>
        <DialogContent>
            <TextField label="שם" fullWidth margin="normal" value={newCustomer.name} onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})} />
            <TextField label="אימייל" fullWidth margin="normal" value={newCustomer.email} onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})} />
            <TextField label="טלפון" fullWidth margin="normal" value={newCustomer.phone} onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})} />
        </DialogContent>
        <DialogActions>
            <Button onClick={() => setOpen(false)}>ביטול</Button>
            <Button onClick={handleCreate} color="primary">צור</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Dashboard;
