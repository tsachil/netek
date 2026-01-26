import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithAuth } from './utils';
import Dashboard from '../pages/Dashboard';
import { vi } from 'vitest';
import api from '../api/axios';

// Mock API
vi.mock('../api/axios');

describe('Dashboard Page', () => {
    test('renders customers list', async () => {
        const mockCustomers = [
            { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [] }
        ];
        (api.get as any).mockResolvedValue({ data: mockCustomers });

        renderWithAuth(<Dashboard />);

        expect(screen.getByText(/Branch Customers/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });
    });

    test('renders add customer button', () => {
        (api.get as any).mockResolvedValue({ data: [] });
        renderWithAuth(<Dashboard />);
        expect(screen.getByText(/Add Customer/i)).toBeInTheDocument();
    });
});
