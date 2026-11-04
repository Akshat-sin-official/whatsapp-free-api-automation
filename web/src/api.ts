import axios from 'axios'

export interface WhatsAppInstance {
  id: string
  name: string
  token: string
  jid?: string
  connected: boolean
  qrcode?: string
  expiration?: number
  disconnect_reason?: string
  createdAt?: string
}

export interface SendMessagePayload {
  number: string
  text: string
}

export interface LicenseStatus {
  status: string
  instance_id?: string
  register_url?: string
}

const DEFAULT_GLOBAL_API_KEY = '429683C4C977415CAAFCCE10F7D57E11'
const DEFAULT_API_URL = import.meta.env.VITE_API_URL || 'http://146.190.11.227:8080'

export const getApiBaseUrl = () => {
  return localStorage.getItem('WA_API_URL') || DEFAULT_API_URL
}

export const setApiBaseUrl = (url: string) => {
  localStorage.setItem('WA_API_URL', url)
  apiClient.defaults.baseURL = url
}

export const getApiKey = () => {
  return localStorage.getItem('WA_GLOBAL_API_KEY') || DEFAULT_GLOBAL_API_KEY
}

export const setApiKey = (key: string) => {
  localStorage.setItem('WA_GLOBAL_API_KEY', key)
}

const apiClient = axios.create({
  baseURL: getApiBaseUrl()
})

apiClient.interceptors.request.use((config) => {
  config.baseURL = getApiBaseUrl()
  return config
})

export const api = {
  // License
  getLicenseStatus: async (): Promise<LicenseStatus> => {
    try {
      const res = await apiClient.get('/license/status')
      return res.data
    } catch (e: any) {
      if (e.response?.data) return e.response.data
      return { status: 'unknown' }
    }
  },

  getLicenseRegisterUrl: async (): Promise<{ register_url: string }> => {
    const res = await apiClient.get('/license/register')
    return res.data
  },

  // Instances
  getAllInstances: async (): Promise<WhatsAppInstance[]> => {
    const res = await apiClient.get('/instance/all', {
      headers: { apikey: getApiKey() }
    })
    const list = res.data?.data || res.data
    return Array.isArray(list) ? list : []
  },

  createInstance: async (name: string, customToken?: string): Promise<WhatsAppInstance> => {
    const token = customToken || `tok_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`
    const res = await apiClient.post(
      '/instance/create',
      { name, token, client_name: 'evolution' },
      { headers: { apikey: getApiKey(), 'Content-Type': 'application/json' } }
    )
    return res.data?.data || res.data
  },

  connectInstance: async (token: string): Promise<any> => {
    const res = await apiClient.post(
      '/instance/connect',
      {},
      { headers: { apikey: token, 'Content-Type': 'application/json' } }
    )
    return res.data
  },

  deleteInstance: async (instanceId: string): Promise<any> => {
    const res = await apiClient.delete(`/instance/delete/${instanceId}`, {
      headers: { apikey: getApiKey() }
    })
    return res.data
  },

  // Instance-level operations
  getInstanceQr: async (token: string): Promise<{ qrcode: string }> => {
    const res = await apiClient.get('/instance/qr', {
      headers: { apikey: token }
    })
    return res.data?.data || res.data
  },

  getInstanceStatus: async (token: string): Promise<{ connected: boolean; jid?: string }> => {
    const res = await apiClient.get('/instance/status', {
      headers: { apikey: token }
    })
    return res.data?.data || res.data
  },

  reconnectInstance: async (token: string): Promise<any> => {
    const res = await apiClient.post(
      '/instance/reconnect',
      {},
      { headers: { apikey: token } }
    )
    return res.data
  },

  disconnectInstance: async (token: string): Promise<any> => {
    const res = await apiClient.post(
      '/instance/disconnect',
      {},
      { headers: { apikey: token } }
    )
    return res.data
  },

  logoutInstance: async (token: string): Promise<any> => {
    const res = await apiClient.delete('/instance/logout', {
      headers: { apikey: token }
    })
    return res.data
  },

  // Messaging
  sendTextMessage: async (token: string, payload: SendMessagePayload): Promise<any> => {
    const res = await apiClient.post(
      '/send/text',
      payload,
      { headers: { apikey: token } }
    )
    return res.data
  }
}

