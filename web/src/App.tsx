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
  LogOut,
  KeyRound,
  User,
  Building2,
  Lock,
  ChevronDown,
  Layers
} from 'lucide-react'
import { api, WhatsAppInstance, LicenseStatus, getApiKey, setApiKey, getApiBaseUrl, setApiBaseUrl } from './api'
import { auth } from './auth'
import { LoginScreen } from './components/LoginScreen'
import { QuickMessenger } from './components/QuickMessenger'
import { RuleAutomations } from './components/RuleAutomations'
import { ChangePasswordModal } from './components/ChangePasswordModal'

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => auth.isAuthenticated())
  const [activeTab, setActiveTab] = useState<'instances' | 'chat' | 'automations' | 'contacts' | 'settings'>('instances')
  const [instances, setInstances] = useState<WhatsAppInstance[]>([])
  const [loading, setLoading] = useState(false)
  const [license, setLicense] = useState<LicenseStatus | null>(null)
  const [apiKeyInput, setApiKeyInput] = useState(getApiKey())
  const [apiUrlInput, setApiUrlInput] = useState(getApiBaseUrl())

  // User Profile & Password Modal
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  // Create Instance State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newInstanceName, setNewInstanceName] = useState('')
  const [creating, setCreating] = useState(false)

  // QR Modal State
  const [selectedInstanceForQr, setSelectedInstanceForQr] = useState<WhatsAppInstance | null>(null)
  const [qrCodeData, setQrCodeData] = useState<string>('')
  const [qrLoading, setQrLoading] = useState(false)
  const [qrConnected, setQrConnected] = useState(false)

  // Quick Messenger active token
  const [selectedInstanceToken, setSelectedInstanceToken] = useState<string>('')

  // Contacts CRM State
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Rahul Sharma', phone: '+91 98765 43210', tag: 'NBFC Borrower', status: 'Active Loan' },
    { id: '2', name: 'Priya Patel', phone: '+91 91234 56789', tag: 'KYC Verified', status: 'Disbursed' },
    { id: '3', name: 'Vikram Singh', phone: '+91 99887 76655', tag: 'Collections', status: 'Payment Due' },
    { id: '4', name: 'Ananya Verma', phone: '+91 98111 22334', tag: 'VIP Partner', status: 'Enterprise' }
  ])
  const [contactSearch, setContactSearch] = useState('')

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
    if (!isAuthenticated) return
    fetchStatusAndInstances()
    const timer = setInterval(fetchStatusAndInstances, 10000)
    return () => clearInterval(timer)
  }, [isAuthenticated])

  // QR Code Polling
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

  // If unauthenticated, gate whole app behind LoginScreen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={() => setIsAuthenticated(true)} />
  }

  const handleCreateInstance = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newInstanceName.trim()) return
    try {
      setCreating(true)
      const created = await api.createInstance(newInstanceName.trim())
      setShowCreateModal(false)
      setNewInstanceName('')
      await fetchStatusAndInstances()
      // Open QR modal immediately
      setSelectedInstanceForQr(created)
      setQrConnected(false)
      setQrCodeData(created.qrcode || '')
    } catch (err: any) {
      alert('Failed to create instance: ' + (err.response?.data?.error || err.message))
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

  const handleLogout = () => {
    auth.logout()
    setIsAuthenticated(false)
  }

  const filteredContacts = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.phone.includes(contactSearch) ||
      c.tag.toLowerCase().includes(contactSearch.toLowerCase())
  )

  const connectedCount = instances.filter((i) => i.connected).length

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col justify-between p-4 border-r border-slate-800 shadow-xl shrink-0">
        <div>
          {/* Brand Header */}
          <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight">WhatsFlow Pro</h1>
              <p className="text-[11px] text-emerald-400 font-medium">Enterprise Hub</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('instances')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'instances'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Instances</span>
              <span className="ml-auto bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full text-[10px] font-mono">
                {connectedCount}/{instances.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'chat'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Quick Messenger</span>
              <span className="ml-auto bg-emerald-500/20 text-emerald-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                PRO
              </span>
            </button>

            <button
              onClick={() => setActiveTab('automations')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'automations'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Bot className="w-4 h-4" />
              <span>Automations</span>
              <span className="ml-auto bg-teal-500/20 text-teal-300 px-1.5 py-0.5 rounded text-[10px] font-bold">
                TENANT
              </span>
            </button>

            <button
              onClick={() => setActiveTab('contacts')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'contacts'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Audience CRM</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'settings'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'hover:bg-slate-800 hover:text-white text-slate-400'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>System & API</span>
            </button>
          </nav>
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Evolution Engine v2.0</span>
          </div>
          <div className="text-slate-500 font-mono text-[10px]">
            Server: nakshtraventures.in/wa-api
          </div>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* TOP EXECUTIVE BAR */}
        <header className="h-16 bg-white border-b border-slate-200 px-8 flex items-center justify-between shadow-xs sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-bold text-slate-900 capitalize">
              {activeTab === 'chat'
                ? 'Quick Messenger'
                : activeTab === 'automations'
                ? 'Rule Automations (Multi-Tenant)'
                : activeTab === 'instances'
                ? 'WhatsApp Account Lines'
                : activeTab === 'contacts'
                ? 'Audience & Borrower CRM'
                : 'Platform Settings'}
            </h2>

            {/* License badge */}
            {license?.status && (
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
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
            {/* Refresh button */}
            <button
              onClick={fetchStatusAndInstances}
              className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              title="Refresh Engine Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>

            {/* Create new instance */}
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm transition"
            >
              <Plus className="w-4 h-4" />
              New Line
            </button>

            {/* Admin User Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 pl-2.5 pr-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition text-xs font-semibold text-slate-700 border border-slate-200"
              >
                <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                  AS
                </div>
                <span className="hidden sm:inline">akshat.unt@gmail.com</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 animate-in fade-in duration-100 text-xs">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="font-bold text-slate-900">Akshat Sinha</p>
                    <p className="text-[11px] text-slate-400 truncate">akshat.unt@gmail.com</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Super Administrator
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false)
                      setShowPasswordModal(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-50 transition text-left font-medium"
                  >
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    Change Password
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-600 hover:bg-rose-50 transition text-left font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* VIEW CONTAINER */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: INSTANCES */}
          {activeTab === 'instances' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Connected Accounts & Devices</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Multi-instance management running under isolated worker processes on DigitalOcean.
                  </p>
                </div>
              </div>

              {instances.length === 0 ? (
                <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <Smartphone className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-slate-800 mb-1">No WhatsApp Lines Created</h4>
                  <p className="text-slate-500 text-xs max-w-md mx-auto mb-6 leading-relaxed">
                    Deploy your first WhatsApp phone instance to start sending notifications, transactional receipts, and auto-responders.
                  </p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition"
                  >
                    <Plus className="w-4 h-4" />
                    Create WhatsApp Line
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {instances.map((inst) => (
                    <div
                      key={inst.id}
                      className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 hover:shadow-md transition-all space-y-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-slate-900 tracking-tight">
                            {inst.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono mt-0.5">
                            {inst.jid ? inst.jid.split('@')[0] : 'Unpaired Line'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            inst.connected
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              inst.connected ? 'bg-emerald-500' : 'bg-amber-400 animate-pulse'
                            }`}
                          />
                          {inst.connected ? 'Online' : 'Pairing Required'}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
                        <div className="flex justify-between">
                          <span>Token:</span>
                          <span className="font-mono text-slate-700">{inst.token.slice(0, 16)}...</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Operating System:</span>
                          <span className="text-slate-700 font-medium">{inst.os_name || 'WhatsFlow'}</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                        {!inst.connected ? (
                          <button
                            type="button"
                            onClick={async () => {
                              setSelectedInstanceForQr(inst)
                              setQrConnected(false)
                              setQrCodeData(inst.qrcode || '')
                              try {
                                await api.connectInstance(inst.token)
                              } catch (e) {
                                console.error(e)
                              }
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold py-2 px-3 rounded-xl transition"
                          >
                            <QrCode className="w-4 h-4" />
                            Pair WhatsApp QR
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedInstanceToken(inst.token)
                              setActiveTab('chat')
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold py-2 px-3 rounded-xl transition shadow-xs"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Open in Messenger
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteInstance(inst.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
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

          {/* TAB 2: QUICK MESSENGER */}
          {activeTab === 'chat' && (
            <QuickMessenger
              instances={instances}
              selectedToken={selectedInstanceToken}
              onSelectToken={setSelectedInstanceToken}
            />
          )}

          {/* TAB 3: RULE AUTOMATIONS */}
          {activeTab === 'automations' && <RuleAutomations instances={instances} />}

          {/* TAB 4: AUDIENCE & BORROWER CRM */}
          {activeTab === 'contacts' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Audience & Contact CRM</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Manage borrowers, VIP clients, customer opt-ins, and recipient tags.
                  </p>
                </div>
                <div className="relative w-full sm:w-64">
                  <input
                    type="text"
                    value={contactSearch}
                    onChange={(e) => setContactSearch(e.target.value)}
                    placeholder="Search by name or number..."
                    className="w-full bg-white border border-slate-200 rounded-xl pl-3.5 pr-4 py-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                      <th className="py-3.5 px-6">Customer / Borrower</th>
                      <th className="py-3.5 px-6">Phone Number</th>
                      <th className="py-3.5 px-6">Segment Tag</th>
                      <th className="py-3.5 px-6">Status</th>
                      <th className="py-3.5 px-6 text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredContacts.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                        <td className="py-4 px-6 font-mono text-slate-600">{c.phone}</td>
                        <td className="py-4 px-6">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md text-[11px] font-semibold">
                            {c.tag}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {c.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setActiveTab('chat')
                            }}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Message
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SYSTEM & API SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-2xl shadow-xs space-y-6">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Platform & API Configuration</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure droplet communication endpoints and Evolution Foundation API credentials.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Backend HTTPS Server URL
                  </label>
                  <input
                    type="text"
                    value={apiUrlInput}
                    onChange={(e) => setApiUrlInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Production Droplet Route: <span className="font-mono text-slate-600">https://nakshtraventures.in/wa-api</span>
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                    Global Engine API Key
                  </label>
                  <input
                    type="text"
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs font-mono text-slate-800 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setApiKey(apiKeyInput.trim())
                      setApiBaseUrl(apiUrlInput.trim())
                      alert('API settings saved successfully!')
                      fetchStatusAndInstances()
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-5 rounded-xl shadow-sm transition"
                  >
                    Save API Configuration
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* CREATE INSTANCE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Create New WhatsApp Line</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Assign a dedicated phone line to a team or customer care department.
              </p>
            </div>

            <form onSubmit={handleCreateInstance} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-500 mb-1.5">
                  Instance Name / ID
                </label>
                <input
                  type="text"
                  placeholder="e.g. nbfc-support, collections-line"
                  value={newInstanceName}
                  onChange={(e) => setNewInstanceName(e.target.value)}
                  required
                  autoFocus
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition disabled:opacity-50"
                >
                  {creating ? 'Creating Line...' : 'Create & Generate QR'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR PAIRING MODAL */}
      {selectedInstanceForQr && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h4 className="text-xl font-bold text-slate-900">Pair WhatsApp Web</h4>
              <p className="text-xs text-slate-500 mt-1">
                Line Name: <span className="font-semibold text-slate-700">{selectedInstanceForQr.name}</span>
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
                  type="button"
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
                  type="button"
                  onClick={() => setSelectedInstanceForQr(null)}
                  className="w-full py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHANGE PASSWORD MODAL */}
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </div>
  )
}
