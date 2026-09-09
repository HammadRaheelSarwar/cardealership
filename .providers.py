from pathlib import Path
p=Path('server/src/services/sms.service.ts');s=p.read_text();s="import twilio from 'twilio';\nimport { env } from '../config/env';\n"+s;a=s.index('    const from =');b=s.index('    // Ensure conversation',a);s=s[:a]+'''    if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_PHONE_NUMBER) {
      throw new Error('SMS provider is not configured. Configure Twilio before sending messages.');
    }
    const from = env.TWILIO_PHONE_NUMBER;

'''+s[b:];s=s.replace("status: 'delivered'","status: 'queued'").replace('provider_message_id: providerId,','');s=s.replace('    return message;', '''    try {
      const sent = await twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN).messages.create({ from, to, body });
      const status = sent.status === 'delivered' ? 'delivered' : sent.status === 'sent' ? 'sent' : ['failed','undelivered'].includes(sent.status) ? 'failed' : 'queued';
      const result = await supabase.from('messages').update({ provider_message_id: sent.sid, status }).eq('id',message.id).eq('dealership_id',dealershipId).select().single();
      if (result.error) throw new Error('Message submitted to provider, but delivery status could not be saved. Check the message before retrying.');
      return result.data;
    } catch(error) {
      await supabase.from('messages').update({status:'failed'}).eq('id',message.id).eq('dealership_id',dealershipId);
      throw error;
    }''');p.write_text(s)
p=Path('server/src/services/email.service.ts');s=p.read_text();s="import { Resend } from 'resend';\nimport { env } from '../config/env';\n"+s;a=s.index('    const fromEmail =');b=s.index('    let { data: conv',a);s=s[:a]+'''    if (!env.RESEND_API_KEY || !env.EMAIL_FROM_ADDRESS) throw new Error('Email provider is not configured. Configure Resend and a verified sender address.');
    const fromEmail = env.EMAIL_FROM_ADDRESS;

'''+s[b:];s=s.replace("status: 'sent'","status: 'queued'").replace('provider_message_id: providerId,','');s=s.replace('    return message;', '''    try {
      const sent = await new Resend(env.RESEND_API_KEY).emails.send({ from: fromEmail, to: [toEmail], subject, text: body,
        ...(attachments?.length ? { attachments: attachments.map(a=>({filename:a.name,path:a.url})) } : {}) });
      if (sent.error || !sent.data) throw new Error(sent.error?.message || 'Email provider rejected the message');
      const result = await supabase.from('messages').update({ provider_message_id: sent.data.id, status:'sent' }).eq('id',message.id).eq('dealership_id',dealershipId).select().single();
      if (result.error) throw new Error('Email submitted to provider, but delivery status could not be saved. Check the message before retrying.');
      return result.data;
    } catch(error) {
      await supabase.from('messages').update({status:'failed'}).eq('id',message.id).eq('dealership_id',dealershipId);
      throw error;
    }''');p.write_text(s)
p=Path('server/src/config/env.ts');s=p.read_text().replace("RESEND_API_KEY: z.string().optional(),","RESEND_API_KEY: z.string().optional(),\n  EMAIL_FROM_ADDRESS: z.string().optional(),");p.write_text(s)
p=Path('server/src/controllers/integration.controller.ts');s=p.read_text().replace('env.RESEND_API_KEY)', 'env.RESEND_API_KEY && env.EMAIL_FROM_ADDRESS)').replace('env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN)', 'env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_PHONE_NUMBER)').replace('Boolean(env.SUPABASE_URL)', "Boolean(env.SUPABASE_URL && !env.SUPABASE_URL.includes('example.supabase'))");p.write_text(s)
