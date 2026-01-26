import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAuth } from './utils';
import Admin from '../pages/Admin';
import { vi } from 'vitest';
import api from '../api/axios';

// Mock API
vi.mock('../api/axios');

describe('Admin Page', () => {
    test('renders user list and edit dialog', async () => {
        const mockUsers = [
            { id: '1', name: 'Alice', email: 'alice@bank.com', role: 'TELLER', branchId: 'b1', branch: { name: 'HQ' } }
        ];
        const mockBranches = [
            { id: 'b1', name: 'HQ' }, { id: 'b2', name: 'West' }
        ];

        // Mock multiple calls
        (api.get as any).mockImplementation((url: string) => {
            if (url === '/admin/users') return Promise.resolve({ data: mockUsers });
            if (url === '/admin/branches') return Promise.resolve({ data: mockBranches });
            return Promise.reject(new Error('not found'));
        });

        renderWithAuth(<Admin />);

        await waitFor(() => {
            expect(screen.getByText('Alice')).toBeInTheDocument();
            expect(screen.getByText('TELLER')).toBeInTheDocument();
            expect(screen.getByText('HQ')).toBeInTheDocument();
        });

        // Open edit
        fireEvent.click(screen.getByText('עריכה'));
        
        await waitFor(() => {
            expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
        });
    });
});