import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
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

        expect(screen.getByText(/לקוחות הסניף/i)).toBeInTheDocument();
        
        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('john@example.com')).toBeInTheDocument();
        });
    });

    test('filters customers by search term', async () => {
        const mockCustomers = [
            { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [] },
            { id: '2', name: 'Jane Smith', email: 'jane@example.com', accounts: [] }
        ];
        (api.get as any).mockResolvedValue({ data: mockCustomers });

        renderWithAuth(<Dashboard />);

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        // Filter for "John"
        fireEvent.change(screen.getByLabelText(/חיפוש לקוחות/i), { target: { value: 'John' } });

        expect(screen.getByText('John Doe')).toBeInTheDocument();
        expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
    });

    test('renders add customer button', () => {
        (api.get as any).mockResolvedValue({ data: [] });
        renderWithAuth(<Dashboard />);
        expect(screen.getByText(/הוסף לקוח/i)).toBeInTheDocument();
    });
});