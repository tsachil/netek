import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { customerId, type } = req.body;

    // Verify customer belongs to user's branch
    const customer = await prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.branchId !== user.branchId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const account = await prisma.account.create({
      data: {
        customerId,
        type,
        balance: 0,
      },
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ message: 'Error creating account', error });
  }
};

export const performTransaction = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { id } = req.params; // Account ID
    const { amount, type } = req.body; // type: DEPOSIT, WITHDRAWAL

    // Validate input
    if (amount <= 0) {
        return res.status(400).json({ message: 'Amount must be positive' });
    }

    const account = await prisma.account.findUnique({
        where: { id },
        include: { customer: true }
    });

    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }

    if (account.customer.branchId !== user.branchId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    if (type === 'WITHDRAWAL' && Number(account.balance) < Number(amount)) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Perform transaction atomically
    const result = await prisma.$transaction(async (tx) => {
        const newBalance = type === 'DEPOSIT' 
            ? Number(account.balance) + Number(amount) 
            : Number(account.balance) - Number(amount);

        const updatedAccount = await tx.account.update({
            where: { id },
            data: { balance: newBalance }
        });

        const transaction = await tx.transaction.create({
            data: {
                accountId: id,
                amount: amount,
                type: type, // Ensure this matches enum string exactly (DEPOSIT/WITHDRAWAL)
                performedBy: user.id
            }
        });

        return { account: updatedAccount, transaction };
    });

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error performing transaction', error });
  }
};
