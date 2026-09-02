import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Zap, Plus, Trash2, Save, Play, Clock, MessageSquare, Mail, CheckSquare } from 'lucide-react';

interface Step {
  id: string;
  type: 'delay' | 'sms' | 'email' | 'task' | 'stage_change';
  config: Record<string, any>;
}

export default function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [name, setName] = useState('New Web Lead Follow-Up Sequence');
  const [triggerType, setTriggerType] = useState('new_lead');
  const [steps, setSteps] = useState<Step[]>([
    { id: '1', type: 'sms', config: { body: 'Hi {{firstName}}, thanks for inquiring about the {{vehicle}}! Are you available for a quick test drive today?' } },
    { id: '2', type: 'delay', config: { delayMinutes: 60 } },
    { id: '3', type: 'task', config: { title: 'Follow-up call with customer' } },
  ]);

  const addStep = (type: Step['type']) => {
    setSteps((prev) => [
      ...prev,
      { id: String(Date.now()), type, config: type === 'delay' ? { delayMinutes: 30 } : {} },
    ]);
  };

  const removeStep = (stepId: string) => {
    setSteps((prev) => prev.filter((s) => s.id !== stepId));
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/automation" className="p-2 rounded-lg border border-border-light hover:bg-bg-secondary text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="page-title text-2xl font-bold">Automation Workflow Builder</h1>
            <p className="page-subtitle text-xs">Configure triggers, delay timers, conditions, and actions</p>
          </div>
        </div>

        <button onClick={() => alert('Automation workflow saved')} className="btn btn-primary text-xs gap-1.5">
          <Save className="w-4 h-4" />
          <span>Save Workflow</span>
        </button>
      </div>

      {/* Builder Cards */}
      <div className="space-y-6">
        {/* Trigger Card */}
        <div className="crm-card p-5 space-y-3 border-l-4 border-l-primary">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm text-text-primary">1. Workflow Trigger</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-1">
            <div>
              <label className="crm-label">Event Trigger</label>
              <select
                value={triggerType}
                onChange={(e) => setTriggerType(e.target.value)}
                className="crm-input mt-1"
              >
                <option value="new_lead">New Lead Created</option>
                <option value="lead_assigned">Salesperson Assigned</option>
                <option value="stage_changed">Pipeline Stage Changed</option>
                <option value="customer_replied">Customer Inbound Message</option>
                <option value="appointment_created">Appointment Booked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Steps Sequence */}
        <div className="space-y-4">
          <h2 className="font-bold text-sm text-text-primary flex items-center gap-2">
            <Play className="w-4 h-4 text-ai-purple" />
            <span>2. Action Steps Sequence</span>
          </h2>

          {steps.map((st, index) => (
            <div key={st.id} className="crm-card p-4 flex items-center justify-between text-xs border-l-4 border-l-purple-500">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs shrink-0">
                  {index + 1}
                </span>
                <div>
                  <span className="font-bold text-text-primary uppercase text-[11px] block">{st.type}</span>
                  <p className="text-text-secondary text-xs">
                    {st.type === 'sms' && `Send SMS: "${st.config.body || 'Outreach text'}"`}
                    {st.type === 'delay' && `Wait ${st.config.delayMinutes || 30} minutes`}
                    {st.type === 'task' && `Create Task: "${st.config.title || 'Follow-up'}"`}
                  </p>
                </div>
              </div>

              <button onClick={() => removeStep(st.id)} className="p-1.5 text-text-muted hover:text-error rounded">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Step Buttons */}
          <div className="p-4 bg-bg-secondary border border-dashed border-border-light rounded-xl flex flex-wrap gap-2 text-xs">
            <span className="text-text-muted font-medium py-1">Add Step:</span>
            <button onClick={() => addStep('sms')} className="btn btn-secondary btn-sm gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-primary" /> Send SMS
            </button>
            <button onClick={() => addStep('delay')} className="btn btn-secondary btn-sm gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Add Delay
            </button>
            <button onClick={() => addStep('task')} className="btn btn-secondary btn-sm gap-1">
              <CheckSquare className="w-3.5 h-3.5 text-green-600" /> Create Task
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
