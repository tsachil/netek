import { isAuthenticated } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { Request, Response, NextFunction } from 'express';

const mockRequest = (isAuthenticatedValue: boolean, user?: any) => {
    return {
        isAuthenticated: jest.fn().mockReturnValue(isAuthenticatedValue),
        user
    } as unknown as Request;
};

const mockResponse = () => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
};

describe('Middleware', () => {
    describe('isAuthenticated', () => {
        test('should call next() when user is authenticated', () => {
            const req = mockRequest(true);
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            isAuthenticated(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should return 401 when user is not authenticated', () => {
            const req = mockRequest(false);
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            isAuthenticated(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(401);
            expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized' });
        });
    });

    describe('authorize', () => {
        test('should call next() when user role is in allowed roles', () => {
            const req = mockRequest(true, { role: 'ADMIN' });
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['ADMIN'])(req, res, next);

            expect(next).toHaveBeenCalled();
            expect(res.status).not.toHaveBeenCalled();
        });

        test('should call next() when user role is in multiple allowed roles', () => {
            const req = mockRequest(true, { role: 'MANAGER' });
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['MANAGER', 'ADMIN'])(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should return 403 when user role is not in allowed roles', () => {
            const req = mockRequest(true, { role: 'TELLER' });
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['MANAGER', 'ADMIN'])(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
            expect(res.json).toHaveBeenCalledWith({ message: 'Forbidden: Insufficient privileges' });
        });

        test('should return 403 when user is null', () => {
            const req = mockRequest(true, null);
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['ADMIN'])(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should return 403 when user is undefined', () => {
            const req = mockRequest(true, undefined);
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['ADMIN'])(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should return 403 when user has no role property', () => {
            const req = mockRequest(true, { name: 'Test User' });
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['ADMIN'])(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should be case-sensitive for role matching', () => {
            const req = mockRequest(true, { role: 'admin' }); // lowercase
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['ADMIN'])(req, res, next); // uppercase

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });

        test('should work with single role array', () => {
            const req = mockRequest(true, { role: 'TELLER' });
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize(['TELLER'])(req, res, next);

            expect(next).toHaveBeenCalled();
        });

        test('should return 403 with empty roles array', () => {
            const req = mockRequest(true, { role: 'ADMIN' });
            const res = mockResponse();
            const next = jest.fn() as NextFunction;

            authorize([])(req, res, next);

            expect(next).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(403);
        });
    });
});
