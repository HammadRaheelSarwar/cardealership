import { supabase } from '../config/supabase';
import { logger } from '../utils/logger';

export interface SendEmailOptions {
  dealershipId: string;
  customerId: string;
  leadId?: string;
  senderUserId?: string;
  toEmail: string;
  fromEmail?: string;
  subject: string;
  body: string;
  attachments?: Array<{ name: string; url: string; mimeType: string }>;
}

export class EmailService {
  async sendEmail(options: SendEmailOptions) {
    const { dealershipId, customerId, leadId, senderUserId, toEmail, subject, body, attachments } = options;

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('dealership_id', dealershipId)
      .single();

    if (!customer) throw new Error('Customer not found for this dealership');
    if (customer.do_not_contact) throw new Error('Customer has opted out (Do Not Contact). Email blocked.');
    if (customer.email_consent === false) throw new Error('Customer has not provided email consent. Email blocked.');

    const fromEmail = options.fromEmail || 'sales@premierautogroup.com';
    const providerId = `EM_SIM_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    logger.info(`[Email Service] Simulated Email sent from ${fromEmail} to ${toEmail}: "${subject}" [ID: ${providerId}]`);

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
          last_message_preview: subject,
        })
        .select()
        .single();
      conv = newConv;
    } else {
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: subject,
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
        channel: 'email',
        direction: 'outbound',
        from_address: fromEmail,
        to_addresses: [toEmail],
        subject,
        content: body,
        attachments: attachments || [],
        status: 'sent',
        provider: 'resend',
        provider_message_id: providerId,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    return message;
  }
}

export const emailService = new EmailService();
