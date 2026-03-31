/**
 * 内容管理配置中心（轻量级）
 *
 * 职责：提供通用的数据处理函数（过滤、排序、URL 解析）
 * 各模块数据统一在 src/data/*.json 中维护（内容 + 管理字段一体化）
 *
 * 管理字段说明（内联在每条数据中）：
 *  - enabled: 是否上架 (true=显示, false=隐藏，默认 true)
 *  - pinned:  是否置顶 (true=置顶显示在最前，默认 false)
 *  - order:   排序权重 (数字越小越靠前，默认 999)
 *
 * 行为字段说明（游戏/工具模块使用）：
 *  - entryType: 入口类型 ('external'=外部跳转, 'iframe'=弹窗内嵌, 'route'=站内路由)
 *  - envKey:    环境变量 key（如 'VITE_WORKER_URL'），用于动态读取 URL
 *  - url:       直接 URL（entryType 为 iframe/route 时使用）
 *  - fallbackUrl: envKey 未配置时的降级 URL
 *  - authMode:  认证模式 ('sso_token'=带 token 跳转, 'none'=无需认证)
 */

import { getToken } from '@/services/auth.api.js'

// ==================== 通用处理函数 ====================

/**
 * 通用数据处理：过滤 enabled → 排序 pinned/order
 * @param {Array} items - JSON 中的原始数据列表（已包含管理字段）
 * @returns {Array} - 过滤排序后的最终列表
 */
export function processEntries(items) {
  return items
    .filter(item => item.enabled !== false)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return (a.order ?? 999) - (b.order ?? 999)
    })
}

/**
 * 解析条目的基础 URL（不含 token）
 * @param {Object} item - 包含 entryType/envKey/url/fallbackUrl 的条目
 * @returns {string} - 基础 URL
 */
function resolveBaseUrl(item) {
  if (item.envKey) {
    return import.meta.env[item.envKey] || item.fallbackUrl || ''
  }
  return item.url || ''
}

/**
 * 解析条目的最终 URL（环境变量读取 + token 拼接）
 * 每次调用时动态获取最新 token，确保登录后 URL 自动更新
 * @param {Object} item - 包含 entryType/envKey/url/fallbackUrl/authMode 的条目
 * @param {string} [reactiveToken] - 可选，传入响应式 token（来自 authStore.state.token）
 *   传入后 Vue 可追踪依赖，token 变化时自动触发重新渲染
 *   不传则降级从 localStorage 读取（非响应式，适用于非组件场景）
 * @returns {string} - 解析后的完整 URL
 */
export function resolveEntryUrl(item, reactiveToken) {
  const base = resolveBaseUrl(item)
  if (!base) return ''

  // 根据 authMode 拼接 token
  if (item.authMode === 'sso_token') {
    // 优先使用传入的响应式 token，否则降级从 localStorage 读取
    const token = reactiveToken !== undefined ? reactiveToken : getToken()
    if (token) {
      const sep = base.includes('?') ? '&' : '?'
      return `${base}${sep}sso_token=${encodeURIComponent(token)}`
    }
    // 未登录时，sso_token 模式不允许无认证跳转，返回空字符串
    return ''
  }

  return base
}
