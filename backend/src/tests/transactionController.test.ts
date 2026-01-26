import { getBranchTransactions } from '../controllers/transactionController';
import { prismaMock } from './singleton';
import { Request, Response } from 'express';

describe('Transaction Controller', () => {
    test('getBranchTransactions should filter by branch', async () => {
        const user = { branchId: 'branch1' };
        const req = { user } as Request;
        const res = { json: jest.fn(), status: jest.fn() } as unknown as Response;

        prismaMock.transaction.findMany.mockResolvedValue([]);

        await getBranchTransactions(req, res);

        expect(prismaMock.transaction.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: {
                account: {
                    customer: {
                        branchId: 'branch1'
                    }
                }
            }
        }));
        expect(res.json).toHaveBeenCalledWith([]);
    });
});
