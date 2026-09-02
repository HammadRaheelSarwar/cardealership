import { Router } from 'express';
import { getTasks, createTask, updateTaskStatus } from '../controllers/task.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/', getTasks);
router.post('/', createTask);
router.patch('/:id/status', updateTaskStatus);

export default router;
