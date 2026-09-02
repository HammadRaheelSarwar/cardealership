import { Router } from 'express';
import {
  handleTwilioSMSWebhook,
  handleTwilioStatusWebhook,
  handleInboundEmailWebhook,
} from '../controllers/webhook.controller';

const router = Router();

router.post('/twilio/sms', handleTwilioSMSWebhook);
router.post('/twilio/status', handleTwilioStatusWebhook);
router.post('/email/inbound', handleInboundEmailWebhook);

export default router;
