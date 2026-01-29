import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAuth } from './utils';
import Dashboard from '../pages/Dashboard';
import { vi } from 'vitest';
import api from '../api/axios';

// Mock API
vi.mock('../api/axios');

describe('Dashboard Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('Customer List', () => {
        test('renders customers list', async () => {
            const mockCustomers = [
                { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [] }
            ];
            (api.get as any).mockResolvedValue({ data: mockCustomers });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText(/לקוחות הסניף/i)).toBeInTheDocument();
            });

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
                expect(screen.getByText('john@example.com')).toBeInTheDocument();
            });
        });

        test('renders add customer button', async () => {
            (api.get as any).mockResolvedValue({ data: [] });
            renderWithAuth(<Dashboard />);
            await waitFor(() => {
                expect(screen.getByText(/הוסף לקוח/i)).toBeInTheDocument();
            });
        });

        test('shows account count for each customer', async () => {
            const mockCustomers = [
                { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [{ id: 'a1' }, { id: 'a2' }] }
            ];
            (api.get as any).mockResolvedValue({ data: mockCustomers });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText('2')).toBeInTheDocument();
            });
        });

        test('handles empty customer list', async () => {
            (api.get as any).mockResolvedValue({ data: [] });
            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText(/לקוחות הסניף/i)).toBeInTheDocument();
            });

            // Table should be empty but button should still be visible
            expect(screen.getByText(/הוסף לקוח/i)).toBeInTheDocument();
        });
    });

    describe('Search Functionality', () => {
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

            fireEvent.change(screen.getByLabelText(/חיפוש לקוחות/i), { target: { value: 'John' } });

            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();
        });

        test('search is case-insensitive', async () => {
            const mockCustomers = [
                { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [] }
            ];
            (api.get as any).mockResolvedValue({ data: mockCustomers });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/חיפוש לקוחות/i), { target: { value: 'JOHN' } });

            expect(screen.getByText('John Doe')).toBeInTheDocument();
        });

        test('filters by email', async () => {
            const mockCustomers = [
                { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [] },
                { id: '2', name: 'Jane Smith', email: 'jane@company.com', accounts: [] }
            ];
            (api.get as any).mockResolvedValue({ data: mockCustomers });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            fireEvent.change(screen.getByLabelText(/חיפוש לקוחות/i), { target: { value: 'company' } });

            expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });

        test('clears search results when search cleared', async () => {
            const mockCustomers = [
                { id: '1', name: 'John Doe', email: 'john@example.com', accounts: [] },
                { id: '2', name: 'Jane Smith', email: 'jane@example.com', accounts: [] }
            ];
            (api.get as any).mockResolvedValue({ data: mockCustomers });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText('John Doe')).toBeInTheDocument();
            });

            // Filter
            fireEvent.change(screen.getByLabelText(/חיפוש לקוחות/i), { target: { value: 'John' } });
            expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

            // Clear filter
            fireEvent.change(screen.getByLabelText(/חיפוש לקוחות/i), { target: { value: '' } });
            expect(screen.getByText('Jane Smith')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        test('displays error message when fetch fails', async () => {
            (api.get as any).mockRejectedValue(new Error('Network error'));

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText(/שגיאה בטעינת הלקוחות/i)).toBeInTheDocument();
            });
        });

        test('shows loading spinner initially', async () => {
            // Delay the response
            (api.get as any).mockImplementation(() => new Promise(resolve => {
                setTimeout(() => resolve({ data: [] }), 100);
            }));

            renderWithAuth(<Dashboard />);

            // Should show loading spinner
            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });

    describe('Create Customer Dialog', () => {
        test('opens dialog when add button clicked', async () => {
            (api.get as any).mockResolvedValue({ data: [] });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /הוסף לקוח/i })).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /הוסף לקוח/i }));

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });
        });

        test('closes dialog on cancel', async () => {
            (api.get as any).mockResolvedValue({ data: [] });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByRole('button', { name: /הוסף לקוח/i })).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /הוסף לקוח/i }));

            await waitFor(() => {
                expect(screen.getByRole('dialog')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByRole('button', { name: /ביטול/i }));

            await waitFor(() => {
                expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
            });
        });

        test('creates customer and refreshes list', async () => {
            const initialCustomers: any[] = [];
            const newCustomer = { id: '1', name: 'New Customer', email: 'new@test.com', phone: '12345', accounts: [] };

            (api.get as any).mockResolvedValue({ data: initialCustomers });
            (api.post as any).mockResolvedValue({ data: newCustomer });

            renderWithAuth(<Dashboard />);

            await waitFor(() => {
                expect(screen.getByText(/הוסף לקוח/i)).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText(/הוסף לקוח/i));

            // Fill form
            fireEvent.change(screen.getByLabelText(/שם/i), { target: { value: 'New Customer' } });
            fireEvent.change(screen.getByLabelText(/אימייל/i), { target: { value: 'new@test.com' } });
            fireEvent.change(screen.getByLabelText(/טלפון/i), { target: { value: '12345' } });

            // Update mock for refresh
            (api.get as any).mockResolvedValue({ data: [newCustomer] });

            // Submit
            fireEvent.click(screen.getByText(/^צור$/i));

            await waitFor(() => {
                expect(api.post).toHaveBeenCalledWith('/customers', {
                    name: 'New Customer',
                    email: 'new@test.com',
                    phone: '12345'
                });
            });
        });
    });
});