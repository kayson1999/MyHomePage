/**
 * Token 管理工具
 * 
 * 打卡服务已迁移至独立项目，本文件仅保留 Token 读写能力，
 * 供 content.config.js 中的 resolveEntryUrl 进行 SSO Token 拼接。
 */

const TOKEN_KEY = 'site_auth_token'

/** 获取 token */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}
