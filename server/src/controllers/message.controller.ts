import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { smsService } from '../services/sms.service';
import { emailService } from '../services/email.service';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';

export async function getConversations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*, customer:customers(*), lead:leads(*)')
      .eq('dealership_id', req.tenant.dealershipId)
      .order('last_message_at', { ascending: false });

    if (error) throw new AppError(error.message, 500);

    sendSuccess(res, { data: conversations || [] });
  } catch (err) {
    next(err);
  }
}

export async function getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { conversationId } = req.params;
    const { data: messages, error } = await supabase
      .from('messages')
      .select('*, sender:profiles(*)')
      .eq('conversation_id', conversationId)
      .eq('dealership_id', req.tenant.dealershipId)
      .order('created_at', { ascending: true });

    if (error) throw new AppError(error.message, 500);

    sendSuccess(res, { data: messages || [] });
  } catch (err) {
    next(err);
  }
}

export async function sendSMSMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId, leadId, to, body } = req.body;

    const message = await smsService.sendSMS({
      dealershipId: req.tenant.dealershipId,
      customerId,
      leadId,
      senderUserId: req.user.id,
      to,
      body,
    });

    sendSuccess(res, { statusCode: 201, message: 'SMS sent successfully', data: { message } });
  } catch (err: any) {
    next(new AppError(err.message || 'Failed to send SMS', 400));
  }
}

export async function sendEmailMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { customerId, leadId, toEmail, subject, body, attachments } = req.body;

    const message = await emailService.sendEmail({
      dealershipId: req.tenant.dealershipId,
      customerId,
      leadId,
      senderUserId: req.user.id,
      toEmail,
      subject,
      body,
      attachments,
    });

    sendSuccess(res, { statusCode: 201, message: 'Email sent successfully', data: { message } });
  } catch (err: any) {
    next(new AppError(err.message || 'Failed to send Email', 400));
  }
}
