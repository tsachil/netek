import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { vi } from 'vitest';
import api from '../api/axios';

// Mock API
vi.mock('../api/axios');

// Test component to access auth context
const TestComponent = () => {
    const { user, loading, login, logout } = useAuth();

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div data-testid="user">{user ? user.name : 'No user'}</div>
            <div data-testid="role">{user?.role || 'No role'}</div>
            <button onClick={login}>Login</button>
            <button onClick={logout}>Logout</button>
        </div>
    );
};

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Reset window.location.href mock
        delete (window as any).location;
        (window as any).location = { href: '' };
    });

    describe('Initial Load', () => {
        test('shows loading state initially', async () => {
            (api.get as any).mockImplementation(() => new Promise(resolve => {
                setTimeout(() => resolve({ data: { id: '1', name: 'Test', role: 'TELLER' } }), 100);
            }));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            expect(screen.getByText('Loading...')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
            });
        });

        test('sets user data on successful auth check', async () => {
            (api.get as any).mockResolvedValue({
                data: { id: '1', name: 'Alice', email: 'alice@test.com', role: 'ADMIN', branchId: 'b1' }
            });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('Alice');
                expect(screen.getByTestId('role')).toHaveTextContent('ADMIN');
            });
        });

        test('sets user to null on auth check failure', async () => {
            (api.get as any).mockRejectedValue(new Error('Unauthorized'));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('No user');
            });
        });

        test('calls /auth/me on mount', async () => {
            (api.get as any).mockResolvedValue({ data: { id: '1', name: 'Test', role: 'TELLER' } });

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(api.get).toHaveBeenCalledWith('/auth/me');
            });
        });
    });

    describe('Login', () => {
        test('redirects to Google OAuth URL', async () => {
            (api.get as any).mockRejectedValue(new Error('Not authenticated'));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('No user');
            });

            act(() => {
                screen.getByText('Login').click();
            });

            expect(window.location.href).toContain('/auth/google');
        });
    });

    describe('Logout', () => {
        test('calls logout API and clears user', async () => {
            (api.get as any).mockResolvedValue({
                data: { id: '1', name: 'Alice', role: 'ADMIN' }
            });
            (api.post as any).mockResolvedValue({});

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('Alice');
            });

            await act(async () => {
                screen.getByText('Logout').click();
            });

            expect(api.post).toHaveBeenCalledWith('/auth/logout');
        });

        test('redirects to home after logout', async () => {
            (api.get as any).mockResolvedValue({
                data: { id: '1', name: 'Alice', role: 'ADMIN' }
            });
            (api.post as any).mockResolvedValue({});

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('Alice');
            });

            await act(async () => {
                screen.getByText('Logout').click();
            });

            expect(window.location.href).toBe('/');
        });

        test('still redirects even if logout API fails', async () => {
            (api.get as any).mockResolvedValue({
                data: { id: '1', name: 'Alice', role: 'ADMIN' }
            });
            (api.post as any).mockRejectedValue(new Error('Logout failed'));

            render(
                <AuthProvider>
                    <TestComponent />
                </AuthProvider>
            );

            await waitFor(() => {
                expect(screen.getByTestId('user')).toHaveTextContent('Alice');
            });

            await act(async () => {
                screen.getByText('Logout').click();
            });

            // Should still redirect even on error
            expect(window.location.href).toBe('/');
        });
    });

    describe('useAuth Hook', () => {
        test('throws error when used outside provider', () => {
            // Suppress console.error for this test
            const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

            expect(() => {
                render(<TestComponent />);
            }).toThrow('useAuth must be used within an AuthProvider');

            consoleSpy.mockRestore();
        });
    });
});
