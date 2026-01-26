import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithAuth } from './utils';
import Login from '../pages/Login';
import { vi } from 'vitest';

describe('Login Page', () => {
    test('renders sign in button', () => {
        // Mock not authenticated
        renderWithAuth(<Login />, { user: null, loading: false, login: vi.fn(), logout: vi.fn() });
        expect(screen.getByText(/הבנק שלי/i)).toBeInTheDocument();
        expect(screen.getByText(/התחברות עם גוגל/i)).toBeInTheDocument();
    });

    test('calls login on button click', () => {
        const loginMock = vi.fn();
        renderWithAuth(<Login />, { user: null, loading: false, login: loginMock, logout: vi.fn() });
        
        fireEvent.click(screen.getByText(/התחברות עם גוגל/i));
        expect(loginMock).toHaveBeenCalled();
    });
});