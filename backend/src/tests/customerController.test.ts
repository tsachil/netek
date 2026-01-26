import { getCustomers, createCustomer, getCustomerById } from '../controllers/customerController';
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

describe('Customer Controller', () => {
    test('getCustomers should return customers for the user branch', async () => {
        const user = { branchId: 'branch1' };
        const req = mockRequest(user);
        const res = mockResponse();
        const mockCustomers = [{ id: '1', name: 'Alice', branchId: 'branch1' }];

        prismaMock.customer.findMany.mockResolvedValue(mockCustomers as any);

        await getCustomers(req, res);

        expect(prismaMock.customer.findMany).toHaveBeenCalledWith({
            where: { branchId: 'branch1' },
            include: { accounts: true }
        });
        expect(res.json).toHaveBeenCalledWith(mockCustomers);
    });

    test('createCustomer should create a new customer', async () => {
        const user = { branchId: 'branch1' };
        const req = mockRequest(user, { name: 'Bob', email: 'bob@example.com', phone: '123' });
        const res = mockResponse();
        const mockCustomer = { id: '2', name: 'Bob', branchId: 'branch1' };

        prismaMock.customer.create.mockResolvedValue(mockCustomer as any);

        await createCustomer(req, res);

        expect(prismaMock.customer.create).toHaveBeenCalledWith({
            data: {
                name: 'Bob',
                email: 'bob@example.com',
                phone: '123',
                branchId: 'branch1'
            }
        });
        expect(res.status).toHaveBeenCalledWith(201);
        expect(res.json).toHaveBeenCalledWith(mockCustomer);
    });

    test('getCustomerById should return 403 if customer is in different branch', async () => {
        const user = { branchId: 'branch1' };
        const req = mockRequest(user, {}, { id: 'cust2' });
        const res = mockResponse();
        const mockCustomer = { id: 'cust2', branchId: 'branch2' };

        prismaMock.customer.findUnique.mockResolvedValue(mockCustomer as any);

        await getCustomerById(req, res);

        expect(res.status).toHaveBeenCalledWith(403);
    });
});
