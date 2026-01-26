import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Typography, Button, Grid, Card, CardContent, Dialog, DialogTitle, DialogContent, TextField, DialogActions, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
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
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [openAccountDialog, setOpenAccountDialog] = useState(false);
  const [openTxDialog, setOpenTxDialog] = useState(false);
  
  const [newAccountType, setNewAccountType] = useState('CHECKING');
  
  const [txData, setTxData] = useState({ accountId: '', type: 'DEPOSIT', amount: '' });

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleCreateAccount = async () => {
    try {
        await api.post('/accounts', { customerId: id, type: newAccountType });
        setOpenAccountDialog(false);
        fetchCustomer();
    } catch (err) {
        alert('פתיחת חשבון נכשלה');
    }
  };

  const handleTransaction = async () => {
      try {
          await api.post(`/accounts/${txData.accountId}/transaction`, {
              type: txData.type,
              amount: Number(txData.amount)
          });
          setOpenTxDialog(false);
          fetchCustomer();
          setTxData({ ...txData, amount: '' });
      } catch (err) {
          alert('הפעולה נכשלה');
      }
  };

  const openTransaction = (accountId: string, type: string) => {
      setTxData({ accountId, type, amount: '' });
      setOpenTxDialog(true);
  };

  if (!customer) return <div>טוען...</div>;

  return (
    <div>
      <Button variant="outlined" onClick={() => window.history.back()} style={{ marginBottom: '20px' }}>&rarr; חזרה ללוח הבקרה</Button>
      
      <Typography variant="h4" gutterBottom>{customer.name}</Typography>
      <Typography variant="body1">אימייל: {customer.email}</Typography>
      <Typography variant="body1" gutterBottom>טלפון: {customer.phone}</Typography>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Button variant="contained" onClick={() => setOpenAccountDialog(true)}>פתח חשבון חדש</Button>
      </div>

      <Grid container spacing={3}>
        {customer.accounts?.map((acc) => (
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
      <Dialog open={openTxDialog} onClose={() => setOpenTxDialog(false)}>
          <DialogTitle>{txData.type === 'DEPOSIT' ? 'הפקדת כספים' : 'משיכת כספים'}</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
              <TextField 
                label="סכום" 
                type="number" 
                fullWidth 
                margin="normal" 
                value={txData.amount} 
                onChange={(e) => setTxData({...txData, amount: e.target.value})} 
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpenTxDialog(false)}>ביטול</Button>
              <Button onClick={handleTransaction} color="primary">אישור</Button>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomerDetails;
