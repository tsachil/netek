import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Layout from '../components/Layout';
import { AuthContext } from '../context/AuthContext';
import { vi } from 'vitest';

const mockLogout = vi.fn();

const renderWithContext = (user: any) => {
    return render(
        <AuthContext.Provider value={{ user, loading: false, login: vi.fn(), logout: mockLogout }}>
            <MemoryRouter>
                <Layout />
            </MemoryRouter>
        </AuthContext.Provider>
    );
};

describe('Layout Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('App Bar', () => {
        test('displays app title', () => {
            renderWithContext({ id: '1', name: 'Test User', email: 'test@test.com', role: 'TELLER', branchId: 'b1' });

            expect(screen.getByText('לוח בקרה בנקאי')).toBeInTheDocument();
        });

        test('displays user name and role', () => {
            renderWithContext({ id: '1', name: 'Alice', email: 'alice@test.com', role: 'MANAGER', branchId: 'b1' });

            expect(screen.getByText('Alice (MANAGER)')).toBeInTheDocument();
        });
    });

    describe('Navigation Buttons', () => {
        test('shows customers button for all authenticated users', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'TELLER', branchId: 'b1' });

            expect(screen.getByText('לקוחות')).toBeInTheDocument();
        });

        test('shows transactions button for all authenticated users', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'TELLER', branchId: 'b1' });

            expect(screen.getByText('תנועות')).toBeInTheDocument();
        });

        test('shows admin button for MANAGER', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'MANAGER', branchId: 'b1' });

            expect(screen.getByText('ניהול')).toBeInTheDocument();
        });

        test('shows admin button for ADMIN', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'ADMIN', branchId: 'b1' });

            expect(screen.getByText('ניהול')).toBeInTheDocument();
        });

        test('hides admin button for TELLER', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'TELLER', branchId: 'b1' });

            expect(screen.queryByText('ניהול')).not.toBeInTheDocument();
        });
    });

    describe('Logout', () => {
        test('shows logout button when user is authenticated', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'TELLER', branchId: 'b1' });

            expect(screen.getByText('יציאה')).toBeInTheDocument();
        });

        test('calls logout when logout button clicked', () => {
            renderWithContext({ id: '1', name: 'Test', email: 'test@test.com', role: 'TELLER', branchId: 'b1' });

            fireEvent.click(screen.getByText('יציאה'));

            expect(mockLogout).toHaveBeenCalled();
        });
    });

    describe('No User', () => {
        test('hides navigation when user is null', () => {
            renderWithContext(null);

            expect(screen.getByText('לוח בקרה בנקאי')).toBeInTheDocument();
            expect(screen.queryByText('לקוחות')).not.toBeInTheDocument();
            expect(screen.queryByText('תנועות')).not.toBeInTheDocument();
            expect(screen.queryByText('יציאה')).not.toBeInTheDocument();
        });
    });
});
