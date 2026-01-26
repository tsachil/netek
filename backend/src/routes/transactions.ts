import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { getBranchTransactions } from '../controllers/transactionController';

const router = Router();

router.use(isAuthenticated);

router.get('/', getBranchTransactions);

export default router;
