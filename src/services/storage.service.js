/**
 * 服务器存储服务
 *
 * 通过 HTTP API 与后端交互，将文档和笔记持久化到服务器文件中
 * 所有写操作需要管理员密钥（通过 x-admin-token 请求头传递）
 */

const API_BASE = '/api/knowledge'

/**
 * 获取管理员密钥（从 sessionStorage 中读取验证状态，从环境变量获取 token）
 */
function getAdminToken() {
  // 管理员 token 存储在 import.meta.env 中，但这里是运行时模块
  // 通过 adminStore 传递，或直接从环境变量读取
  return import.meta.env.VITE_ADMIN_TOKEN || ''
}

/**
 * 通用 API 请求封装
 */
async function apiRequest(url, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // 写操作自动附带管理员密钥
  if (options.method && options.method !== 'GET') {
    headers['x-admin-token'] = getAdminToken()
  }

  const res = await fetch(url, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.error || `API 请求失败: ${res.status}`)
  }

  return data
}

// ==================== 文档管理 ====================

/**
 * 添加一篇文档到服务器
 * @param {Object} doc - 文档对象
 * @returns {Promise<Object>} - 保存后的文档（含服务器分配的 id）
 */
export async function saveDoc(doc) {
  const result = await apiRequest(`${API_BASE}/docs`, {
    method: 'POST',
    body: JSON.stringify({ doc }),
  })
  return result.doc
}

/**
 * 删除一篇文档
 * @param {number|string} docId - 文档 ID
 */
export async function removeDoc(docId) {
  await apiRequest(`${API_BASE}/docs/${docId}`, {
    method: 'DELETE',
  })
}

// ==================== 笔记管理 ====================

/**
 * 添加一条笔记到服务器
 * @param {Object} note - 笔记对象
 * @returns {Promise<Object>} - 保存后的笔记
 */
export async function saveNote(note) {
  const result = await apiRequest(`${API_BASE}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  })
  return result.note
}

/**
 * 删除一条笔记
 * @param {number|string} noteId - 笔记 ID
 */
export async function removeNote(noteId) {
  await apiRequest(`${API_BASE}/notes/${noteId}`, {
    method: 'DELETE',
  })
}

// ==================== 文档导入 ====================

/**
 * 导入文档到服务器（同时保存原始文件）
 * @param {Object} doc - 文档元数据
 * @param {string} rawContent - 原始文件内容
 * @param {string} filename - 原始文件名
 * @returns {Promise<Object>} - 保存后的文档
 */
export async function importDoc(doc, rawContent, filename) {
  const result = await apiRequest(`${API_BASE}/import`, {
    method: 'POST',
    body: JSON.stringify({ doc, rawContent, filename }),
  })
  return result.doc
}
