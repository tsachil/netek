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

        expect(screen.getByText(/תנועות הסניף/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('הפקדה')).toBeInTheDocument();
            expect(screen.getByText('₪500.00')).toBeInTheDocument();
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
        fireEvent.change(screen.getByLabelText(/חיפוש תנועות/i), { target: { value: 'Alice' } });

        expect(screen.getByText('Alice')).toBeInTheDocument(); 
        
        // Filter by "הפקדה" (DEPOSIT)
        fireEvent.change(screen.getByLabelText(/חיפוש תנועות/i), { target: { value: 'הפקדה' } });
        
        expect(screen.getByText('Alice')).toBeInTheDocument();
        expect(screen.queryByText('Bob')).not.toBeInTheDocument();
    });

    test('sorts transactions by amount', async () => {
        const mockTransactions = [
            { 
                id: 'tx1', amount: 100, type: 'DEPOSIT', timestamp: new Date().toISOString(),
                account: { customer: { name: 'A' } }, user: { name: 'Banker' }
            },
            { 
                id: 'tx2', amount: 300, type: 'DEPOSIT', timestamp: new Date().toISOString(),
                account: { customer: { name: 'B' } }, user: { name: 'Banker' }
            },
            { 
                id: 'tx3', amount: 200, type: 'DEPOSIT', timestamp: new Date().toISOString(),
                account: { customer: { name: 'C' } }, user: { name: 'Banker' }
            }
        ];
        (api.get as any).mockResolvedValue({ data: mockTransactions });

        renderWithAuth(<Transactions />);

        await waitFor(() => {
            expect(screen.getByText('₪100.00')).toBeInTheDocument();
        });

        const amountHeader = screen.getByText('סכום');
        fireEvent.click(amountHeader); // Sort ASC

        const rows = screen.getAllByRole('row');
        // Row 0 is header. Rows 1, 2, 3 are data.
        expect(rows[1]).toHaveTextContent('₪100.00');
        expect(rows[2]).toHaveTextContent('₪200.00');
        expect(rows[3]).toHaveTextContent('₪300.00');

        fireEvent.click(amountHeader); // Sort DESC
        const rowsDesc = screen.getAllByRole('row');
        expect(rowsDesc[1]).toHaveTextContent('₪300.00');
        expect(rowsDesc[2]).toHaveTextContent('₪200.00');
        expect(rowsDesc[3]).toHaveTextContent('₪100.00');
    });
});