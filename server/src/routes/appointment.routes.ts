import { Router } from 'express';
import {
  getAppointments,
  createAppointment,
  updateAppointmentStatus,
} from '../controllers/appointment.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getAppointments);
router.post('/', createAppointment);
router.patch('/:id/status', updateAppointmentStatus);

export default router;
