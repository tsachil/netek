import { createAccount, performTransaction } from '../controllers/accountController';
import { prismaMock } from './singleton';
import { Request, Response } from 'express';

// Valid UUIDs for testing
const CUSTOMER_ID = '550e8400-e29b-41d4-a716-446655440000';
const BRANCH_ID_1 = '550e8400-e29b-41d4-a716-446655440001';
const BRANCH_ID_2 = '550e8400-e29b-41d4-a716-446655440002';
const ACCOUNT_ID = '550e8400-e29b-41d4-a716-446655440003';
const USER_ID = '550e8400-e29b-41d4-a716-446655440004';

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

// Helper to create mock transaction
const createMockTransaction = (account: any, updatedBalance: number) => {
    return async (callback: any) => {
        const txClient = {
            account: {
                findUnique: jest.fn().mockResolvedValue(account),
                update: jest.fn().mockResolvedValue({ ...account, balance: updatedBalance }),
            },
            transaction: {
                create: jest.fn().mockResolvedValue({ id: 'tx1' }),
            },
        };
        return callback(txClient);
    };
};

describe('Account Controller', () => {
    describe('createAccount', () => {
        test('should fail if customer in different branch', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'TELLER' };
            const req = mockRequest(user, { customerId: CUSTOMER_ID, type: 'CHECKING' });
            const res = mockResponse();

            prismaMock.customer.findUnique.mockResolvedValue({ id: CUSTOMER_ID, branchId: BRANCH_ID_2 } as any);

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should succeed for same branch', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'TELLER' };
            const req = mockRequest(user, { customerId: CUSTOMER_ID, type: 'CHECKING' });
            const res = mockResponse();

            prismaMock.customer.findUnique.mockResolvedValue({ id: CUSTOMER_ID, branchId: BRANCH_ID_1 } as any);
            prismaMock.account.create.mockResolvedValue({ id: ACCOUNT_ID, balance: 0 } as any);

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should allow ADMIN to create account for any branch', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'ADMIN' };
            const req = mockRequest(user, { customerId: CUSTOMER_ID, type: 'SAVINGS' });
            const res = mockResponse();

            prismaMock.customer.findUnique.mockResolvedValue({ id: CUSTOMER_ID, branchId: BRANCH_ID_2 } as any);
            prismaMock.account.create.mockResolvedValue({ id: ACCOUNT_ID, balance: 0, type: 'SAVINGS' } as any);

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(201);
        });

        test('should return 404 when customer not found', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'TELLER' };
            const req = mockRequest(user, { customerId: CUSTOMER_ID, type: 'CHECKING' });
            const res = mockResponse();

            prismaMock.customer.findUnique.mockResolvedValue(null);

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Customer not found' });
        });

        test('should reject invalid customerId format', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'TELLER' };
            const req = mockRequest(user, { customerId: 'not-a-uuid', type: 'CHECKING' });
            const res = mockResponse();

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid input' }));
        });

        test('should reject invalid account type', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'TELLER' };
            const req = mockRequest(user, { customerId: CUSTOMER_ID, type: 'INVALID' });
            const res = mockResponse();

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid input' }));
        });

        test('should reject missing required fields', async () => {
            const user = { branchId: BRANCH_ID_1, role: 'TELLER' };
            const req = mockRequest(user, {});
            const res = mockResponse();

            await createAccount(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
        });
    });

    describe('performTransaction', () => {
        test('should execute atomic DEPOSIT transaction', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 100, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 0, customer: { branchId: BRANCH_ID_1 } };
            prismaMock.$transaction.mockImplementation(createMockTransaction(mockAccount, 100));

            await performTransaction(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        test('should execute atomic WITHDRAWAL transaction', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 50, type: 'WITHDRAWAL' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 100, customer: { branchId: BRANCH_ID_1 } };
            prismaMock.$transaction.mockImplementation(createMockTransaction(mockAccount, 50));

            await performTransaction(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        test('should return 400 for insufficient funds on WITHDRAWAL', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 200, type: 'WITHDRAWAL' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 100, customer: { branchId: BRANCH_ID_1 } };
            prismaMock.$transaction.mockImplementation(async (callback: any) => {
                const txClient = {
                    account: {
                        findUnique: jest.fn().mockResolvedValue(mockAccount),
                    },
                };
                return callback(txClient);
            });

            await performTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({ message: 'Insufficient funds' });
        });

        test('should return 404 when account not found', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 100, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            prismaMock.$transaction.mockImplementation(async (callback: any) => {
                const txClient = {
                    account: {
                        findUnique: jest.fn().mockResolvedValue(null),
                    },
                };
                return callback(txClient);
            });

            await performTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Account not found' });
        });

        test('should return 403 when account in different branch (non-ADMIN)', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 100, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 0, customer: { branchId: BRANCH_ID_2 } };
            prismaMock.$transaction.mockImplementation(async (callback: any) => {
                const txClient = {
                    account: {
                        findUnique: jest.fn().mockResolvedValue(mockAccount),
                    },
                };
                return callback(txClient);
            });

            await performTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden' });
        });

        test('should allow ADMIN to transact on any branch', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'ADMIN' };
            const req = mockRequest(user, { amount: 100, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 0, customer: { branchId: BRANCH_ID_2 } };
            prismaMock.$transaction.mockImplementation(createMockTransaction(mockAccount, 100));

            await performTransaction(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        test('should reject negative amount', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: -100, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            await performTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid input' }));
        });

        test('should reject zero amount', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 0, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            await performTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid input' }));
        });

        test('should reject invalid transaction type', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 100, type: 'INVALID' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            await performTransaction(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid input' }));
        });

        test('should handle decimal amounts', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 99.99, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 0.01, customer: { branchId: BRANCH_ID_1 } };
            prismaMock.$transaction.mockImplementation(createMockTransaction(mockAccount, 100));

            await performTransaction(req, res);

            expect(res.json).toHaveBeenCalled();
        });

        test('should use SERIALIZABLE isolation level', async () => {
            const user = { branchId: BRANCH_ID_1, id: USER_ID, role: 'TELLER' };
            const req = mockRequest(user, { amount: 100, type: 'DEPOSIT' }, { id: ACCOUNT_ID });
            const res = mockResponse();

            const mockAccount = { id: ACCOUNT_ID, balance: 0, customer: { branchId: BRANCH_ID_1 } };
            prismaMock.$transaction.mockImplementation(createMockTransaction(mockAccount, 100));

            await performTransaction(req, res);

            // Verify $transaction was called with options including isolation level
            expect(prismaMock.$transaction).toHaveBeenCalledWith(
                expect.any(Function),
                expect.objectContaining({ isolationLevel: 'Serializable' })
            );
        });
    });
});
