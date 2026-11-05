import React, { useState } from 'react'
import {
  Bot,
  Plus,
  Zap,
  Globe,
  SlidersHorizontal,
  Trash2,
  CheckCircle2,
  Clock,
  Building2,
  FolderTree,
  ArrowRight,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Filter,
  Check,
  Tag
} from 'lucide-react'
import { WhatsAppInstance } from '../api'

export interface AutomationRule {
  id: string
  tenantId: string
  name: string
  instanceTarget: string // 'all' or instance name
  matchType: 'EXACT' | 'CONTAINS' | 'STARTS_WITH'
  keyword: string
  reply: string
  webhookUrl?: string
  enabled: boolean
  triggerCount: number
  lastTriggered?: string
}

interface RuleAutomationsProps {
  instances: WhatsAppInstance[]
}

export const RuleAutomations: React.FC<RuleAutomationsProps> = ({ instances }) => {
  // Multi-Tenant Workspaces
  const tenants = [
    { id: 'tenant-nbfc', name: 'Nakshatra NBFC & Lending', code: 'FINTECH-01' },
    { id: 'tenant-recovery', name: 'Collections & Recovery', code: 'FINTECH-02' },
    { id: 'tenant-support', name: 'General Customer Care', code: 'SUPPORT-01' }
  ]

  const [activeTenantId, setActiveTenantId] = useState('tenant-nbfc')
  const [searchTerm, setSearchTerm] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  // Rules Store
  const [rules, setRules] = useState<AutomationRule[]>([
    {
      id: 'rule-1',
      tenantId: 'tenant-nbfc',
      name: 'Instant Loan Balance Inquiry',
      instanceTarget: 'all',
      matchType: 'EXACT',
      keyword: 'BALANCE',
      reply: 'Hello! Your loan account balance is currently ₹14,500. Due date is 10th Nov 2026. Reply "PAY" to receive instant payment link.',
      webhookUrl: 'https://nakshtraventures.in/api/inquiries/balance',
      enabled: true,
      triggerCount: 42,
      lastTriggered: '10 mins ago'
    },
    {
      id: 'rule-2',
      tenantId: 'tenant-nbfc',
      name: 'Pay Bill Link Dispatcher',
      instanceTarget: 'all',
      matchType: 'EXACT',
      keyword: 'PAY',
      reply: 'Click the secure link to pay your installment via UPI/Netbanking: https://nakshtraventures.in/pay?src=whatsapp. Instant receipt will be generated.',
      webhookUrl: 'https://nakshtraventures.in/api/payments/intent',
      enabled: true,
      triggerCount: 89,
      lastTriggered: '2 mins ago'
    },
    {
      id: 'rule-3',
      tenantId: 'tenant-recovery',
      name: 'Promise to Pay Settlement',
      instanceTarget: 'all',
      matchType: 'CONTAINS',
      keyword: 'SETTLE',
      reply: 'Thank you for reaching out. A settlements officer from Nakshatra Recovery team has noted your request and will call you with restructuring terms.',
      enabled: true,
      triggerCount: 15,
      lastTriggered: '1 hour ago'
    },
    {
      id: 'rule-4',
      tenantId: 'tenant-support',
      name: 'Human Agent Handoff',
      instanceTarget: 'all',
      matchType: 'CONTAINS',
      keyword: 'AGENT',
      reply: 'Connecting you to a human representative... Expected wait time is under 3 minutes.',
      webhookUrl: 'https://nakshtraventures.in/api/tickets/create',
      enabled: true,
      triggerCount: 31,
      lastTriggered: 'Yesterday'
    }
  ])

  // New Rule Form State
  const [newRuleName, setNewRuleName] = useState('')
  const [newKeyword, setNewKeyword] = useState('')
  const [newMatchType, setNewMatchType] = useState<'EXACT' | 'CONTAINS' | 'STARTS_WITH'>('EXACT')
  const [newInstanceTarget, setNewInstanceTarget] = useState('all')
  const [newReply, setNewReply] = useState('')
  const [newWebhook, setNewWebhook] = useState('')

  const activeTenant = tenants.find((t) => t.id === activeTenantId) || tenants[0]
  const tenantRules = rules.filter((r) => r.tenantId === activeTenantId)
  const filteredRules = tenantRules.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.keyword.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = tenantRules.filter((r) => r.enabled).length
  const totalExecutions = tenantRules.reduce((acc, curr) => acc + curr.triggerCount, 0)

  const handleToggleRule = (id: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r))
    )
  }

  const handleDeleteRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id))
  }

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newRuleName.trim() || !newKeyword.trim() || !newReply.trim()) return

    const newRule: AutomationRule = {
      id: `rule-${Date.now()}`,
      tenantId: activeTenantId,
      name: newRuleName.trim(),
      instanceTarget: newInstanceTarget,
      matchType: newMatchType,
      keyword: newKeyword.trim().toUpperCase(),
      reply: newReply.trim(),
      webhookUrl: newWebhook.trim() || undefined,
      enabled: true,
      triggerCount: 0,
      lastTriggered: 'Just created'
    }

    setRules([newRule, ...rules])
    setShowCreateModal(false)
    setNewRuleName('')
    setNewKeyword('')
    setNewReply('')
    setNewWebhook('')
  }

  return (
    <div className="space-y-6">
      {/* Top Multi-Tenant Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Multi-Tenant Automation Workspaces
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                {activeTenant.code}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Isolated business rule sets per department, service, or client portfolio.
            </p>
          </div>
        </div>

        {/* Workspace Pill Selector */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl overflow-x-auto">
          {tenants.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTenantId(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTenantId === t.id
                  ? 'bg-white text-emerald-700 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Configured Rules</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{tenantRules.length}</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <Bot className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase">Active Triggers</p>
            <h4 className="text-2xl font-bold text-emerald-600 mt-1">{activeCount}</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Total Auto-Replies Dispatched</p>
            <h4 className="text-2xl font-bold text-slate-900 mt-1">{totalExecutions}</h4>
          </div>
          <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Action Header & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search rules by name or keyword..."
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-3.5 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Automation Rule
        </button>
      </div>

      {/* Rule Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRules.map((rule) => (
          <div
            key={rule.id}
            className={`bg-white rounded-2xl p-5 border transition-all ${
              rule.enabled
                ? 'border-slate-200/90 shadow-sm hover:border-emerald-300'
                : 'border-slate-200/60 opacity-60 bg-slate-50/50'
            }`}
          >
            {/* Rule Header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Scope: {rule.instanceTarget === 'all' ? 'All WhatsApp Lines' : rule.instanceTarget}
                </span>
                <h3 className="text-sm font-bold text-slate-900">{rule.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleRule(rule.id)}
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors flex items-center gap-1 ${
                    rule.enabled
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      rule.enabled ? 'bg-emerald-500' : 'bg-slate-400'
                    }`}
                  />
                  {rule.enabled ? 'Active' : 'Disabled'}
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Keyword Trigger pill */}
            <div className="mb-3 flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">When message:</span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                {rule.matchType}
              </span>
              <code className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-bold font-mono border border-emerald-200">
                "{rule.keyword}"
              </code>
            </div>

            {/* Reply Content Box */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-3 text-xs text-slate-700 leading-relaxed">
              <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                Automated Response
              </span>
              <p className="line-clamp-3">{rule.reply}</p>
            </div>

            {/* Webhook Relay Indicator (if configured) */}
            {rule.webhookUrl && (
              <div className="mb-3 px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200/80 text-[11px] text-teal-800 flex items-center gap-1.5 truncate">
                <Globe className="w-3.5 h-3.5 shrink-0 text-teal-600" />
                <span className="font-semibold">Webhook Relay:</span>
                <span className="truncate font-mono">{rule.webhookUrl}</span>
              </div>
            )}

            {/* Footer metrics */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1 font-mono">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                {rule.triggerCount} Executions
              </span>
              <span>Last: {rule.lastTriggered || 'Never'}</span>
            </div>
          </div>
        ))}
      </div>

      {filteredRules.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <Bot className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No Automation Rules Found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Create your first rule for {activeTenant.name} to automate incoming WhatsApp chats.
          </p>
        </div>
      )}

      {/* CREATE RULE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  New Rule for {activeTenant.name}
                </h3>
                <p className="text-xs text-slate-400">
                  Set keyword match trigger and immediate automated response.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rule Name / Identifier
                </label>
                <input
                  type="text"
                  value={newRuleName}
                  onChange={(e) => setNewRuleName(e.target.value)}
                  required
                  placeholder="e.g. Loan KYC Assistance"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Match Type</label>
                  <select
                    value={newMatchType}
                    onChange={(e: any) => setNewMatchType(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                  >
                    <option value="EXACT">Exact Match</option>
                    <option value="CONTAINS">Contains Keyword</option>
                    <option value="STARTS_WITH">Starts With</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Trigger Keyword</label>
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    required
                    placeholder="e.g. LOAN or KYC"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Line / Scope</label>
                <select
                  value={newInstanceTarget}
                  onChange={(e) => setNewInstanceTarget(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800"
                >
                  <option value="all">All Connected WhatsApp Lines</option>
                  {instances.map((inst) => (
                    <option key={inst.id} value={inst.name}>
                      {inst.name} ({inst.connected ? 'Active' : 'Standby'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Automated Reply Content
                </label>
                <textarea
                  rows={4}
                  value={newReply}
                  onChange={(e) => setNewReply(e.target.value)}
                  required
                  placeholder="Type the automated response message..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  External Webhook Relay URL (Optional)
                </label>
                <input
                  type="url"
                  value={newWebhook}
                  onChange={(e) => setNewWebhook(e.target.value)}
                  placeholder="https://nakshtraventures.in/api/webhook"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-slate-800 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                >
                  Save & Enable Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
