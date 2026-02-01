import { Router } from 'express';
import { getAllCustomers } from '../controllers/customerController';
import { performPublicTransaction } from '../controllers/accountController';

const router = Router();

router.get('/customers', getAllCustomers);
router.post('/accounts/:id/transaction', performPublicTransaction);

export default router;
