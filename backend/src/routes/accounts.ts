import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { createAccount, performTransaction } from '../controllers/accountController';

const router = Router();

router.use(isAuthenticated);

router.post('/', createAccount);
router.post('/:id/transaction', performTransaction);

export default router;
