import { Router } from 'express';
import {
  getConversations,
  getMessages,
  sendSMSMessage,
  sendEmailMessage,
} from '../controllers/message.controller';
import { authenticate, resolveTenant } from '../middleware/auth';

const router = Router();

router.use(authenticate, resolveTenant);

router.get('/conversations', getConversations);
router.get('/conversations/:conversationId/messages', getMessages);
router.post('/sms', sendSMSMessage);
router.post('/email', sendEmailMessage);

export default router;
