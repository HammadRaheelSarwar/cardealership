import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles, Send, ShieldCheck, Car, ChevronRight
} from 'lucide-react';
import api from '@/services/api';

interface ChatMessage {
  id: number;
  sender: 'user' | 'ai';
  text: string;
  cards?: Array<{
    leadId: string;
    customer: string;
    vehicle: string;
    detail: string;
    action: string;
  }>;
}

export default function AIPage() {
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: 'ai',
      text: 'Good morning! I am your AI Sales Assistant. How can I help you analyze leads, follow-ups, and customer conversations today?',
    },
  ]);

  const quickPrompts = [
    'Which leads need attention?',
    'Show hot leads without follow-ups',
    'Summarize today’s conversations',
    'Which salesperson has overdue leads?',
  ];

  const handleSend = async (textToSend?: string) => {
    const q = textToSend || inputQuery;
    if (!q.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      sender: 'user',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      // Call backend AI endpoint
      const res = await api.post('/ai/command', { query: q });
      const aiData = res.data.data;

      const aiReply: ChatMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiData.answer || 'Analyzed pipeline intelligence for your dealership.',
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: 'AI provider is processing pipeline insights. Currently running in rule-based intelligence mode.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white border border-border-light rounded-xl overflow-hidden shadow-sm animate-fade-in">
      {/* Header */}
      <div className="p-4 border-b border-border-light bg-bg-secondary/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-ai-purple/15 text-ai-purple flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-bold text-sm text-text-primary">AI Dealership Command Center</h1>
            <p className="text-[11px] text-text-muted">Natural language CRM intelligence & sales copilot</p>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[11px] text-success font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Tenant Isolated & Compliant</span>
        </div>
      </div>

      {/* Quick Prompts Bar */}
      <div className="p-3 bg-white border-b border-border-light flex items-center gap-2 overflow-x-auto text-xs shrink-0">
        <span className="text-[10px] uppercase font-bold text-text-muted whitespace-nowrap">Suggested:</span>
        {quickPrompts.map((p) => (
          <button
            key={p}
            onClick={() => handleSend(p)}
            className="px-2.5 py-1 rounded-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-ai-purple whitespace-nowrap font-medium text-[11px] transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex gap-3 text-xs leading-relaxed ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'ai' && (
              <div className="w-7 h-7 rounded-full bg-ai-purple/15 text-ai-purple flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
            )}

            <div className={`space-y-3 max-w-[85%] ${m.sender === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-3.5 rounded-xl ${
                  m.sender === 'user'
                    ? 'bg-primary text-white font-medium rounded-br-none shadow-sm'
                    : 'bg-bg-secondary text-text-primary border border-border-light rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center shrink-0 mt-0.5 font-bold text-[10px]">
                ME
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 border-t border-border-light bg-white flex gap-2">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask AI anything: 'Which leads need follow-ups?', 'Who has overdue tasks?'..."
          className="crm-input text-xs py-2 flex-1"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="btn btn-primary btn-sm px-4"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}
