import { Resend } from 'resend';
import { env } from '../config/env';
import { supabase } from '../config/supabase';

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
    const {
      dealershipId,
      customerId,
      leadId,
      senderUserId,
      toEmail,
      subject,
      body,
      attachments,
    } = options;

    const { data: customer } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('dealership_id', dealershipId)
      .single();

    if (!customer) throw new Error('Customer not found for this dealership');
    if (customer.do_not_contact)
      throw new Error(
        'Customer has opted out (Do Not Contact). Email blocked.'
      );
    if (customer.email_consent === false)
      throw new Error(
        'Customer has not provided email consent. Email blocked.'
      );

    if (!env.RESEND_API_KEY || !env.EMAIL_FROM_ADDRESS)
      throw new Error(
        'Email provider is not configured. Configure Resend and a verified sender address.'
      );
    const fromEmail = env.EMAIL_FROM_ADDRESS;

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
        status: 'queued',
        provider: 'resend',

        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw new Error(error.message);
    try {
      const sent = await new Resend(env.RESEND_API_KEY).emails.send({
        from: fromEmail,
        to: [toEmail],
        subject,
        text: body,
        ...(attachments?.length
          ? {
              attachments: attachments.map((a) => ({
                filename: a.name,
                path: a.url,
              })),
            }
          : {}),
      });
      if (sent.error || !sent.data)
        throw new Error(
          sent.error?.message || 'Email provider rejected the message'
        );
      const result = await supabase
        .from('messages')
        .update({ provider_message_id: sent.data.id, status: 'sent' })
        .eq('id', message.id)
        .eq('dealership_id', dealershipId)
        .select()
        .single();
      if (result.error)
        throw new Error(
          'Email submitted to provider, but delivery status could not be saved. Check the message before retrying.'
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

export const emailService = new EmailService();
