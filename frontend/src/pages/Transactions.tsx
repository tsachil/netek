import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField } from '@mui/material';
import api from '../api/axios';

interface Transaction {
    id: string;
    amount: number;
    type: string;
    timestamp: string;
    account: {
        customer: {
            name: string;
        }
    };
    user: {
        name: string;
    };
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
        setFilteredTransactions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, []);

  useEffect(() => {
      const lower = searchTerm.toLowerCase();
      setFilteredTransactions(transactions.filter(tx => 
          tx.account.customer.name.toLowerCase().includes(lower) ||
          tx.type.toLowerCase().includes(lower) ||
          tx.user?.name.toLowerCase().includes(lower) ||
          Number(tx.amount).toString().includes(lower) ||
          new Date(tx.timestamp).toLocaleString().toLowerCase().includes(lower)
      ));
  }, [searchTerm, transactions]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <Typography variant="h4">Branch Transactions (Last 100)</Typography>
        <TextField 
            size="small" 
            label="Search Transactions" 
            variant="outlined" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Banker</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.timestamp).toLocaleString()}</TableCell>
                <TableCell>{tx.account.customer.name}</TableCell>
                <TableCell>
                    <span style={{ color: tx.type === 'DEPOSIT' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {tx.type}
                    </span>
                </TableCell>
                <TableCell>${Number(tx.amount).toFixed(2)}</TableCell>
                <TableCell>{tx.user?.name || 'System'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Transactions;
