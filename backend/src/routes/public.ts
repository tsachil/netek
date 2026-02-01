import { Router } from 'express';
import { getAllCustomers } from '../controllers/customerController';
import { performPublicTransaction } from '../controllers/accountController';
import { getPublicCustomerTransactions } from '../controllers/transactionController';

const router = Router();

router.get('/customers', getAllCustomers);
router.post('/accounts/:id/transaction', performPublicTransaction);
router.get('/customers/:customerId/transactions', getPublicCustomerTransactions);

export default router;
