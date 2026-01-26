import { PrismaClient } from '@prisma/client'
import { mockDeep, DeepMockProxy } from 'jest-mock-extended'

jest.mock('../prisma', () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}))

import prisma from '../prisma'

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>
