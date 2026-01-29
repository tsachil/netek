import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Dialog, DialogTitle, DialogContent, TextField, DialogActions, CircularProgress, Alert, Snackbar } from '@mui/material';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface Account {
  id: string;
  type: string;
  balance: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  accounts: Account[];
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [open, setOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', email: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });
  const navigate = useNavigate();

  const fetchCustomers = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const res = await api.get('/customers', { signal });
      setCustomers(res.data);
      setFilteredCustomers(res.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError('שגיאה בטעינת הלקוחות');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCustomers(controller.signal);
    return () => controller.abort();
  }, [fetchCustomers]);

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
        setNewCustomer({ name: '', email: '', phone: '' });
        setSnackbar({ open: true, message: 'הלקוח נוצר בהצלחה', severity: 'success' });
        await fetchCustomers();
    } catch (err) {
        setSnackbar({ open: true, message: 'יצירת הלקוח נכשלה', severity: 'error' });
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
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {searchTerm ? 'לא נמצאו לקוחות התואמים לחיפוש' : 'אין לקוחות בסניף. השתמש בכפתור למעלה להוספת לקוח חדש.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>{c.name}</TableCell>
                  <TableCell>{c.email}</TableCell>
                  <TableCell>{c.accounts?.length || 0}</TableCell>
                  <TableCell>
                      <Button onClick={() => navigate(`/customers/${c.id}`)}>צפייה</Button>
                  </TableCell>
                </TableRow>
              ))
            )}
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

export default Dashboard;
