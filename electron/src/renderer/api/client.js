import axios from 'axios'

const DEFAULT_BASE_URL = 'http://localhost:8080'
let baseURL = DEFAULT_BASE_URL

if (window.electronAPI) {
  window.electronAPI.getServerConfig().then((cfg) => {
    if (cfg?.baseURL) {
      baseURL = cfg.baseURL
      client.defaults.baseURL = baseURL
    }
  })
}

const client = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

client.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// ---- Auth API ----
export const authAPI = {
  login: (username, password) =>
    client.post('/api/auth/login', { username, password }),
}

// ---- Task API ----
export const taskAPI = {
  list: (params) => client.get('/api/tasks', { params }),
  get: (id) => client.get(`/api/tasks/${id}`),
  delete: (id) => client.delete(`/api/tasks/${id}`),
}

// ---- FunctionArchive API ----
export const functionAPI = {
  create: (data) => client.post('/api/function/tasks', data),
  run: (id) => client.post(`/api/function/tasks/${id}/run`),
  diff: (id) => client.get(`/api/function/tasks/${id}/diff`),
  commit: (id, data) => client.post(`/api/function/tasks/${id}/commit`, data || {}),
  retry: (id) => client.post(`/api/function/tasks/${id}/retry`),
  uploadImages: (id, files) => {
    const form = new FormData()
    files.forEach((file) => form.append('images', file))
    return client.post(`/api/function/tasks/${id}/images`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ---- Worker API ----
export const workerAPI = {
  list: () => client.get('/api/workers'),
}

// ---- WebSocket ----
export function createWSConnection(onMessage) {
  const wsURL = baseURL.replace(/^http/, 'ws') + '/ws'
  const token = localStorage.getItem('token')
  const ws = new WebSocket(`${wsURL}?token=${token}`)

  ws.onopen = () => console.log('[WS] Connected')
  ws.onclose = () => console.log('[WS] Disconnected')
  ws.onerror = (e) => console.error('[WS] Error', e)
  ws.onmessage = (e) => {
    try {
      const msg = JSON.parse(e.data)
      onMessage(msg)
    } catch (err) {
      console.error('[WS] Parse error', err)
    }
  }

  return ws
}

export default {
  login: authAPI.login,
  getTasks: taskAPI.list,
  getTask: taskAPI.get,
  deleteTask: taskAPI.delete,
  createFunctionTask: functionAPI.create,
  runFunctionTask: functionAPI.run,
  getFunctionDiff: functionAPI.diff,
  commitFunction: functionAPI.commit,
  retryFunction: functionAPI.retry,
  uploadFunctionImages: functionAPI.uploadImages,
  getWorkers: workerAPI.list,
  connectWS: createWSConnection,
}
