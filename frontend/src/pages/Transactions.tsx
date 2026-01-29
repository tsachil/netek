import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, TableSortLabel, CircularProgress, Alert, Box } from '@mui/material';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async (signal?: AbortSignal) => {
    try {
      setError(null);
      const res = await api.get('/transactions', { signal });
      setTransactions(res.data);
    } catch (err: any) {
      if (err.name !== 'CanceledError') {
        setError('שגיאה בטעינת התנועות');
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchTransactions(controller.signal);
    return () => controller.abort();
  }, [fetchTransactions]);

  const processedTransactions = useMemo(() => {
    let data = [...transactions];

    // Filter
    if (searchTerm) {
        const lower = searchTerm.toLowerCase();
        data = data.filter(tx => {
            const typeLabel = tx.type === 'DEPOSIT' ? 'הפקדה' : tx.type === 'WITHDRAWAL' ? 'משיכה' : 'העברה';
            return tx.account.customer.name.toLowerCase().includes(lower) ||
                   typeLabel.includes(lower) ||
                   tx.type.toLowerCase().includes(lower) ||
                   tx.user?.name.toLowerCase().includes(lower) ||
                   Number(tx.amount).toString().includes(lower) ||
                   new Date(tx.timestamp).toLocaleString('he-IL').toLowerCase().includes(lower);
        });
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
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mb: 2.5,
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
          תנועות הסניף (100 אחרונות)
        </Typography>
        <TextField
            size="small"
            label="חיפוש תנועות"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
        />
      </Box>
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table sx={{ minWidth: 650 }}>
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
            {processedTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="textSecondary">
                    {searchTerm ? 'לא נמצאו תנועות התואמות לחיפוש' : 'אין תנועות בסניף עדיין.'}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              processedTransactions.map((tx) => (
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
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default Transactions;