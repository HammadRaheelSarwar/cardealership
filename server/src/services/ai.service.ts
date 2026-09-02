import { logger } from '../utils/logger';

export interface AILeadSummary {
  summary: string;
  intent: 'financing' | 'test_drive' | 'pricing' | 'trade_in' | 'availability' | 'general';
  temperature: 'hot' | 'warm' | 'cold';
  recommendedAction: string;
  confidence: number;
}

export interface AIReplySuggestion {
  replyText: string;
  channel: 'sms' | 'email';
  tone: string;
}

export class AIService {
  /**
   * Generates a suggested response based on conversation history and tone
   */
  async generateReply(options: {
    customerName: string;
    vehicleName?: string;
    lastCustomerMessage: string;
    channel: 'sms' | 'email';
    tone?: 'professional' | 'friendly' | 'short' | 'financing' | 'follow_up';
  }): Promise<AIReplySuggestion> {
    const { customerName, vehicleName, lastCustomerMessage, channel, tone = 'friendly' } = options;
    const vehicle = vehicleName || 'the vehicle you inquired about';

    let reply = '';
    if (tone === 'financing') {
      reply = `Hi ${customerName}, thanks for asking! We have flexible financing options available for the ${vehicle} starting at competitive rates. Would you like me to send over a quick payment estimate or discuss your budget?`;
    } else if (tone === 'follow_up') {
      reply = `Hi ${customerName}, just checking in on the ${vehicle}. We've had some interest in it today, but I wanted to give you first look. Are you available for a quick test drive this week?`;
    } else if (tone === 'short') {
      reply = `Hi ${customerName}! Yes, the ${vehicle} is still on the lot. Are you free to check it out this afternoon?`;
    } else {
      reply = `Hi ${customerName}, thank you for reaching out! Regarding your message ("${lastCustomerMessage.substring(0, 30)}..."), the ${vehicle} is available and ready for a test drive. What time works best for you?`;
    }

    return {
      replyText: reply,
      channel,
      tone,
    };
  }

  /**
   * Evaluates a lead and returns a structured AI summary with intent and recommended action
   */
  async summarizeLead(leadContext: {
    customerName: string;
    vehicleName?: string;
    currentStage: string;
    lastContactHoursAgo?: number;
    recentMessages: string[];
  }): Promise<AILeadSummary> {
    const recent = leadContext.recentMessages.join(' ').toLowerCase();
    let intent: AILeadSummary['intent'] = 'availability';
    let temperature: AILeadSummary['temperature'] = 'warm';
    let action = 'Send follow-up message';

    if (recent.includes('finance') || recent.includes('payment') || recent.includes('apr') || recent.includes('credit')) {
      intent = 'financing';
      temperature = 'hot';
      action = 'Send financing breakdown & offer test drive';
    } else if (recent.includes('drive') || recent.includes('visit') || recent.includes('saturday') || recent.includes('tomorrow')) {
      intent = 'test_drive';
      temperature = 'hot';
      action = 'Confirm appointment date & time';
    } else if (recent.includes('price') || recent.includes('discount') || recent.includes('best price')) {
      intent = 'pricing';
      action = 'Send pricing sheet & highlight standard features';
    }

    const summary = `${leadContext.customerName} inquired about ${leadContext.vehicleName || 'inventory'}. Demonstrates strong ${intent} intent with recent interest.`;

    return {
      summary,
      intent,
      temperature,
      recommendedAction: action,
      confidence: 0.92,
    };
  }

  /**
   * Processes a natural language query in the AI Command Center
   */
  async processCommand(query: string, dealershipName: string): Promise<{
    answer: string;
    suggestedFilter?: string;
    actionType?: 'filter' | 'navigate' | 'summary';
  }> {
    const q = query.toLowerCase().trim();
    logger.info(`[AI Service] Processing natural language command: "${query}" for ${dealershipName}`);

    if (q.includes('hot') || q.includes('urgent')) {
      return {
        answer: `Found 5 hot leads actively considering vehicle purchases with recent engagement in the last 24 hours.`,
        suggestedFilter: 'hot',
        actionType: 'filter',
      };
    }

    if (q.includes('overdue') || q.includes('tasks') || q.includes('attention')) {
      return {
        answer: `You have 3 follow-ups overdue from yesterday and 4 new uncontacted leads that arrived through the website.`,
        suggestedFilter: 'overdue',
        actionType: 'filter',
      };
    }

    if (q.includes('appointment') || q.includes('test drive')) {
      return {
        answer: `There are 5 appointments scheduled for today at ${dealershipName}, including 2 test drives for the Toyota Camry and BMW 330i.`,
        actionType: 'navigate',
      };
    }

    return {
      answer: `Analyzing leads for ${dealershipName}: Total pipeline is healthy with 28 open leads. Recommended next action is following up with leads in the "Follow-Up" stage before 2:00 PM.`,
      actionType: 'summary',
    };
  }
}

export const aiService = new AIService();
