import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAuth } from './utils';
import CustomerDetails from '../pages/CustomerDetails';
import { vi } from 'vitest';
import api from '../api/axios';
import { Route, Routes } from 'react-router-dom';

// Mock API
vi.mock('../api/axios');

const renderWithRouter = (ui: React.ReactElement, route = '/') => {
    window.history.pushState({}, 'Test page', route);
    return renderWithAuth(
        <Routes>
            <Route path="/customers/:id" element={ui} />
        </Routes>
    );
};

describe('CustomerDetails Page', () => {
    test('renders customer info and accounts', async () => {
        const mockCustomer = {
            id: '1',
            name: 'Jane Doe',
            email: 'jane@example.com',
            phone: '555-5555',
            accounts: [
                { id: 'acc1', type: 'CHECKING', balance: 1000, transactions: [] }
            ]
        };
        (api.get as any).mockResolvedValue({ data: mockCustomer });

        renderWithRouter(<CustomerDetails />, '/customers/1');

        await waitFor(() => {
            expect(screen.getByText('Jane Doe')).toBeInTheDocument();
            expect(screen.getByText(/jane@example.com/)).toBeInTheDocument();
            expect(screen.getByText('עובר ושב')).toBeInTheDocument();
            expect(screen.getByText('₪1000.00')).toBeInTheDocument();
        });
    });

    test('opens new account dialog', async () => {
         const mockCustomer = {
            id: '1',
            name: 'Jane Doe',
            accounts: []
        };
        (api.get as any).mockResolvedValue({ data: mockCustomer });

        renderWithRouter(<CustomerDetails />, '/customers/1');

        await waitFor(() => expect(screen.getByText('Jane Doe')).toBeInTheDocument());

        fireEvent.click(screen.getByText('פתח חשבון חדש'));

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('צור')).toBeInTheDocument();
    });
});