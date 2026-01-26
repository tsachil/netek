import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TableSortLabel } from '@mui/material';
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

type Order = 'asc' | 'desc';

interface SortConfig {
    key: string;
    direction: Order;
}

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'timestamp', direction: 'desc' });

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

  const processedTransactions = useMemo(() => {
    let data = [...transactions];

    // Filter
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        data = data.filter(tx => 
            tx.account.customer.name.toLowerCase().includes(lower) ||
            tx.type.toLowerCase().includes(lower) ||
            tx.user?.name.toLowerCase().includes(lower) ||
            Number(tx.amount).toString().includes(lower) ||
            new Date(tx.timestamp).toLocaleString().toLowerCase().includes(lower)
        );
    }

    // Sort
    if (sortConfig.key) {
        data.sort((a, b) => {
            let aValue: any = '';
            let bValue: any = '';

            switch (sortConfig.key) {
                case 'timestamp':
                    aValue = new Date(a.timestamp).getTime();
                    bValue = new Date(b.timestamp).getTime();
                    break;
                case 'customer':
                    aValue = a.account.customer.name.toLowerCase();
                    bValue = b.account.customer.name.toLowerCase();
                    break;
                case 'type':
                    aValue = a.type.toLowerCase();
                    bValue = b.type.toLowerCase();
                    break;
                case 'amount':
                    aValue = Number(a.amount);
                    bValue = Number(b.amount);
                    break;
                case 'banker':
                    aValue = (a.user?.name || '').toLowerCase();
                    bValue = (b.user?.name || '').toLowerCase();
                    break;
                default:
                    return 0;
            }

            if (aValue < bValue) {
                return sortConfig.direction === 'asc' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'asc' ? 1 : -1;
            }
            return 0;
        });
    }

    return data;
  }, [transactions, searchTerm, sortConfig]);

  const handleRequestSort = (property: string) => {
    const isAsc = sortConfig.key === property && sortConfig.direction === 'asc';
    setSortConfig({ key: property, direction: isAsc ? 'desc' : 'asc' });
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
        <Typography variant="h4">תנועות הסניף (100 אחרונות)</Typography>
        <TextField 
            size="small" 
            label="חיפוש תנועות" 
            variant="outlined" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>
                  <TableSortLabel 
                    active={sortConfig.key === 'timestamp'} 
                    direction={sortConfig.key === 'timestamp' ? sortConfig.direction : 'asc'} 
                    onClick={() => handleRequestSort('timestamp')}
                  >
                      תאריך
                  </TableSortLabel>
              </TableCell>
              <TableCell>
                  <TableSortLabel 
                    active={sortConfig.key === 'customer'} 
                    direction={sortConfig.key === 'customer' ? sortConfig.direction : 'asc'} 
                    onClick={() => handleRequestSort('customer')}
                  >
                      לקוח
                  </TableSortLabel>
              </TableCell>
              <TableCell>
                  <TableSortLabel 
                    active={sortConfig.key === 'type'} 
                    direction={sortConfig.key === 'type' ? sortConfig.direction : 'asc'} 
                    onClick={() => handleRequestSort('type')}
                  >
                      סוג
                  </TableSortLabel>
              </TableCell>
              <TableCell>
                  <TableSortLabel 
                    active={sortConfig.key === 'amount'} 
                    direction={sortConfig.key === 'amount' ? sortConfig.direction : 'asc'} 
                    onClick={() => handleRequestSort('amount')}
                  >
                      סכום
                  </TableSortLabel>
              </TableCell>
              <TableCell>
                  <TableSortLabel 
                    active={sortConfig.key === 'banker'} 
                    direction={sortConfig.key === 'banker' ? sortConfig.direction : 'asc'} 
                    onClick={() => handleRequestSort('banker')}
                  >
                      בנקאי
                  </TableSortLabel>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {processedTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell>{new Date(tx.timestamp).toLocaleString('he-IL')}</TableCell>
                <TableCell>{tx.account.customer.name}</TableCell>
                <TableCell>
                    <span style={{ color: tx.type === 'DEPOSIT' ? 'green' : 'red', fontWeight: 'bold' }}>
                        {tx.type === 'DEPOSIT' ? 'הפקדה' : tx.type === 'WITHDRAWAL' ? 'משיכה' : 'העברה'}
                    </span>
                </TableCell>
                <TableCell>₪{Number(tx.amount).toFixed(2)}</TableCell>
                <TableCell>{tx.user?.name || 'מערכת'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Transactions;