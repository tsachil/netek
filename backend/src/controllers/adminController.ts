import { Request, Response } from 'express';
import prisma from '../prisma';
import { z } from 'zod';

const updateUserSchema = z.object({
  role: z.enum(['TELLER', 'MANAGER', 'ADMIN']).optional(),
  branchId: z.string().uuid().optional(),
});

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        branch: true
      },
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    console.error('getUsers Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getBranches = async (req: Request, res: Response) => {
    try {
        const branches = await prisma.branch.findMany();
        res.json(branches);
    } catch (error) {
        console.error('getBranches Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const validation = updateUserSchema.safeParse(req.body);

    if (!validation.success) {
        return res.status(400).json({ message: 'Invalid Input', errors: validation.error.issues });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: validation.data,
      include: { branch: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('updateUser Error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
