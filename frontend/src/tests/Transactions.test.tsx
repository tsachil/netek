import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAuth } from './utils';
import Transactions from '../pages/Transactions';
import { vi } from 'vitest';
import api from '../api/axios';

// Mock API
vi.mock('../api/axios');

describe('Transactions Page', () => {
    test('renders transactions list', async () => {
        const mockTransactions = [
            { 
                id: 'tx1', 
                amount: 500, 
                type: 'DEPOSIT', 
                timestamp: new Date().toISOString(),
                account: { customer: { name: 'Alice' } },
                user: { name: 'Banker Bob' }
            }
        ];
        (api.get as any).mockResolvedValue({ data: mockTransactions });

        renderWithAuth(<Transactions />);

        expect(screen.getByText(/Branch Transactions/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('DEPOSIT')).toBeInTheDocument();
            expect(screen.getByText('$500.00')).toBeInTheDocument();
            expect(screen.getByText('Banker Bob')).toBeInTheDocument();
        });
    });

    test('filters transactions by search term', async () => {
        const mockTransactions = [
            { 
                id: 'tx1', amount: 500, type: 'DEPOSIT', timestamp: new Date().toISOString(),
                account: { customer: { name: 'Alice' } }, user: { name: 'Banker Bob' }
            },
            { 
                id: 'tx2', amount: 200, type: 'WITHDRAWAL', timestamp: new Date().toISOString(),
                account: { customer: { name: 'Bob' } }, user: { name: 'Banker Alice' }
            }
        ];
        (api.get as any).mockResolvedValue({ data: mockTransactions });

        renderWithAuth(<Transactions />);

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('Bob')).toBeInTheDocument();
        });

        // Filter for "Alice"
        fireEvent.change(screen.getByLabelText(/Search Transactions/i), { target: { value: 'Alice' } });

        expect(screen.getByText('Alice')).toBeInTheDocument(); 
        
        // Filter by "DEPOSIT"
        fireEvent.change(screen.getByLabelText(/Search Transactions/i), { target: { value: 'DEPOSIT' } });
        
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });
});
