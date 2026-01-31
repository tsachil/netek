import { Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';

const createCustomerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
});

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const where: any = {};
    
    if (user.role !== 'ADMIN') {
        where.branchId = user.branchId;
    }

    const customers = await prisma.customer.findMany({
      where,
      include: {
        accounts: true,
      }
    });
    res.json(customers);
  } catch (error) {
    console.error('getCustomers Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    // Validate Input
    const validation = createCustomerSchema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ message: 'Invalid Input', errors: validation.error.issues });
    }

    const { name, email, phone } = validation.data;

    const customer = await prisma.customer.create({
      data: {
        name,
        email,
        phone,
        branchId: user.branchId,
      },
    });
    res.status(201).json(customer);
  } catch (error) {
    console.error('createCustomer Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const id = req.params.id as string;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: {
        accounts: {
          include: {
            transactions: {
              orderBy: { timestamp: 'desc' },
              take: 50 // Limit transactions per account to prevent unbounded responses
            }
          }
        }
      },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (user.role !== 'ADMIN' && customer.branchId !== user.branchId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(customer);
  } catch (error) {
        res.status(500).json({ message: 'Internal Server Error' });
      }
    };
    
    export const getAllCustomers = async (req: Request, res: Response) => {
      try {
        const customers = await prisma.customer.findMany({
          include: {
            accounts: true,
          }
        });
        res.json(customers);
      } catch (error) {
        console.error('getAllCustomers Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
      }
    };
    
