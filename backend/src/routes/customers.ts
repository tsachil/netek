import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { getCustomers, createCustomer, getCustomerById } from '../controllers/customerController';

const router = Router();

router.use(isAuthenticated);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomerById);

export default router;
