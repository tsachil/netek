import { getUsers, getBranches, updateUser } from '../controllers/adminController';
import { prismaMock } from './singleton';
import { Request, Response } from 'express';

// Valid UUIDs for testing
const USER_ID = '550e8400-e29b-41d4-a716-446655440000';
const BRANCH_ID = '550e8400-e29b-41d4-a716-446655440001';
const TARGET_USER_ID = '550e8400-e29b-41d4-a716-446655440002';

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

describe('Admin Controller', () => {
    describe('getUsers', () => {
        test('should return all users with branch info', async () => {
            const mockUsers = [
                { id: USER_ID, name: 'User 1', email: 'user1@test.com', role: 'TELLER', branch: { id: BRANCH_ID, name: 'Main Branch' } },
                { id: TARGET_USER_ID, name: 'User 2', email: 'user2@test.com', role: 'ADMIN', branch: { id: BRANCH_ID, name: 'Main Branch' } }
            ];
            prismaMock.user.findMany.mockResolvedValue(mockUsers as any);

            const req = mockRequest({ id: USER_ID, role: 'ADMIN' });
            const res = mockResponse();

            await getUsers(req, res);

            expect(prismaMock.user.findMany).toHaveBeenCalledWith({
                include: { branch: true },
                orderBy: { name: 'asc' }
            });
            expect(res.json).toHaveBeenCalledWith(mockUsers);
        });

        test('should return empty array when no users exist', async () => {
            prismaMock.user.findMany.mockResolvedValue([]);

            const req = mockRequest({ id: USER_ID, role: 'ADMIN' });
            const res = mockResponse();

            await getUsers(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('should handle database errors gracefully', async () => {
            prismaMock.user.findMany.mockRejectedValue(new Error('DB Error'));

            const req = mockRequest({ id: USER_ID, role: 'ADMIN' });
            const res = mockResponse();

            await getUsers(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
        });
    });

    describe('getBranches', () => {
        test('should return all branches', async () => {
            const mockBranches = [
                { id: BRANCH_ID, name: 'Main Branch', code: 'MAIN' },
                { id: '550e8400-e29b-41d4-a716-446655440003', name: 'Secondary', code: 'SEC' }
            ];
            prismaMock.branch.findMany.mockResolvedValue(mockBranches as any);

            const req = mockRequest({ id: USER_ID, role: 'ADMIN' });
            const res = mockResponse();

            await getBranches(req, res);

            expect(res.json).toHaveBeenCalledWith(mockBranches);
        });

        test('should return empty array when no branches exist', async () => {
            prismaMock.branch.findMany.mockResolvedValue([]);

            const req = mockRequest({ id: USER_ID, role: 'ADMIN' });
            const res = mockResponse();

            await getBranches(req, res);

            expect(res.json).toHaveBeenCalledWith([]);
        });

        test('should handle database errors gracefully', async () => {
            prismaMock.branch.findMany.mockRejectedValue(new Error('DB Error'));

            const req = mockRequest({ id: USER_ID, role: 'ADMIN' });
            const res = mockResponse();

            await getBranches(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
        });
    });

    describe('updateUser', () => {
        test('should update user role and branch successfully', async () => {
            const updatedUser = { id: TARGET_USER_ID, name: 'Target', role: 'MANAGER', branchId: BRANCH_ID, branch: { id: BRANCH_ID, name: 'Main' } };
            prismaMock.user.update.mockResolvedValue(updatedUser as any);

            const req = mockRequest(
                { id: USER_ID, role: 'ADMIN' },
                { role: 'MANAGER', branchId: BRANCH_ID },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });

        test('should prevent non-ADMIN from assigning ADMIN role', async () => {
            const req = mockRequest(
                { id: USER_ID, role: 'MANAGER' },
                { role: 'ADMIN' },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Only ADMIN can assign ADMIN role' });
        });

        test('should allow ADMIN to assign ADMIN role', async () => {
            const updatedUser = { id: TARGET_USER_ID, name: 'Target', role: 'ADMIN', branchId: BRANCH_ID };
            prismaMock.user.update.mockResolvedValue(updatedUser as any);

            const req = mockRequest(
                { id: USER_ID, role: 'ADMIN' },
                { role: 'ADMIN', branchId: BRANCH_ID },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });

        test('should prevent MANAGER from modifying ADMIN users', async () => {
            prismaMock.user.findUnique.mockResolvedValue({ id: TARGET_USER_ID, role: 'ADMIN' } as any);

            const req = mockRequest(
                { id: USER_ID, role: 'MANAGER' },
                { role: 'TELLER' },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Cannot modify ADMIN users' });
        });

        test('should allow MANAGER to modify TELLER users', async () => {
            prismaMock.user.findUnique.mockResolvedValue({ id: TARGET_USER_ID, role: 'TELLER' } as any);
            const updatedUser = { id: TARGET_USER_ID, name: 'Target', role: 'MANAGER', branchId: BRANCH_ID };
            prismaMock.user.update.mockResolvedValue(updatedUser as any);

            const req = mockRequest(
                { id: USER_ID, role: 'MANAGER' },
                { role: 'MANAGER', branchId: BRANCH_ID },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.json).toHaveBeenCalledWith(updatedUser);
        });

        test('should reject invalid role value', async () => {
            const req = mockRequest(
                { id: USER_ID, role: 'ADMIN' },
                { role: 'SUPERUSER' },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid Input' }));
        });

        test('should reject invalid branchId format', async () => {
            const req = mockRequest(
                { id: USER_ID, role: 'ADMIN' },
                { branchId: 'not-a-uuid' },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Invalid Input' }));
        });

        test('should handle database errors gracefully', async () => {
            prismaMock.user.update.mockRejectedValue(new Error('DB Error'));

            const req = mockRequest(
                { id: USER_ID, role: 'ADMIN' },
                { role: 'MANAGER', branchId: BRANCH_ID },
                { id: TARGET_USER_ID }
            );
            const res = mockResponse();

            await updateUser(req, res);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
        });
    });
});
