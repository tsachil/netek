import { Router } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { authorize } from '../middleware/authorize';
import { getUsers, updateUser, getBranches } from '../controllers/adminController';

const router = Router();

router.use(isAuthenticated);
router.use(authorize(['MANAGER', 'ADMIN'])); // Only Managers/Admins

router.get('/users', getUsers);
router.get('/branches', getBranches);
router.patch('/users/:id', updateUser);

export default router;
