import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export async function handleTwilioSMSWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { From, To, Body, MessageSid } = req.body;
    logger.info(`[Webhook] Twilio SMS received from ${From} to ${To}: "${Body?.substring(0, 30)}" [SID: ${MessageSid}]`);

    // Lookup customer by phone number
    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('phone', From)
      .limit(1)
      .single();

    if (customer) {
      // Find or create open conversation
      let { data: conv } = await supabase
        .from('conversations')
        .select('id')
        .eq('dealership_id', customer.dealership_id)
        .eq('customer_id', customer.id)
        .single();

      if (!conv) {
        const { data: newConv } = await supabase
          .from('conversations')
          .insert({
            dealership_id: customer.dealership_id,
            customer_id: customer.id,
            status: 'open',
            last_message_at: new Date().toISOString(),
            last_message_preview: Body?.substring(0, 80),
          })
          .select()
          .single();
        conv = newConv;
      } else {
        await supabase
          .from('conversations')
          .update({
            last_message_at: new Date().toISOString(),
            last_message_preview: Body?.substring(0, 80),
          })
          .eq('id', conv.id);
      }

      if (conv) {
        // Idempotent insert into messages
        await supabase.from('messages').insert({
          dealership_id: customer.dealership_id,
          conversation_id: conv.id,
          customer_id: customer.id,
          channel: 'sms',
          direction: 'inbound',
          from_number: From,
          to_number: To,
          content: Body || '',
          status: 'received',
          provider: 'twilio',
          provider_message_id: MessageSid,
          sent_at: new Date().toISOString(),
        });
      }
    }

    res.type('text/xml').send('<Response></Response>');
  } catch (err) {
    next(err);
  }
}

export async function handleTwilioStatusWebhook(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { MessageSid, MessageStatus } = req.body;

    if (MessageSid && MessageStatus) {
      await supabase
        .from('messages')
        .update({ status: MessageStatus, updated_at: new Date().toISOString() })
        .eq('provider_message_id', MessageSid);
    }

    res.status(200).send('OK');
  } catch (err) {
    next(err);
  }
}

export async function handleInboundEmailWebhook(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    res.status(200).json({ success: true, message: 'Inbound email processed' });
  } catch (err) {
    next(err);
  }
}
