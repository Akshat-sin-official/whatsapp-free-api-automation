import React, { useState } from 'react'
import {
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Users,
  Copy,
  Paperclip,
  CheckCheck,
  History,
  FileText,
  UserCheck,
  Zap,
  Tag
} from 'lucide-react'
import { WhatsAppInstance, api } from '../api'

interface QuickMessengerProps {
  instances: WhatsAppInstance[]
  selectedToken: string
  onSelectToken: (token: string) => void
}

interface MessageLog {
  id: string
  to: string
  message: string
  instanceName: string
  timestamp: string
  status: 'sent' | 'delivered' | 'failed'
}

export const QuickMessenger: React.FC<QuickMessengerProps> = ({
  instances,
  selectedToken,
  onSelectToken
}) => {
  const [recipientMode, setRecipientMode] = useState<'single' | 'bulk'>('single')
  const [targetNumber, setTargetNumber] = useState('')
  const [bulkNumbers, setBulkNumbers] = useState('')
  const [messageText, setMessageText] = useState('')
  const [customerName, setCustomerName] = useState('Rahul Sharma')
  const [amount, setAmount] = useState('₹14,500')
  const [dueDate, setDueDate] = useState('10th Nov 2026')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null)

  // Dispatch history
  const [logs, setLogs] = useState<MessageLog[]>([
    {
      id: 'log-1',
      to: '+91 98765 43210',
      message: 'Hello Rahul! Your loan repayment of ₹14,500 is due on 10th Nov 2026. Please complete payment via link: https://nakshtraventures.in/pay',
      instanceName: 'production-demo',
      timestamp: 'Just now',
      status: 'delivered'
    },
    {
      id: 'log-2',
      to: '+91 91234 56789',
      message: 'Greetings from Nakshatra Ventures! Your KYC documents have been approved.',
      instanceName: 'primary',
      timestamp: '15 mins ago',
      status: 'delivered'
    }
  ])

  // Ready-to-use business templates
  const templates = [
    {
      title: 'Payment Reminder (NBFC)',
      category: 'Fintech',
      text: 'Dear {name}, this is a gentle reminder from Nakshatra Ventures regarding your installment of {amount} due on {due_date}. Please clear your dues at https://nakshtraventures.in/pay'
    },
    {
      title: 'KYC Verification',
      category: 'Compliance',
      text: 'Hello {name}, your KYC verification is pending review. Please submit your identity proof via our secure portal: https://nakshtraventures.in/kyc to avoid account suspension.'
    },
    {
      title: 'Loan Disbursal Approved',
      category: 'Fintech',
      text: 'Congratulations {name}! Your credit limit application for {amount} has been successfully approved and credited to your verified bank account.'
    },
    {
      title: 'Support Acknowledgment',
      category: 'Service',
      text: 'Hello {name}, we received your query. An executive from Nakshatra Ventures has been assigned to your ticket and will call you shortly.'
    }
  ]

  const selectedInstance = instances.find((i) => i.token === selectedToken) || instances[0]

  // Compute preview with replaced dynamic variables
  const computedMessage = messageText
    .replace(/{name}/g, customerName || '{name}')
    .replace(/{amount}/g, amount || '{amount}')
    .replace(/{due_date}/g, dueDate || '{due_date}')

  const handleApplyTemplate = (tmplText: string) => {
    setMessageText(tmplText)
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedToken) {
      setResult({ success: false, msg: 'Please select an active WhatsApp instance.' })
      return
    }

    const recipients = recipientMode === 'single'
      ? [targetNumber.trim()]
      : bulkNumbers
          .split(/[\n,]+/)
          .map((n) => n.trim())
          .filter(Boolean)

    if (recipients.length === 0) {
      setResult({ success: false, msg: 'Please provide at least one valid recipient phone number.' })
      return
    }

    if (!computedMessage.trim()) {
      setResult({ success: false, msg: 'Message text cannot be empty.' })
      return
    }

    setSending(true)
    setResult(null)

    try {
      let sentCount = 0
      for (const rec of recipients) {
        // Clean phone number: digits only
        const cleanNumber = rec.replace(/[^\d]/g, '')
        await api.sendTextMessage(selectedToken, {
          number: cleanNumber,
          text: computedMessage
        })
        sentCount++

        // Add to log
        setLogs((prev) => [
          {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            to: rec,
            message: computedMessage,
            instanceName: selectedInstance?.name || 'Instance',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: 'delivered'
          },
          ...prev
        ])
      }

      setResult({
        success: true,
        msg: `Message successfully dispatched to ${sentCount} recipient${sentCount > 1 ? 's' : ''} via [${selectedInstance?.name || 'default'}].`
      })

      if (recipientMode === 'single') {
        setTargetNumber('')
      }
    } catch (err: any) {
      setResult({
        success: false,
        msg: err.response?.data?.error || err.message || 'Failed to dispatch WhatsApp message.'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Instance Selection Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Send className="w-5 h-5 text-emerald-600" />
            Quick Messenger Hub
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time single and bulk WhatsApp dispatches with live dynamic templates.
          </p>
        </div>

        {/* Sender Instance Selector */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">
            Sender Line:
          </label>
          <div className="relative flex-1 sm:w-64">
            <select
              value={selectedToken}
              onChange={(e) => onSelectToken(e.target.value)}
              className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:border-emerald-500"
            >
              {instances.map((inst) => (
                <option key={inst.id} value={inst.token}>
                  {inst.name} {inst.connected ? '🟢 Connected' : '⚪ Standby'}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid: Form (Left) & Phone Simulator (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Message Composer */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
            
            {/* Recipient Mode Tabs */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Recipient Target
              </span>
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setRecipientMode('single')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    recipientMode === 'single'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Single Number
                </button>
                <button
                  type="button"
                  onClick={() => setRecipientMode('bulk')}
                  className={`px-3 py-1 rounded-lg transition-all ${
                    recipientMode === 'bulk'
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Bulk List (CSV / Multi)
                </button>
              </div>
            </div>

            {/* Recipient Input */}
            {recipientMode === 'single' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Phone Number (with Country Code)
                </label>
                <input
                  type="text"
                  value={targetNumber}
                  onChange={(e) => setTargetNumber(e.target.value)}
                  placeholder="e.g. +91 98765 43210 or 919876543210"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex justify-between">
                  <span>Bulk Numbers (comma or newline separated)</span>
                  <span className="text-slate-400 font-normal">
                    {bulkNumbers.split(/[\n,]+/).filter(Boolean).length} Numbers Detected
                  </span>
                </label>
                <textarea
                  rows={3}
                  value={bulkNumbers}
                  onChange={(e) => setBulkNumbers(e.target.value)}
                  placeholder="919876543210&#10;919123456789&#10;918888888888"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            )}

            {/* Dynamic Variable Values */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Dynamic Variable Tags (Replaced in Preview)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-medium text-slate-600">{"{name}"}</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600">{"{amount}"}</label>
                  <input
                    type="text"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-slate-600">{"{due_date}"}</label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800"
                  />
                </div>
              </div>
            </div>

            {/* Message Text Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">Message Content</label>
                <span className="text-[11px] text-slate-400">
                  {messageText.length} characters
                </span>
              </div>
              <textarea
                rows={5}
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type your WhatsApp message here... You can use {name}, {amount}, {due_date}."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:outline-none focus:border-emerald-500 leading-relaxed"
              />
            </div>

            {/* Feedback alert */}
            {result && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 ${
                  result.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border border-rose-200 text-rose-800'
                }`}
              >
                {result.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                )}
                <span>{result.msg}</span>
              </div>
            )}

            {/* Send Button */}
            <button
              type="button"
              onClick={handleSend}
              disabled={sending || !selectedInstance}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {sending ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>
                    Send Message via {selectedInstance?.name || 'WhatsApp'}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Business Templates Carousel / Grid */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Pre-Configured Enterprise Templates
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {templates.map((tmpl, idx) => (
                <div
                  key={idx}
                  onClick={() => handleApplyTemplate(tmpl.text)}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-400/80 bg-slate-50/50 hover:bg-emerald-50/30 cursor-pointer transition-all group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                      {tmpl.title}
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {tmpl.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Realistic WhatsApp Phone Mockup Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full max-w-[340px] bg-slate-900 rounded-[42px] p-3 shadow-2xl border-4 border-slate-800">
            {/* Phone notch & speaker */}
            <div className="flex justify-center mb-2">
              <div className="w-24 h-4 bg-slate-800 rounded-b-xl flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-700 rounded-full" />
              </div>
            </div>

            {/* WhatsApp App Screen */}
            <div className="bg-[#0b141a] rounded-[32px] overflow-hidden flex flex-col h-[520px] relative border border-slate-800">
              {/* WhatsApp Header */}
              <div className="bg-[#202c33] px-3.5 py-3 flex items-center gap-2.5 border-b border-slate-700/50">
                <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold">
                  {customerName ? customerName[0] : 'N'}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {customerName || 'Customer Recipient'}
                  </h4>
                  <p className="text-[10px] text-emerald-400">online</p>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  {selectedInstance?.name || 'WA'}
                </div>
              </div>

              {/* Chat background pattern and bubbles */}
              <div className="flex-1 p-3.5 flex flex-col justify-end space-y-3 bg-[radial-gradient(#1f2c34_1px,transparent_1px)] [background-size:16px_16px] bg-[#0b141a] overflow-y-auto">
                <div className="flex justify-center">
                  <span className="bg-[#182229] text-[10px] text-slate-400 px-2.5 py-0.5 rounded-md shadow-sm">
                    Today
                  </span>
                </div>

                {/* Sent message bubble */}
                <div className="self-end max-w-[85%] bg-[#005c4b] text-slate-100 p-3 rounded-2xl rounded-tr-none shadow-md text-xs leading-relaxed break-words relative">
                  <p className="whitespace-pre-wrap">
                    {computedMessage || 'Your message preview will appear here in real time...'}
                  </p>
                  <div className="flex items-center justify-end gap-1 mt-1.5 text-[9px] text-slate-300">
                    <span>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <CheckCheck className="w-3.5 h-3.5 text-[#53bdeb]" />
                  </div>
                </div>
              </div>

              {/* WhatsApp bottom input mockup */}
              <div className="bg-[#202c33] p-2 flex items-center gap-2 border-t border-slate-800">
                <div className="flex-1 bg-[#2a3942] rounded-full px-3 py-1.5 text-[11px] text-slate-400 truncate">
                  Message
                </div>
                <div className="w-7 h-7 rounded-full bg-emerald-600 flex items-center justify-center text-white">
                  <Send className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium">
            Live Preview on WhatsApp Web/Mobile
          </p>
        </div>
      </div>

      {/* BOTTOM SECTION: Real-Time Dispatch Log Table */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            Recent Dispatch Logs
          </h3>
          <span className="text-xs text-slate-500">
            {logs.length} Messages Dispatched
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3 pl-2">Recipient</th>
                <th className="pb-3">Sender Instance</th>
                <th className="pb-3">Message Content</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 pl-2 font-mono font-medium text-slate-900">
                    {log.to}
                  </td>
                  <td className="py-3 text-slate-600 font-medium">
                    {log.instanceName}
                  </td>
                  <td className="py-3 text-slate-700 max-w-xs truncate">
                    {log.message}
                  </td>
                  <td className="py-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCheck className="w-3 h-3" />
                      Delivered
                    </span>
                  </td>
                  <td className="py-3 pr-2 text-right text-slate-400 font-mono text-[11px]">
                    {log.timestamp}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

