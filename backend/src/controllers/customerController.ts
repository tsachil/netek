import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const customers = await prisma.customer.findMany({
      where: {
        branchId: user.branchId,
      },
      include: {
        accounts: true,
      }
    });
    res.json(customers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customers', error });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { name, email, phone } = req.body;

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
    res.status(500).json({ message: 'Error creating customer', error });
  }
};

export const getCustomerById = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params;

    const customer = await prisma.customer.findUnique({
      where: { id },
      include: { accounts: true },
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.branchId !== user.branchId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching customer', error });
  }
};
