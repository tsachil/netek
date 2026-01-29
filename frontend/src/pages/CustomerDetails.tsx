import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem, CircularProgress, Alert, Snackbar } from '@mui/material';
import api from '../api/axios';

interface Transaction {
    id: string;
    amount: number;
    type: string;
    timestamp: string;
}

interface Account {
  id: string;
  type: string;
  balance: number;
  transactions?: Transaction[];
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  accounts: Account[];
}

const CustomerDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openTxDialog, setOpenTxDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newAccountType, setNewAccountType] = useState('CHECKING');

  const [txData, setTxData] = useState({ accountId: '', type: 'DEPOSIT', amount: '' });
  const [amountError, setAmountError] = useState<string>('');
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({ open: false, message: '', severity: 'success' });

  const fetchCustomer = useCallback(async (signal?: AbortSignal) => {
    if (!id) {
      setError('מזהה לקוח חסר');
      setLoading(false);
      return;
    }
    try {
      setError(null);
      const res = await api.get(`/customers/${id}`, { signal });
      setCustomer(res.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError('שגיאה בטעינת פרטי הלקוח');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCustomer(controller.signal);
    return () => controller.abort();
  }, [fetchCustomer]);

  const handleCreateAccount = async () => {
    try {
        await api.post('/accounts', { customerId: id, type: newAccountType });
        setOpenAccountDialog(false);
        setSnackbar({ open: true, message: 'החשבון נפתח בהצלחה', severity: 'success' });
        fetchCustomer();
    } catch (err) {
        setSnackbar({ open: true, message: 'פתיחת חשבון נכשלה', severity: 'error' });
    }
  };

  const handleTransaction = async () => {
      const amount = Number(txData.amount);

      if (!txData.amount || isNaN(amount)) {
        setAmountError('יש להזין סכום');
        return;
      }
      if (amount <= 0) {
        setAmountError('הסכום חייב להיות גדול מאפס');
        return;
      }

      try {
          await api.post(`/accounts/${txData.accountId}/transaction`, {
              type: txData.type,
              amount: amount
          });
          setOpenTxDialog(false);
          setAmountError('');
          setSnackbar({ open: true, message: 'הפעולה בוצעה בהצלחה', severity: 'success' });
          fetchCustomer();
          setTxData({ ...txData, amount: '' });
      } catch (err) {
          setSnackbar({ open: true, message: 'הפעולה נכשלה', severity: 'error' });
      }
  };

  const openTransaction = (accountId: string, type: string) => {
      setTxData({ accountId, type, amount: '' });
      setOpenTxDialog(true);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  if (!customer) {
    return <Alert severity="warning">לקוח לא נמצא</Alert>;
  }

  return (
    <div>
      <Button variant="outlined" onClick={() => navigate('/')} style={{ marginBottom: '20px' }}>&rarr; חזרה ללוח הבקרה</Button>
      
      <Typography variant="h4" gutterBottom>{customer.name}</Typography>
      <Typography variant="body1">אימייל: {customer.email}</Typography>
      <Typography variant="body1" gutterBottom>טלפון: {customer.phone}</Typography>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Button variant="contained" onClick={() => setOpenAccountDialog(true)}>פתח חשבון חדש</Button>
      </div>

      {(!customer.accounts || customer.accounts.length === 0) ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="textSecondary">
            אין חשבונות ללקוח זה. לחץ על "פתח חשבון חדש" לפתיחת חשבון.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {customer.accounts.map((acc) => (
            <Grid item xs={12} key={acc.id}>
                <Card>
                    <CardContent>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div>
                                <Typography variant="h6">{acc.type === 'CHECKING' ? 'עובר ושב' : 'חיסכון'}</Typography>
                                <Typography color="textSecondary" variant="body2">מזהה: {acc.id}</Typography>
                            </div>
                            <Typography variant="h4">₪{Number(acc.balance).toFixed(2)}</Typography>
                        </div>
                        
                        <div style={{ marginBottom: '20px' }}>
                            <Button size="small" variant="contained" color="success" style={{ marginLeft: '10px' }} onClick={() => openTransaction(acc.id, 'DEPOSIT')}>הפקדה</Button>
                            <Button size="small" variant="contained" color="warning" onClick={() => openTransaction(acc.id, 'WITHDRAWAL')}>משיכה</Button>
                        </div>

                        <Typography variant="subtitle2" gutterBottom>היסטוריית תנועות</Typography>
                        {acc.transactions && acc.transactions.length > 0 ? (
                            <table style={{ width: '100%', textAlign: 'right', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #eee' }}>
                                        <th style={{ padding: '8px' }}>תאריך</th>
                                        <th style={{ padding: '8px' }}>סוג</th>
                                        <th style={{ padding: '8px' }}>סכום</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {acc.transactions.map((tx) => (
                                        <tr key={tx.id} style={{ borderBottom: '1px solid #f5f5f5' }}>
                                            <td style={{ padding: '8px' }}>{new Date(tx.timestamp).toLocaleString('he-IL')}</td>
                                            <td style={{ padding: '8px' }}>
                                                <span style={{ 
                                                    color: tx.type === 'DEPOSIT' ? 'green' : 'red',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {tx.type === 'DEPOSIT' ? 'הפקדה' : tx.type === 'WITHDRAWAL' ? 'משיכה' : 'העברה'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '8px' }}>₪{Number(tx.amount).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <Typography variant="body2" color="textSecondary">אין תנועות.</Typography>
                        )}
                    </CardContent>
                </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* New Account Dialog */}
      <Dialog open={openAccountDialog} onClose={() => setOpenAccountDialog(false)}>
          <DialogTitle>פתיחת חשבון חדש</DialogTitle>
          <DialogContent sx={{ minWidth: 300, mt: 1 }}>
              <FormControl fullWidth>
                  <InputLabel>סוג</InputLabel>
                  <Select value={newAccountType} label="סוג" onChange={(e) => setNewAccountType(e.target.value)}>
                      <MenuItem value="CHECKING">עובר ושב</MenuItem>
                      <MenuItem value="SAVINGS">חיסכון</MenuItem>
                  </Select>
              </FormControl>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpenAccountDialog(false)}>ביטול</Button>
              <Button onClick={handleCreateAccount} color="primary">צור</Button>
          </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={openTxDialog} onClose={() => { setOpenTxDialog(false); setAmountError(''); }}>
          <DialogTitle>{txData.type === 'DEPOSIT' ? 'הפקדת כספים' : 'משיכת כספים'}</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
              <TextField
                label="סכום"
                type="number"
                fullWidth
                margin="normal"
                value={txData.amount}
                onChange={(e) => setTxData({...txData, amount: e.target.value})}
                error={!!amountError}
                helperText={amountError}
                required
                inputProps={{ min: 0.01, step: 0.01 }}
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => { setOpenTxDialog(false); setAmountError(''); }}>ביטול</Button>
              <Button onClick={handleTransaction} color="primary">אישור</Button>
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

export default CustomerDetails;
