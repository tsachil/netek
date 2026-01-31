import { Router } from 'express';
import { getAllCustomers } from '../controllers/customerController';

const router = Router();

router.get('/customers', getAllCustomers);

export default router;
