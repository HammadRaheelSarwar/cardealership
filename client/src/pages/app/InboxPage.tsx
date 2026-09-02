import { useState } from 'react';
import {
  Search, MessageSquare, Mail, Send, Sparkles, Phone,
  User, Car, CheckCircle2, Copy
} from 'lucide-react';

interface ConversationItem {
  id: string;
  customerName: string;
  vehicle: string;
  lastMessage: string;
  time: string;
  unread: number;
  assignedTo: string;
  channel: 'sms' | 'email';
}

export default function InboxPage() {
  const [filter, setFilter] = useState<'all' | 'mine' | 'unread'>('all');
  const [activeConversationId, setActiveConversationId] = useState('1');
  const [replyText, setReplyText] = useState('');
  const [composerMode, setComposerMode] = useState<'sms' | 'email'>('sms');

  const conversations: ConversationItem[] = [
    {
      id: '1',
      customerName: 'John Carter',
      vehicle: '2024 Mercedes S 580',
      lastMessage: 'Is this vehicle still available? Also do you have flexible financing options for this model?',
      time: '10:15 AM',
      unread: 1,
      assignedTo: 'Shane Miller',
      channel: 'sms',
    },
    {
      id: '2',
      customerName: 'Sarah Jenkins',
      vehicle: '2024 Range Rover Velar',
      lastMessage: 'Sounds great! I will see you Saturday at 2:00 PM for the test drive.',
      time: '9:42 AM',
      unread: 0,
      assignedTo: 'Alex Vance',
      channel: 'sms',
    },
    {
      id: '3',
      customerName: 'David Wilson',
      vehicle: '2024 Toyota Camry XSE',
      lastMessage: 'Can you send over the window sticker and trade appraisal breakdown?',
      time: 'Yesterday',
      unread: 0,
      assignedTo: 'Michael Brown',
      channel: 'email',
    },
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'sales',
      channel: 'sms',
      content: 'Hi John, thanks for your inquiry on the 2024 Mercedes-Benz S-Class! I am Shane from Premier Auto Group. Are you looking to finance or lease?',
      time: '10:12 AM',
    },
    {
      id: 2,
      sender: 'customer',
      channel: 'sms',
      content: 'Is this vehicle still available? Also do you have flexible financing options for this model for 60 months?',
      time: '10:15 AM',
    },
  ]);

  const activeConv = conversations.find((c) => c.id === activeConversationId) || conversations[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: 'sales',
        channel: composerMode,
        content: replyText,
        time: 'Just now',
      },
    ]);
    setReplyText('');
  };

  const handleAiSuggest = () => {
    setReplyText(
      'Hi John! Yes, the 2024 S-Class is on the showroom floor. Promotional financing is currently 4.9% APR for 60 months. Can I reserve your keys for a test drive at 2 PM?'
    );
  };

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col text-white -m-4 sm:-m-6">
      {/* ── 3-Column Communications Workspace ── */}
      <div className="flex-1 flex overflow-hidden border-t border-[rgba(255,255,255,0.06)]">
        
        {/* ── COLUMN 1: Conversation List (280px) ── */}
        <div className="w-80 border-r border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] flex flex-col shrink-0">
          
          {/* Header & Filter */}
          <div className="p-3 border-b border-[rgba(255,255,255,0.06)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-white uppercase tracking-wider">Inbox</span>
              <div className="flex items-center gap-1">
                {(['all', 'mine', 'unread'] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium capitalize transition-colors ${
                      filter === f ? 'bg-white/10 text-white' : 'text-[#6E6E6E] hover:text-white'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555555]" />
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full bg-[#111111] border border-white/5 rounded pl-8 pr-3 py-1 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* Flat Conversation Rows */}
          <div className="flex-1 overflow-y-auto divide-y divide-[rgba(255,255,255,0.03)]">
            {conversations.map((c) => {
              const isActive = c.id === activeConversationId;
              return (
                <div
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`p-3 text-xs cursor-pointer transition-colors ${
                    isActive
                      ? 'bg-[#141414] border-l-2 border-[#D4AF37]'
                      : 'hover:bg-white/[0.02] border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-baseline justify-between mb-0.5">
                    <span className="font-semibold text-white truncate max-w-[170px]">
                      {c.customerName}
                    </span>
                    <span className="text-[10px] text-[#6E6E6E] font-mono">{c.time}</span>
                  </div>

                  <p className="text-[11px] text-[#8C8C8C] truncate mb-1">
                    {c.vehicle}
                  </p>

                  <p className="text-xs text-[#555555] line-clamp-1">
                    {c.lastMessage}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── COLUMN 2: Message Stream & Composer (Flex 1) ── */}
        <div className="flex-1 flex flex-col bg-[#070707] overflow-hidden">
          
          {/* Thread Header */}
          <div className="h-12 border-b border-[rgba(255,255,255,0.06)] px-5 flex items-center justify-between shrink-0 bg-[#090909]">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-white">
                {activeConv.customerName}
              </span>
              <span className="text-white/20">•</span>
              <span className="text-xs text-[#8C8C8C]">
                {activeConv.vehicle}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6E6E6E]">
                Assigned: <strong className="text-white">{activeConv.assignedTo}</strong>
              </span>
            </div>
          </div>

          {/* Messages Flow (Grouped bubbles, Intercom/Slack feel) */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div className="text-center">
              <span className="text-[10px] font-mono text-[#555555] bg-white/[0.03] px-2 py-0.5 rounded">
                Today, 10:12 AM
              </span>
            </div>

            {messages.map((m) => {
              const isOutbound = m.sender === 'sales';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isOutbound ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-lg rounded-md px-3.5 py-2.5 text-xs leading-relaxed ${
                      isOutbound
                        ? 'bg-[#161616] text-[#E0E0E0] border border-white/[0.06]'
                        : 'bg-[#111111] text-white border border-white/10'
                    }`}
                  >
                    {m.content}
                  </div>
                  <span className="text-[10px] text-[#555555] font-mono mt-1 px-1">
                    {m.time} {isOutbound ? '• Delivered' : ''}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Composer Footer */}
          <div className="p-3 border-t border-[rgba(255,255,255,0.06)] bg-[#090909] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <button
                  onClick={() => setComposerMode('sms')}
                  className={`font-semibold transition-colors ${
                    composerMode === 'sms' ? 'text-[#D4AF37]' : 'text-[#6E6E6E] hover:text-white'
                  }`}
                >
                  SMS
                </button>
                <button
                  onClick={() => setComposerMode('email')}
                  className={`font-semibold transition-colors ${
                    composerMode === 'email' ? 'text-[#D4AF37]' : 'text-[#6E6E6E] hover:text-white'
                  }`}
                >
                  Email
                </button>
              </div>

              {/* AI Suggestion button */}
              <button
                onClick={handleAiSuggest}
                className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Suggest 60mo financing reply</span>
              </button>
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Type ${composerMode.toUpperCase()} message to ${activeConv.customerName}...`}
                className="flex-1 bg-[#111111] border border-white/10 rounded px-3 py-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
              />
              <button type="submit" className="btn-primary btn-sm px-3 gap-1">
                <Send className="w-3 h-3" />
                <span>Send</span>
              </button>
            </form>
          </div>
        </div>

        {/* ── COLUMN 3: Customer Dossier (260px) ── */}
        <div className="w-64 border-l border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] p-4 flex flex-col space-y-5 shrink-0">
          <div>
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block mb-2">
              Customer Dossier
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="text-sm font-semibold text-white">{activeConv.customerName}</div>
              <div className="text-[#8C8C8C] font-mono">+1 (555) 301-4492</div>
              <div className="text-[#6E6E6E]">Austin, TX</div>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block mb-2">
              Vehicle Interest
            </span>
            <div className="space-y-1 text-xs">
              <div className="font-semibold text-white">{activeConv.vehicle}</div>
              <div className="text-[#E6C85C] font-mono font-semibold">$114,500</div>
              <div className="text-[#6E6E6E] text-[11px]">Stock #P24-101</div>
              <div className="text-[#6E6E6E] text-[11px] font-mono">VIN: WDD2231761...</div>
            </div>
          </div>

          <div className="border-t border-[rgba(255,255,255,0.06)] pt-4">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block mb-2">
              Deal Intelligence
            </span>
            <p className="text-[11px] text-[#A0A0A0] leading-relaxed">
              Customer active. Pre-approved for Tier 1 financing. Recommend setting up Saturday test drive.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
