import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

// Mock Auth Context
const mockAuth = {
    user: { id: '1', name: 'Test Banker', role: 'TELLER', branchId: 'branch1', email: 'test@bank.com' },
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
};

export const renderWithAuth = (ui: React.ReactElement, authValue = mockAuth) => {
    return render(
        <AuthContext.Provider value={authValue}>
            <BrowserRouter>
                {ui}
            </BrowserRouter>
        </AuthContext.Provider>
    );
};
