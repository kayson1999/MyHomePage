/**
 * 全局认证状态管理
 *
 * 基于 Vue reactive 实现，管理用户登录状态、token、用户信息。
 * 登录/注册/登出操作直接调用用户中心 API。
 * 该账号可畅玩所有游戏/工具（冲动是魔鬼、打工人打卡等）。
 */
import { reactive, readonly } from 'vue'
import { getToken, setToken, clearToken } from './auth.api.js'

const USER_KEY = 'site_auth_user'

/**
 * 从 localStorage 恢复用户信息
 */
function loadUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function saveUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

// 响应式状态
const state = reactive({
  token: getToken() || '',
  user: loadUser(),
  showLoginModal: false,
})

/**
 * 用户中心 API 基础请求
 */
const APP_ID = import.meta.env.VITE_APP_ID || 'myhomepage'

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'X-App-Id': APP_ID,
    ...options.headers,
  }
  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`
  }

  const res = await fetch(`/api${path}`, { ...options, headers })
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

/**
 * 登录
 */
async function login(username, password) {
  const result = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  })

  if (result.ok) {
    state.token = result.data.token
    state.user = result.data.user
    setToken(result.data.token)
    saveUser(result.data.user)
  }

  return result
}

/**
 * 注册
 */
async function register(username, password, nickname) {
  const result = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password, nickname }),
  })

  if (result.ok) {
    state.token = result.data.token
    state.user = result.data.user
    setToken(result.data.token)
    saveUser(result.data.user)
  }

  return result
}

/**
 * 登出
 */
async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' })
  } catch {
    // 登出失败不影响前端清除
  }
  state.token = ''
  state.user = null
  clearToken()
  saveUser(null)
}

/**
 * 打开登录弹窗
 */
function openLoginModal() {
  state.showLoginModal = true
}

/**
 * 关闭登录弹窗
 */
function closeLoginModal() {
  state.showLoginModal = false
}

/**
 * 是否已登录
 */
function isLoggedIn() {
  return !!state.token
}

export const authStore = {
  state: readonly(state),
  /** 内部可写状态（仅供 LoginModal 绑定 showLoginModal） */
  _state: state,
  login,
  register,
  logout,
  openLoginModal,
  closeLoginModal,
  isLoggedIn,
}
