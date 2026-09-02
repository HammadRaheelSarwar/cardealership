import { Router } from 'express';
import {
  getCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
} from '../controllers/customer.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.get('/:id', getCustomer);
router.patch('/:id', updateCustomer);

export default router;
