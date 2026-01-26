import React from 'react';
import { screen, waitFor } from '@testing-library/react';
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
});
