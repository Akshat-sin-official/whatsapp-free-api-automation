import React, { useState, useEffect } from 'react'
import {
  Smartphone,
  Plus,
  QrCode,
  RefreshCw,
  Power,
  Trash2,
  Send,
  MessageSquare,
  Bot,
  Users,
  Settings,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  LogOut
} from 'lucide-react'
import { api, WhatsAppInstance, LicenseStatus, getApiKey, setApiKey } from './api'

export default function App() {
  const [activeTab, setActiveTab] = useState<'instances' | 'chat' | 'automations' | 'contacts' | 'settings'>('instances')
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [license, setLicense] = useState<LicenseStatus | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey())

  // Create Instance State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInstanceName, setNewInstanceName] = useState('')
  const [creating, setCreating] = useState(false)

  // QR Modal State
  const [selectedInstanceForQr, setSelectedInstanceForQr] = useState<WhatsAppInstance | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrConnected, setQrConnected] = useState(false)

  // Send Message State
  const [selectedInstanceToken, setSelectedInstanceToken] = useState<string>('')
  const [targetNumber, setTargetNumber] = useState('')
  const [messageText, setMessageText] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null)

  // Quick Automation rules state
  const [automations, setAutomations] = useState([
    { id: '1', keyword: 'PRICE', reply: 'Hello! Our pricing starts at $29/mo. Let us know if you want a custom quote.', enabled: true },
    { id: '2', keyword: 'SUPPORT', reply: 'Hi there! An agent will respond within 15 minutes. Please describe your issue.', enabled: true }
  ])
  const [newKeyword, setNewKeyword] = useState('')
  const [newReply, setNewReply] = useState('')

  // Contacts state
  const [contacts, setContacts] = useState([
    { id: '1', name: 'John Doe', phone: '+1234567890', tag: 'VIP Client', optIn: true },
    { id: '2', name: 'Acme Corp Sales', phone: '+1987654321', tag: 'Prospect', optIn: true }
  ])
  const [newContactName, setNewContactName] = useState('')
  const [newContactPhone, setNewContactPhone] = useState('')

  const fetchStatusAndInstances = async () => {
    try {
      setLoading(true)
      const lic = await api.getLicenseStatus()
      setLicense(lic)
      const insts = await api.getAllInstances()
      setInstances(insts)
      if (insts.length > 0 && !selectedInstanceToken) {
        setSelectedInstanceToken(insts[0].token)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatusAndInstances()
    const timer = setInterval(fetchStatusAndInstances, 10000)
    return () => clearInterval(timer)
  }, [])

  // QR polling
  useEffect(() => {
    if (!selectedInstanceForQr) return

    let isSubscribed = true
    const pollQrAndStatus = async () => {
      try {
        const qrRes = await api.getInstanceQr(selectedInstanceForQr.token)
        if (isSubscribed && qrRes.qrcode) {
          setQrCodeData(qrRes.qrcode)
        }
        const statusRes = await api.getInstanceStatus(selectedInstanceForQr.token)
        if (isSubscribed && statusRes.connected) {
          setQrConnected(true)
          fetchStatusAndInstances()
        }
      } catch (e) {
        console.error(e)
      }
    }

    pollQrAndStatus()
    const interval = setInterval(pollQrAndStatus, 3000)
    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [selectedInstanceForQr])

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInstanceName.trim()) return
    try {
      setCreating(true)
      const created = await api.createInstance(newInstanceName.trim())
      setShowCreateModal(false)
      setNewInstanceName('')
      await fetchStatusAndInstances()
      // Open QR immediately
      setSelectedInstanceForQr(created)
      setQrConnected(false)
      setQrCodeData(created.qrcode || '')
    } catch (err: any) {
      alert('Failed to create instance: ' + (err.response?.data?.message || err.message))
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteInstance = async (id: string) => {
    if (!confirm('Are you sure you want to delete this instance?')) return
    try {
      await api.deleteInstance(id)
      fetchStatusAndInstances()
    } catch (e: any) {
      alert('Delete failed: ' + e.message)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedInstanceToken || !targetNumber || !messageText) return
    try {
      setSendingMessage(true)
      setSendResult(null)
      await api.sendTextMessage(selectedInstanceToken, {
        number: targetNumber.replace(/\D/g, ''),
        text: messageText
      })
      setSendResult({ success: true, msg: 'Message dispatched successfully!' })
      setMessageText('')
    } catch (e: any) {
      setSendResult({ success: false, msg: e.response?.data?.message || e.message })
    } finally {
      setSendingMessage(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">WhatsFlow</h1>
              <p className="text-xs text-emerald-400 font-medium">Automation & CRM</p>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('instances')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'instances'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              Instances
              <span className="ml-auto bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-xs">
                {instances.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'chat'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Send className="w-4 h-4" />
              Messenger
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'automations'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Bot className="w-4 h-4" />
              Automations
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'contacts'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              Contacts
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'settings'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings & API
            </button>
          </nav>
        </div>

        <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            <span>Engine: Evolution Go</span>
          </div>
          <p>© 2026 WhatsFlow Multi-Account</p>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-slate-900 capitalize">{activeTab}</h2>
            {license?.status && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  license.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                License: {license.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {license?.status === 'inactive' && (
              <a
                href={license?.register_url || 'http://localhost:8080/manager/login'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white px-3 py-1.5 rounded-lg font-medium shadow-xs transition"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Activate License
              </a>
            )}

            <button
              onClick={fetchStatusAndInstances}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2 rounded-lg shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              New Instance
            </button>
          </div>
        </header>

        {/* Dynamic Body */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: INSTANCES */}
          {activeTab === 'instances' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Connected Accounts</h3>
                  <p className="text-sm text-slate-500">
                    Manage multi-device WhatsApp accounts and session states.
                  </p>
                </div>
              </div>

              {instances.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h4 className="text-lg font-semibold text-slate-800 mb-1">No WhatsApp Instances Yet</h4>
                  <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
                    Connect your first WhatsApp account to start sending messages, automations, and tracking customer conversations.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create Your First Instance
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {instances.map((inst) => (
                    <div
                      key={inst.id}
                      className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900">{inst.name}</h4>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">
                            {inst.jid ? inst.jid.split('@')[0] : 'Unpaired Device'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            inst.connected
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              inst.connected ? 'bg-emerald-500' : 'bg-amber-400 animate-ping'
                            }`}
                          ></span>
                          {inst.connected ? 'Connected' : 'QR Required'}
                        </span>
                      </div>

                      <div className="text-xs text-slate-400 space-y-1">
                        <div>ID: <span className="font-mono text-slate-600">{inst.id.slice(0, 8)}...</span></div>
                        <div>Created: <span className="text-slate-600">{inst.createdAt ? new Date(inst.createdAt).toLocaleDateString() : 'Active'}</span></div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {!inst.connected ? (
                          <button
                            onClick={() => {
                              setSelectedInstanceForQr(inst)
                              setQrConnected(false)
                              setQrCodeData(inst.qrcode || '')
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold py-2 px-3 rounded-lg transition"
                          >
                            <QrCode className="w-4 h-4" />
                            Scan QR
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInstanceToken(inst.token)
                              setActiveTab('chat')
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-2 px-3 rounded-lg transition shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send Message
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteInstance(inst.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Delete Instance"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MESSENGER */}
          {activeTab === 'chat' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Quick Messenger</h3>
                <p className="text-sm text-slate-500">
                  Send high-priority WhatsApp messages directly through connected accounts.
                </p>
              </div>

              <form onSubmit={handleSendMessage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Sender Account
                  </label>
                  <select
                    value={selectedInstanceToken}
                    onChange={(e) => setSelectedInstanceToken(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {instances.map((i) => (
                      <option key={i.id} value={i.token}>
                        {i.name} ({i.connected ? 'Connected' : 'Disconnected'})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Recipient WhatsApp Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 15551234567 (with country code)"
                    value={targetNumber}
                    onChange={(e) => setTargetNumber(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Include country code without + or spaces.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Message Body
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Type your message here..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {sendResult && (
                  <div
                    className={`p-3 rounded-lg text-sm flex items-center gap-2 ${
                      sendResult.success
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {sendResult.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0" />
                    )}
                    <span>{sendResult.msg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={sendingMessage || instances.length === 0}
                  className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-semibold py-3 px-4 rounded-xl shadow-sm transition"
                >
                  <Send className="w-4 h-4" />
                  {sendingMessage ? 'Sending...' : 'Dispatch Message'}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: AUTOMATIONS */}
          {activeTab === 'automations' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Rule-Based Automations</h3>
                <p className="text-sm text-slate-500">
                  Instant auto-responders that reply when customers send specific keywords.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {automations.map((rule) => (
                  <div key={rule.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono bg-slate-100 text-emerald-700 font-bold px-2.5 py-1 rounded-md text-xs">
                        MATCH: "{rule.keyword}"
                      </span>
                      <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                        Active
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{rule.reply}</p>
                  </div>
                ))}
              </div>

              {/* Add New Rule */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs max-w-xl">
                <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Add Quick Keyword Auto-Responder
                </h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Trigger keyword (e.g. DISCOUNT)"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <textarea
                    rows={2}
                    placeholder="Automated response message..."
                    value={newReply}
                    onChange={(e) => setNewReply(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm"
                  />
                  <button
                    onClick={() => {
                      if (!newKeyword.trim() || !newReply.trim()) return
                      setAutomations([...automations, { id: Date.now().toString(), keyword: newKeyword.toUpperCase(), reply: newReply, enabled: true }])
                      setNewKeyword('')
                      setNewReply('')
                    }}
                    className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-lg"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Save Rule
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTACTS */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Contact CRM & Opt-Ins</h3>
                <p className="text-sm text-slate-500">
                  Manage audience segments, tag VIPs, and respect consent & opt-out status.
                </p>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                      <th className="py-3 px-6">Name</th>
                      <th className="py-3 px-6">WhatsApp Phone</th>
                      <th className="py-3 px-6">Tag</th>
                      <th className="py-3 px-6">Consent</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contacts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 transition">
                        <td className="py-3.5 px-6 font-medium text-slate-800">{c.name}</td>
                        <td className="py-3.5 px-6 font-mono text-slate-600 text-xs">{c.phone}</td>
                        <td className="py-3.5 px-6">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-xs font-medium">
                            {c.tag}
                          </span>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Opted In
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 max-w-xl shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">API Configuration</h3>
                <p className="text-sm text-slate-500">
                  Manage global API key credentials for communicating with the backend.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Global API Key
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={() => {
                  setApiKey(apiKeyInput)
                  alert('API Key updated successfully!')
                  fetchStatusAndInstances()
                }}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 px-4 rounded-xl shadow-sm transition"
              >
                Save Credentials
              </button>
            </div>
          )}
        </div>
      </main>

      {/* CREATE INSTANCE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Create WhatsApp Account</h4>
              <p className="text-xs text-slate-500 mt-1">
                Name your instance to identify which number or department it belongs to.
              </p>
            </div>

            <form onSubmit={handleCreateInstance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Instance Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. sales-team, support, personal"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-sm transition"
                >
                  {creating ? 'Creating...' : 'Create & Pair QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR PAIRING MODAL */}
      {selectedInstanceForQr && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Pair WhatsApp Web</h4>
              <p className="text-xs text-slate-500 mt-1">
                Instance: <span className="font-semibold text-slate-700">{selectedInstanceForQr.name}</span>
              </p>
            </div>

            {qrConnected ? (
              <div className="py-8 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h5 className="text-lg font-bold text-emerald-800">Successfully Connected!</h5>
                <p className="text-xs text-slate-500">
                  Your WhatsApp account is now linked and persistent.
                </p>
                <button
                  onClick={() => {
                    setSelectedInstanceForQr(null)
                    fetchStatusAndInstances()
                  }}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>
            ) : (
              <>
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 inline-block mx-auto shadow-inner">
                  {qrCodeData ? (
                    <img
                      src={qrCodeData.startsWith('data:') ? qrCodeData : `data:image/png;base64,${qrCodeData}`}
                      alt="WhatsApp Pairing QR"
                      className="w-56 h-56 object-contain rounded-lg"
                    />
                  ) : (
                    <div className="w-56 h-56 flex flex-col items-center justify-center text-slate-400 gap-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
                      <span className="text-xs">Generating Pairing QR...</span>
                    </div>
                  )}
                </div>

                <div className="text-left text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="font-semibold text-slate-800 mb-1">To Link Your Device:</div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">1</span>
                    <span>Open WhatsApp on your mobile phone</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">2</span>
                    <span>Tap <b>Menu (⋮)</b> or <b>Settings</b> &rarr; <b>Linked Devices</b></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] shrink-0 font-bold">3</span>
                    <span>Tap <b>Link a Device</b> and point your camera at this QR code</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedInstanceForQr(null)}
                  className="w-full py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

