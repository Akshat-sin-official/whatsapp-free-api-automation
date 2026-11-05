// Authentication state and user management
export interface AuthUser {
  email: string
  name: string
  role: string
  avatar: string
  tenantId: string
  lastLogin: string
}

const ALLOWED_EMAIL = 'akshat.unt@gmail.com'
const DEFAULT_INITIAL_PASSWORD = 'Flow@Nakshatra2026!'

const STORAGE_KEYS = {
  USER: 'whatsflow_auth_user',
  PASS: 'whatsflow_auth_pass',
  RESET_CODE: 'whatsflow_reset_code',
  RESET_EXPIRY: 'whatsflow_reset_expiry',
  TENANTS: 'whatsflow_tenants',
  ACTIVE_TENANT: 'whatsflow_active_tenant',
}

// Initialize default password if not already present
export function initAuth() {
  if (!localStorage.getItem(STORAGE_KEYS.PASS)) {
    localStorage.setItem(STORAGE_KEYS.PASS, DEFAULT_INITIAL_PASSWORD)
  }
}

export const auth = {
  getInitialPassword: () => DEFAULT_INITIAL_PASSWORD,
  getAllowedEmail: () => ALLOWED_EMAIL,

  isAuthenticated: (): boolean => {
    initAuth()
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    return !!userStr
  },

  getCurrentUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER)
    if (!userStr) return null
    try {
      return JSON.parse(userStr)
    } catch {
      return null
    }
  },

  login: async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    initAuth()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail !== ALLOWED_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Access Denied. Only authorized administrator (${ALLOWED_EMAIL}) is permitted.`
      }
    }

    const currentPass = localStorage.getItem(STORAGE_KEYS.PASS) || DEFAULT_INITIAL_PASSWORD

    if (pass !== currentPass) {
      return {
        success: false,
        error: 'Invalid password. Please check your credentials or use Forgot Password.'
      }
    }

    const user: AuthUser = {
      email: ALLOWED_EMAIL,
      name: 'Akshat Sinha',
      role: 'Super Administrator',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80',
      tenantId: 'nakshatra-main',
      lastLogin: new Date().toISOString()
    }

    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
    return { success: true }
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.USER)
  },

  changePassword: (oldPass: string, newPass: string): { success: boolean; error?: string } => {
    initAuth()
    const currentPass = localStorage.getItem(STORAGE_KEYS.PASS) || DEFAULT_INITIAL_PASSWORD

    if (oldPass !== currentPass) {
      return { success: false, error: 'Current password does not match.' }
    }

    if (newPass.length < 8) {
      return { success: false, error: 'New password must be at least 8 characters long.' }
    }

    localStorage.setItem(STORAGE_KEYS.PASS, newPass)
    return { success: true }
  },

  // Generates 6-digit recovery code for forgot password flow
  requestPasswordReset: (email: string): { success: boolean; code?: string; error?: string } => {
    initAuth()
    const trimmedEmail = email.trim().toLowerCase()

    if (trimmedEmail !== ALLOWED_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `No registered account found for ${email}. Access restricted to ${ALLOWED_EMAIL}.`
      }
    }

    // Generate 6-digit verification code
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiry = Date.now() + 15 * 60 * 1000 // 15 mins

    localStorage.setItem(STORAGE_KEYS.RESET_CODE, code)
    localStorage.setItem(STORAGE_KEYS.RESET_EXPIRY, expiry.toString())

    return {
      success: true,
      code // Surfaced in UI modal for instant verification
    }
  },

  verifyAndResetPassword: (email: string, code: string, newPass: string): { success: boolean; error?: string } => {
    initAuth()
    const savedCode = localStorage.getItem(STORAGE_KEYS.RESET_CODE)
    const expiryStr = localStorage.getItem(STORAGE_KEYS.RESET_EXPIRY)

    if (!savedCode || !expiryStr) {
      return { success: false, error: 'No active password reset request found.' }
    }

    if (Date.now() > parseInt(expiryStr, 10)) {
      return { success: false, error: 'Reset code has expired. Please request a new one.' }
    }

    if (code.trim() !== savedCode.trim()) {
      return { success: false, error: 'Invalid 6-digit recovery code.' }
    }

    if (newPass.length < 8) {
      return { success: false, error: 'Password must be at least 8 characters long.' }
    }

    localStorage.setItem(STORAGE_KEYS.PASS, newPass)
    localStorage.removeItem(STORAGE_KEYS.RESET_CODE)
    localStorage.removeItem(STORAGE_KEYS.RESET_EXPIRY)

    return { success: true }
  }
}
