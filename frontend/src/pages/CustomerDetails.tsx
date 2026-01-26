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
        alert('Failed to create account');
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
          alert('Transaction failed');
      }
  };

  const openTransaction = (accountId: string, type: string) => {
      setTxData({ accountId, type, amount: '' });
      setOpenTxDialog(true);
  };

  if (!customer) return <div>Loading...</div>;

  return (
    <div>
      <Typography variant="h4" gutterBottom>{customer.name}</Typography>
      <Typography variant="body1">Email: {customer.email}</Typography>
      <Typography variant="body1" gutterBottom>Phone: {customer.phone}</Typography>
      
      <div style={{ marginTop: '20px', marginBottom: '20px' }}>
        <Button variant="contained" onClick={() => setOpenAccountDialog(true)}>Open New Account</Button>
      </div>

      <Grid container spacing={3}>
        {customer.accounts?.map((acc) => (
            <Grid item xs={12} md={6} key={acc.id}>
                <Card>
                    <CardContent>
                        <Typography variant="h6">{acc.type} Account</Typography>
                        <Typography variant="h4">${Number(acc.balance).toFixed(2)}</Typography>
                        <div style={{ marginTop: '10px' }}>
                            <Button size="small" variant="contained" color="success" style={{ marginRight: '10px' }} onClick={() => openTransaction(acc.id, 'DEPOSIT')}>Deposit</Button>
                            <Button size="small" variant="contained" color="warning" onClick={() => openTransaction(acc.id, 'WITHDRAWAL')}>Withdraw</Button>
                        </div>
                    </CardContent>
                </Card>
            </Grid>
        ))}
      </Grid>

      {/* New Account Dialog */}
      <Dialog open={openAccountDialog} onClose={() => setOpenAccountDialog(false)}>
          <DialogTitle>Open New Account</DialogTitle>
          <DialogContent sx={{ minWidth: 300, mt: 1 }}>
              <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select value={newAccountType} label="Type" onChange={(e) => setNewAccountType(e.target.value)}>
                      <MenuItem value="CHECKING">Checking</MenuItem>
                      <MenuItem value="SAVINGS">Savings</MenuItem>
                  </Select>
              </FormControl>
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpenAccountDialog(false)}>Cancel</Button>
              <Button onClick={handleCreateAccount} color="primary">Create</Button>
          </DialogActions>
      </Dialog>

      {/* Transaction Dialog */}
      <Dialog open={openTxDialog} onClose={() => setOpenTxDialog(false)}>
          <DialogTitle>{txData.type === 'DEPOSIT' ? 'Deposit Funds' : 'Withdraw Funds'}</DialogTitle>
          <DialogContent sx={{ minWidth: 300 }}>
              <TextField 
                label="Amount" 
                type="number" 
                fullWidth 
                margin="normal" 
                value={txData.amount} 
                onChange={(e) => setTxData({...txData, amount: e.target.value})} 
              />
          </DialogContent>
          <DialogActions>
              <Button onClick={() => setOpenTxDialog(false)}>Cancel</Button>
              <Button onClick={handleTransaction} color="primary">Confirm</Button>
          </DialogActions>
      </Dialog>
    </div>
  );
};

export default CustomerDetails;
