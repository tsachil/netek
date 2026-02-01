import { getPublicCustomerTransactions } from '../controllers/transactionController';
import { prismaMock } from './singleton';
import { Request, Response } from 'express';

describe('Public Transaction Controller', () => {
    test('getPublicCustomerTransactions should fetch transactions for customer', async () => {
        const customerId = 'customer-123';
        const req = { params: { customerId } } as unknown as Request;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;

        const mockTransactions = [
            { id: 'tx1', amount: 100, accountId: 'acc1', timestamp: new Date() }
        ];

        prismaMock.transaction.findMany.mockResolvedValue(mockTransactions as any);

        await getPublicCustomerTransactions(req, res);

        expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                account: {
                    customerId: customerId
                }
            },
            take: 50,
            orderBy: { timestamp: 'desc' }
        }));
        expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    test('getPublicCustomerTransactions should handle errors', async () => {
        const customerId = 'customer-123';
        const req = { params: { customerId } } as unknown as Request;
        const res = { json: jest.fn(), status: jest.fn().mockReturnThis() } as unknown as Response;

        prismaMock.transaction.findMany.mockRejectedValue(new Error('DB Error'));

        await getPublicCustomerTransactions(req, res);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ message: 'Error fetching customer transactions' });
    });
});
