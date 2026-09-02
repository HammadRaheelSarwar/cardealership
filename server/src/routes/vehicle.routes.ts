import { Router } from 'express';
import {
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
} from '../controllers/vehicle.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getVehicles);
router.post('/', createVehicle);
router.get('/:id', getVehicle);
router.patch('/:id', updateVehicle);

export default router;
