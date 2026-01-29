import { Request, Response } from 'express';
import prisma from '../prisma';
import Decimal from 'decimal.js';
import { z } from 'zod';
import { Prisma } from '@prisma/client';

const createAccountSchema = z.object({
  customerId: z.string().uuid(),
  type: z.enum(['CHECKING', 'SAVINGS']),
});

const performTransactionSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL']),
});

export const createAccount = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;

    const validation = createAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid input', errors: validation.error.issues });
    }

    const { customerId, type } = validation.data;

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
    console.error('createAccount Error:', error);
    res.status(500).json({ message: 'Error creating account' });
  }
};

export const performTransaction = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const id = req.params.id as string;

    const validation = performTransactionSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ message: 'Invalid input', errors: validation.error.issues });
    }

    const { amount, type } = validation.data;
    const txAmount = new Decimal(amount);

    // Perform entire operation atomically with SERIALIZABLE isolation to prevent race conditions
    const result = await prisma.$transaction(async (tx) => {
        // Fetch account INSIDE transaction to ensure consistency
        const account = await tx.account.findUnique({
            where: { id },
            include: { customer: true }
        });

        if (!account) {
            throw new Error('ACCOUNT_NOT_FOUND');
        }

        if (user.role !== 'ADMIN' && account.customer.branchId !== user.branchId) {
            throw new Error('FORBIDDEN');
        }

        const currentBalance = new Decimal(account.balance.toString());

        if (type === 'WITHDRAWAL' && currentBalance.lessThan(txAmount)) {
            throw new Error('INSUFFICIENT_FUNDS');
        }

        const newBalance = type === 'DEPOSIT'
            ? currentBalance.plus(txAmount)
            : currentBalance.minus(txAmount);

        const updatedAccount = await tx.account.update({
            where: { id },
            data: { balance: new Prisma.Decimal(newBalance.toString()) }
        });

        const transaction = await tx.transaction.create({
            data: {
                accountId: id,
                amount: new Prisma.Decimal(txAmount.toString()),
                type: type,
                performedBy: user.id
            }
        });

        return { account: updatedAccount, transaction };
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable
    });

    res.json(result);

  } catch (error: any) {
    if (error.message === 'ACCOUNT_NOT_FOUND') {
      return res.status(404).json({ message: 'Account not found' });
    }
    if (error.message === 'FORBIDDEN') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    if (error.message === 'INSUFFICIENT_FUNDS') {
      return res.status(400).json({ message: 'Insufficient funds' });
    }
    console.error('Transaction Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
