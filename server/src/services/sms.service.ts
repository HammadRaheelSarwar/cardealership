import twilio from 'twilio';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

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
    const { dealershipId, customerId, leadId, senderUserId, to, body } =
      options;

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('dealership_id', dealershipId)
      .single();

    if (!customer) throw new Error('Customer not found for this dealership');
    if (customer.do_not_contact)
      throw new Error(
        'TCPA Safety: Customer has opted out (Do Not Contact). SMS blocked.'
      );
    if (customer.sms_consent === false)
      throw new Error(
        'TCPA Safety: Customer has not provided SMS consent. SMS blocked.'
      );

    if (
      !env.TWILIO_ACCOUNT_SID ||
      !env.TWILIO_AUTH_TOKEN ||
      !env.TWILIO_PHONE_NUMBER
    ) {
      throw new Error(
        'SMS provider is not configured. Configure Twilio before sending messages.'
      );
    }
    const from = env.TWILIO_PHONE_NUMBER;

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
        status: 'queued',
        provider: 'twilio',

        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    try {
      const sent = await twilio(
        env.TWILIO_ACCOUNT_SID,
        env.TWILIO_AUTH_TOKEN
      ).messages.create({ from, to, body });
      const status =
        sent.status === 'delivered'
          ? 'delivered'
          : sent.status === 'sent'
            ? 'sent'
            : ['failed', 'undelivered'].includes(sent.status)
              ? 'failed'
              : 'queued';
      const result = await supabase
        .from('messages')
        .update({ provider_message_id: sent.sid, status })
        .eq('id', message.id)
        .eq('dealership_id', dealershipId)
        .select()
        .single();
      if (result.error)
        throw new Error(
          'Message submitted to provider, but delivery status could not be saved. Check the message before retrying.'
        );
      return result.data;
    } catch (error) {
      await supabase
        .from('messages')
        .update({ status: 'failed' })
        .eq('id', message.id)
        .eq('dealership_id', dealershipId);
      throw error;
    }
  }
}

export const smsService = new SMSService();
