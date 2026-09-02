import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface SendSMSOptions {
  dealershipId: string;
  customerId: string;
  leadId?: string;
  senderUserId?: string;
  to: string;
  from?: string;
  body: string;
}

export class SMSService {
  async sendSMS(options: SendSMSOptions) {
    const { dealershipId, customerId, leadId, senderUserId, to, body } = options;

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('dealership_id', dealershipId)
      .single();

    if (!customer) throw new Error('Customer not found for this dealership');
    if (customer.do_not_contact) throw new Error('TCPA Safety: Customer has opted out (Do Not Contact). SMS blocked.');
    if (customer.sms_consent === false) throw new Error('TCPA Safety: Customer has not provided SMS consent. SMS blocked.');

    const from = options.from || '+15550192834';
    const providerId = `SM_SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info(`[SMS Service] Simulated Twilio SMS sent from ${from} to ${to}: "${body.substring(0, 40)}..." [ID: ${providerId}]`);

    // Ensure conversation exists
    let { data: conv } = await supabase
      .from('conversations')
      .select('id')
      .eq('dealership_id', dealershipId)
      .eq('customer_id', customerId)
      .single();

    if (!conv) {
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          dealership_id: dealershipId,
          customer_id: customerId,
          lead_id: leadId || null,
          status: 'open',
          last_message_at: new Date().toISOString(),
          last_message_preview: body.substring(0, 80),
        })
        .select()
        .single();
      conv = newConv;
    } else {
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: body.substring(0, 80),
        })
        .eq('id', conv.id);
    }

    if (!conv) throw new Error('Failed to create or find conversation');

    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        dealership_id: dealershipId,
        conversation_id: conv.id,
        customer_id: customerId,
        lead_id: leadId || null,
        sender_user_id: senderUserId || null,
        channel: 'sms',
        direction: 'outbound',
        from_number: from,
        to_number: to,
        content: body,
        status: 'delivered',
        provider: 'twilio',
        provider_message_id: providerId,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return message;
  }
}

export const smsService = new SMSService();
