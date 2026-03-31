/**
 * 管理员权限管理
 *
 * 通过环境变量 VITE_ADMIN_TOKEN 配置管理员密钥
 * 管理员在页面输入密钥验证身份，验证通过后存入 sessionStorage
 * 非管理员无法看到「导入文档」「新建笔记」「删除」等管理按钮
 */
import { reactive, readonly, computed } from 'vue'

const ADMIN_SESSION_KEY = 'site_admin_verified'
const ADMIN_TOKEN = import.meta.env.VITE_ADMIN_TOKEN || ''

/**
 * 从 sessionStorage 恢复管理员状态
 */
function loadAdminState() {
  try {
    return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  } catch {
    return false
  }
}

const state = reactive({
  verified: loadAdminState(),
  showAuthModal: false,
})

/**
 * 是否已配置管理员密钥（未配置则禁用管理员功能）
 */
const isConfigured = !!ADMIN_TOKEN

/**
 * 当前是否为管理员
 */
const isAdmin = computed(() => isConfigured && state.verified)

/**
 * 验证管理员密钥
 * @param {string} token - 用户输入的密钥
 * @returns {boolean} - 验证是否成功
 */
function verify(token) {
  if (!isConfigured) return false
  if (token === ADMIN_TOKEN) {
    state.verified = true
    try {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
    } catch { /* ignore */ }
    return true
  }
  return false
}

/**
 * 退出管理员模式
 */
function logout() {
  state.verified = false
  try {
    sessionStorage.removeItem(ADMIN_SESSION_KEY)
  } catch { /* ignore */ }
}

/**
 * 打开管理员验证弹窗
 */
function openAuthModal() {
  state.showAuthModal = true
}

/**
 * 关闭管理员验证弹窗
 */
function closeAuthModal() {
  state.showAuthModal = false
}

export const adminStore = {
  state: readonly(state),
  _state: state,
  isAdmin,
  isConfigured,
  verify,
  logout,
  openAuthModal,
  closeAuthModal,
}
