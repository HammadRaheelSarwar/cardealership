import React, { useEffect, useState } from 'react';
import {
  MessageSquare, Mail, Calendar, Globe, Share2,
  Database, CheckCircle2, ArrowRight, ShieldCheck, Zap
} from 'lucide-react';
import api from '@/services/api';
import { PageSkeleton } from '@/components/common/PageSkeleton';

interface IntegrationStatus {
  sms: { provider: string; configured: boolean };
  email: { provider: string; configured: boolean };
  ai: { provider: string; configured: boolean };
  storage: { provider: string; configured: boolean };
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStatus() {
      try {
        setLoading(true);
        const res = await api.get('/integrations/status');
        setStatus(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStatus();
  }, []);

  if (loading) return <PageSkeleton />;

  const integrations = [
    {
      id: 'twilio',
      name: 'Twilio SMS & MMS',
      category: 'Communication',
      description: 'Two-way SMS text messaging with dedicated dealership phone number and real-time delivery webhooks.',
      configured: status?.sms.configured ?? false,
      icon: MessageSquare,
    },
    {
      id: 'email',
      name: 'Automotive Inbound & Outbound Email',
      category: 'Communication',
      description: 'Direct email sync with full RFC threading, attachments, bounce detection, and unsubscribe suppression.',
      configured: status?.email.configured ?? false,
      icon: Mail,
    },
    {
      id: 'ai',
      name: 'OpenAI Sales Assistant',
      category: 'AI Intelligence',
      description: 'Automated suggested responses, conversation summary, and intent recognition.',
      configured: status?.ai.configured ?? false,
      icon: Zap,
    },
    {
      id: 'storage',
      name: 'Supabase Vehicle Media Storage',
      category: 'Storage',
      description: 'High-speed lot inventory photo uploads and CDN delivery.',
      configured: status?.storage.configured ?? true,
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Integration Marketplace</h1>
          <p className="page-subtitle text-xs">
            Connect SMS carriers, email routing, marketing lead sources, and DMS inventory providers.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-success font-semibold bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
          <ShieldCheck className="w-4 h-4" />
          <span>Encrypted Credential Vault</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {integrations.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="crm-card p-5 flex flex-col justify-between space-y-4 hover:border-primary/50 transition"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center border border-border-light text-text-primary">
                    <Icon className="w-5 h-5" />
                  </div>
                  {item.configured ? (
                    <span className="badge-success text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Connected</span>
                    </span>
                  ) : (
                    <span className="badge-neutral text-[10px] font-medium">Not Configured</span>
                  )}
                </div>

                <div>
                  <h3 className="font-bold text-sm text-text-primary">{item.name}</h3>
                  <span className="text-[10px] uppercase font-semibold text-text-muted">
                    {item.category}
                  </span>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
