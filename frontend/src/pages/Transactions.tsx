import React, { useEffect, useState } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
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

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchTransactions();
  }, []);

  return (
    <div>
      <Typography variant="h4" gutterBottom>Branch Transactions (Last 100)</Typography>
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
            {transactions.map((tx) => (
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
