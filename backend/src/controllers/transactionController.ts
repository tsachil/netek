import { Request, Response } from 'express';
import prisma from '../prisma';

export const getBranchTransactions = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    
    // Fetch transactions where the account belongs to a customer in the user's branch
    const transactions = await prisma.transaction.findMany({
      where: {
        account: {
            customer: {
                branchId: user.branchId
            }
        }
      },
      include: {
        account: {
            include: {
                customer: true
            }
        },
        user: true // Include the banker who performed it
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 100 // Limit to last 100 transactions for performance
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching transactions', error });
  }
};
