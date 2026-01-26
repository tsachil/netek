import { Request, Response } from 'express';
import prisma from '../prisma';
import Decimal from 'decimal.js';

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

    if (user.role !== 'ADMIN' && customer.branchId !== user.branchId) {
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
    res.status(500).json({ message: 'Error creating account' });
  }
};

export const performTransaction = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const id = req.params.id as string; 
    const { amount, type } = req.body; 

    const txAmount = new Decimal(amount);

    if (txAmount.lessThanOrEqualTo(0)) {
        return res.status(400).json({ message: 'Amount must be positive' });
    }

    const account = await prisma.account.findUnique({
        where: { id },
        include: { customer: true }
    });

    if (!account) {
        return res.status(404).json({ message: 'Account not found' });
    }

    if (user.role !== 'ADMIN' && account.customer.branchId !== user.branchId) {
        return res.status(403).json({ message: 'Forbidden' });
    }

    const currentBalance = new Decimal(account.balance.toString());

    if (type === 'WITHDRAWAL' && currentBalance.lessThan(txAmount)) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }

    // Perform transaction atomically
    const result = await prisma.$transaction(async (tx) => {
        const newBalance = type === 'DEPOSIT' 
            ? currentBalance.plus(txAmount)
            : currentBalance.minus(txAmount);

        const updatedAccount = await tx.account.update({
            where: { id },
            data: { balance: newBalance.toNumber() } // Prisma expects number/Decimal
        });

        const transaction = await tx.transaction.create({
            data: {
                accountId: id,
                amount: txAmount.toNumber(),
                type: type, 
                performedBy: user.id
            }
        });

        return { account: updatedAccount, transaction };
    });

    res.json(result);

  } catch (error) {
    console.error('Transaction Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
