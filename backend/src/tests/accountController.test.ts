import { createAccount, performTransaction } from '../controllers/accountController';
import { prismaMock } from './singleton';
import { Request, Response } from 'express';

const mockRequest = (user: any, body?: any, params?: any) => ({
    user,
    body,
    params,
}) as Request;

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Account Controller', () => {
    test('createAccount should fail if customer in different branch', async () => {
        const user = { branchId: 'branch1' };
        const req = mockRequest(user, { customerId: 'cust1', type: 'CHECKING' });
        const res = mockResponse();
        
        prismaMock.customer.findUnique.mockResolvedValue({ id: 'cust1', branchId: 'branch2' } as any);

        await createAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });

    test('createAccount should succeed for same branch', async () => {
        const user = { branchId: 'branch1' };
        const req = mockRequest(user, { customerId: 'cust1', type: 'CHECKING' });
        const res = mockResponse();
        
        prismaMock.customer.findUnique.mockResolvedValue({ id: 'cust1', branchId: 'branch1' } as any);
        prismaMock.account.create.mockResolvedValue({ id: 'acc1', balance: 0 } as any);

        await createAccount(req, res);

        expect(res.status).toHaveBeenCalledWith(201);
    });

    test('performTransaction should execute atomic transaction', async () => {
        const user = { branchId: 'branch1', id: 'user1' };
        const req = mockRequest(user, { amount: 100, type: 'DEPOSIT' }, { id: 'acc1' });
        const res = mockResponse();
        
        const mockAccount = { id: 'acc1', balance: 0, customer: { branchId: 'branch1' } };
        prismaMock.account.findUnique.mockResolvedValue(mockAccount as any);
        
        // Mock $transaction
        prismaMock.$transaction.mockImplementation((callback) => callback(prismaMock));
        prismaMock.account.update.mockResolvedValue({ ...mockAccount, balance: 100 } as any);
        prismaMock.transaction.create.mockResolvedValue({ id: 'tx1' } as any);

        await performTransaction(req, res);

        expect(prismaMock.account.update).toHaveBeenCalled();
        expect(prismaMock.transaction.create).toHaveBeenCalled();
        expect(res.json).toHaveBeenCalled();
    });
});
