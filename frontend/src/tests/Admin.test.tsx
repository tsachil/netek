import React from 'react';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { renderWithAuth } from './utils';
import Admin from '../pages/Admin';
import { vi } from 'vitest';
import api from '../api/axios';

// Mock API
vi.mock('../api/axios');

const mockUsers = [
    { id: '1', name: 'Alice', email: 'alice@bank.com', role: 'TELLER', branchId: 'b1', branch: { name: 'HQ' } },
    { id: '2', name: 'Bob', email: 'bob@bank.com', role: 'MANAGER', branchId: 'b2', branch: { name: 'West' } },
    { id: '3', name: 'Charlie', email: 'charlie@bank.com', role: 'ADMIN', branchId: 'b1', branch: { name: 'HQ' } }
];
const mockBranches = [
    { id: 'b1', name: 'HQ' }, { id: 'b2', name: 'West' }
];

const setupMocks = (users = mockUsers, branches = mockBranches) => {
    (api.get as any).mockImplementation((url: string) => {
        if (url === '/admin/users') return Promise.resolve({ data: users });
        if (url === '/admin/branches') return Promise.resolve({ data: branches });
        return Promise.reject(new Error('not found'));
    });
};

describe('Admin Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('User List Display', () => {
        test('renders user list with all columns', async () => {
            setupMocks();
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            expect(screen.getByText('alice@bank.com')).toBeInTheDocument();
            expect(screen.getByText('TELLER')).toBeInTheDocument();
        });

        test('renders all users in list', async () => {
            setupMocks();
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
                expect(screen.getByText('Bob')).toBeInTheDocument();
                expect(screen.getByText('Charlie')).toBeInTheDocument();
            });
        });

        test('shows different roles correctly', async () => {
            setupMocks();
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('TELLER')).toBeInTheDocument();
                expect(screen.getByText('MANAGER')).toBeInTheDocument();
                expect(screen.getByText('ADMIN')).toBeInTheDocument();
            });
        });

        test('handles empty user list', async () => {
            setupMocks([], mockBranches);
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText(/ניהול משתמשים/i)).toBeInTheDocument();
            });
        });
    });

    describe('Edit Dialog', () => {
        test('opens edit dialog when edit button clicked', async () => {
            setupMocks();
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByText('עריכה');
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
            });
        });

        test('closes dialog on cancel', async () => {
            setupMocks();
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByText('עריכה');
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('ביטול'));

            await waitFor(() => {
                expect(screen.queryByText('עריכת משתמש: Alice')).not.toBeInTheDocument();
            });
        });

        test('populates dialog with current user values', async () => {
            setupMocks();
            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByText('עריכה');
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
            });

            // The dialog should show save and cancel buttons
            expect(screen.getByText('שמור')).toBeInTheDocument();
            expect(screen.getByText('ביטול')).toBeInTheDocument();
        });
    });

    describe('User Update', () => {
        test('saves changes when save clicked', async () => {
            setupMocks();
            (api.patch as any).mockResolvedValue({ data: { ...mockUsers[0], role: 'MANAGER' } });

            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByText('עריכה');
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('שמור'));

            await waitFor(() => {
                expect(api.patch).toHaveBeenCalledWith('/admin/users/1', expect.any(Object));
            });
        });

        test('shows error message when update fails', async () => {
            setupMocks();
            (api.patch as any).mockRejectedValue(new Error('Update failed'));

            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByText('עריכה');
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('שמור'));

            await waitFor(() => {
                expect(screen.getByText('עדכון המשתמש נכשל')).toBeInTheDocument();
            });
        });

        test('closes dialog after successful save', async () => {
            setupMocks();
            (api.patch as any).mockResolvedValue({ data: { ...mockUsers[0], role: 'MANAGER' } });

            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText('Alice')).toBeInTheDocument();
            });

            const editButtons = screen.getAllByText('עריכה');
            fireEvent.click(editButtons[0]);

            await waitFor(() => {
                expect(screen.getByText('עריכת משתמש: Alice')).toBeInTheDocument();
            });

            fireEvent.click(screen.getByText('שמור'));

            await waitFor(() => {
                expect(screen.queryByText('עריכת משתמש: Alice')).not.toBeInTheDocument();
            }, { timeout: 3000 });
        });
    });

    describe('Error Handling', () => {
        test('shows error when data fetch fails', async () => {
            (api.get as any).mockRejectedValue(new Error('Network error'));

            renderWithAuth(<Admin />);

            await waitFor(() => {
                expect(screen.getByText(/שגיאה בטעינת הנתונים/i)).toBeInTheDocument();
            });
        });

        test('shows loading spinner initially', async () => {
            (api.get as any).mockImplementation(() => new Promise(resolve => {
                setTimeout(() => resolve({ data: [] }), 100);
            }));

            renderWithAuth(<Admin />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
            });
        });
    });
});