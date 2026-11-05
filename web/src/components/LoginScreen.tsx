import React, { useState } from 'react'
import { auth } from '../auth'
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react'

interface LoginScreenProps {
  onLoginSuccess: () => void
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState(auth.getAllowedEmail())
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copiedPass, setCopiedPass] = useState(false)

  // Forgot password flow
  const [isForgotMode, setIsForgotMode] = useState(false)
  const [resetStep, setResetStep] = useState<1 | 2>(1)
  const [resetCode, setResetCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [resetSuccessMsg, setResetSuccessMsg] = useState<string | null>(null)

  const defaultPass = auth.getInitialPassword()

  const handleCopyDefault = () => {
    navigator.clipboard.writeText(defaultPass)
    setPassword(defaultPass)
    setCopiedPass(true)
    setTimeout(() => setCopiedPass(false), 2000)
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await auth.login(email, password)
      if (res.success) {
        onLoginSuccess()
      } else {
        setError(res.error || 'Login failed')
      }
    } catch {
      setError('An unexpected error occurred during login.')
    } finally {
      setLoading(false)
    }
  }

  const handleRequestReset = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const res = auth.requestPasswordReset(email)
    if (res.success && res.code) {
      setGeneratedCode(res.code)
      setResetStep(2)
    } else {
      setError(res.error || 'Failed to request reset.')
    }
  }

  const handleCompleteReset = (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    const res = auth.verifyAndResetPassword(email, resetCode, newPassword)
    if (res.success) {
      setResetSuccessMsg('Password updated successfully! You can now log in.')
      setIsForgotMode(false)
      setResetStep(1)
      setPassword(newPassword)
      setGeneratedCode(null)
    } else {
      setError(res.error || 'Reset failed.')
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 -translate-x-1/2 w-80 h-80 bg-teal-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
        
        {/* Brand header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 mb-4 border border-emerald-400/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">WhatsFlow Enterprise</h1>
          <p className="text-xs text-slate-400 mt-1">Multi-Tenant WhatsApp & Automation Hub</p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Protected Portal: akshat.unt@gmail.com
          </div>
        </div>

        {/* Global Error Banner */}
        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Banner */}
        {resetSuccessMsg && (
          <div className="mb-6 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{resetSuccessMsg}</span>
          </div>
        )}

        {!isForgotMode ? (
          /* LOGIN FORM */
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Authorized Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="akshat.unt@gmail.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotMode(true)
                    setError(null)
                  }}
                  className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Generated Default Password helper */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs">
              <div className="flex items-center justify-between text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5 text-slate-300 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  Generated Admin Password:
                </span>
                <button
                  type="button"
                  onClick={handleCopyDefault}
                  className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 text-[11px] font-semibold"
                >
                  {copiedPass ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Auto-Fill
                    </>
                  )}
                </button>
              </div>
              <code className="text-amber-300 bg-amber-950/30 px-2 py-1 rounded text-[11px] font-mono border border-amber-800/30 block break-all">
                {defaultPass}
              </code>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50"
            >
              {loading ? (
                <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* FORGOT PASSWORD WORKFLOW */
          <div className="space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                Password Recovery
              </h3>
              <button
                type="button"
                onClick={() => {
                  setIsForgotMode(false)
                  setError(null)
                }}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to Sign In
              </button>
            </div>

            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Enter your registered administrator email to generate a secure recovery code.
                </p>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="akshat.unt@gmail.com"
                      className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  Generate Recovery Code
                </button>
              </form>
            ) : (
              <form onSubmit={handleCompleteReset} className="space-y-4">
                {generatedCode && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
                    <p className="font-semibold mb-1">Your 6-Digit Recovery Code:</p>
                    <code className="text-base tracking-widest font-mono font-bold text-amber-200 bg-amber-950/40 px-3 py-1 rounded border border-amber-800/40 inline-block">
                      {generatedCode}
                    </code>
                    <p className="text-[11px] text-amber-400/80 mt-1.5">
                      Valid for 15 minutes. Enter this code below with your new password.
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    placeholder="Enter 6-digit code"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    placeholder="Repeat new password"
                    className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 text-white font-semibold py-2.5 rounded-xl transition-all text-sm"
                >
                  Save & Update Password
                </button>
              </form>
            )}
          </div>
        )}

        {/* Footer info */}
        <div className="mt-8 pt-4 border-t border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-500">
            Powered by Nakshatra Cloud Infrastructure &bull; Strictly Confidential
          </p>
        </div>
      </div>
    </div>
  )
}

