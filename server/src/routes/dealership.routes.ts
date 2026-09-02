import { Router } from 'express';
import {
  createDealership,
  getMyDealerships,
  getDealership,
  updateDealership,
} from '../controllers/dealership.controller';
import { authenticate, resolveTenant, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createDealershipSchema,
  updateDealershipSchema,
} from '../validators/dealership.validator';

const router = Router();

// All dealership routes require authentication
router.use(authenticate);

// Does NOT need resolveTenant — user is creating or listing their own dealerships
router.post('/', validate(createDealershipSchema), createDealership);
router.get('/mine', getMyDealerships);

// These routes require tenant resolution (x-dealership-id header)
router.use(resolveTenant);
router.get('/:id', getDealership);
router.patch('/:id', requireRole('owner'), validate(updateDealershipSchema), updateDealership);

export default router;
