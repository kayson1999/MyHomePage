/**
 * 知识库数据管理 API 服务器
 *
 * 轻量级 Express 服务，负责读写 public/data/knowledge/ 下的 JSON 文件
 * 仅管理员（通过 ADMIN_TOKEN 验证）可执行写操作
 *
 * 启动方式: node server/api.js
 * 默认端口: 3100（可通过 API_PORT 环境变量修改）
 */
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../public/data/knowledge')
const DOCS_FILE = path.join(DATA_DIR, 'index.json')
const NOTES_FILE = path.join(DATA_DIR, 'notes.json')

// 从 .env 文件手动读取环境变量（不依赖 dotenv）
function loadEnvVar(key) {
  try {
    const envPath = path.resolve(__dirname, '../.env')
    const content = fs.readFileSync(envPath, 'utf-8')
    const regex = new RegExp(`^${key}=(.+)$`, 'm')
    const match = content.match(regex)
    return match ? match[1].trim() : ''
  } catch {
    return ''
  }
}

const ADMIN_TOKEN = process.env.VITE_ADMIN_TOKEN || loadEnvVar('VITE_ADMIN_TOKEN')
const USER_CENTER_URL = process.env.VITE_USER_CENTER_URL || loadEnvVar('VITE_USER_CENTER_URL') || 'http://127.0.0.1:4000'
const PORT = process.env.API_PORT || 3100

const app = express()

// CORS 支持（允许前端跨域访问）
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-token, Authorization, X-App-Id')
  res.header('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(express.json({ limit: '10mb' }))

// 根路由 - 服务状态检查
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    service: '知识库 API 服务',
    userCenter: USER_CENTER_URL,
    endpoints: [
      'GET  /api/knowledge/docs',
      'POST /api/knowledge/docs',
      'DELETE /api/knowledge/docs/:id',
      'GET  /api/knowledge/notes',
      'POST /api/knowledge/notes',
      'DELETE /api/knowledge/notes/:id',
      'POST /api/knowledge/import',
      '/api/auth/* → 反向代理到用户中心'
    ]
  })
})

// ==================== 用户认证反向代理 ====================
// 将 /api/auth/* 请求转发到用户中心服务（用户中心路由为 /auth/*，需去掉 /api 前缀）
app.all('/api/auth/*', (req, res) => {
  const url = new URL(USER_CENTER_URL)
  const targetPath = req.originalUrl.replace(/^\/api/, '') // /api/auth/login → /auth/login

  const options = {
    hostname: url.hostname,
    port: url.port || 80,
    path: targetPath,
    method: req.method,
    headers: {
      ...req.headers,
      host: `${url.hostname}:${url.port || 80}`,
    },
  }

  const proxyReq = http.request(options, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers)
    proxyRes.pipe(res, { end: true })
  })

  proxyReq.on('error', (err) => {
    console.error('用户中心代理请求失败:', err.message)
    res.status(502).json({ error: '用户中心服务不可用', detail: err.message })
  })

  // 转发请求体
  if (req.body && Object.keys(req.body).length > 0) {
    const bodyStr = JSON.stringify(req.body)
    proxyReq.setHeader('Content-Type', 'application/json')
    proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyStr))
    proxyReq.write(bodyStr)
  }

  proxyReq.end()
})

// ==================== 工具函数 ====================

function readJsonFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function writeJsonFile(filePath, data) {
  // 确保目录存在
  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
}

// ==================== 鉴权中间件 ====================

function requireAdmin(req, res, next) {
  const token = req.headers['x-admin-token']
  if (!ADMIN_TOKEN) {
    return res.status(403).json({ error: '服务器未配置管理员密钥' })
  }
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ error: '管理员密钥验证失败' })
  }
  next()
}

// ==================== 文档 API ====================

/**
 * GET /api/knowledge/docs - 获取文档列表
 */
app.get('/api/knowledge/docs', (req, res) => {
  const docs = readJsonFile(DOCS_FILE)
  res.json(docs)
})

/**
 * POST /api/knowledge/docs - 添加文档（需管理员权限）
 * Body: { doc: {...} }
 */
app.post('/api/knowledge/docs', requireAdmin, (req, res) => {
  const { doc } = req.body
  if (!doc || !doc.title) {
    return res.status(400).json({ error: '文档数据不完整' })
  }
  const docs = readJsonFile(DOCS_FILE)
  // 确保 id 唯一
  if (!doc.id) {
    doc.id = Date.now() + Math.random()
  }
  docs.unshift(doc)
  writeJsonFile(DOCS_FILE, docs)
  res.json({ success: true, doc })
})

/**
 * DELETE /api/knowledge/docs/:id - 删除文档（需管理员权限）
 */
app.delete('/api/knowledge/docs/:id', requireAdmin, (req, res) => {
  const docId = parseFloat(req.params.id)
  let docs = readJsonFile(DOCS_FILE)
  const before = docs.length
  docs = docs.filter(d => d.id !== docId)

  // 同时删除关联笔记
  let notes = readJsonFile(NOTES_FILE)
  notes = notes.filter(n => n.docId !== docId)

  writeJsonFile(DOCS_FILE, docs)
  writeJsonFile(NOTES_FILE, notes)

  res.json({ success: true, removed: before - docs.length })
})

// ==================== 笔记 API ====================

/**
 * GET /api/knowledge/notes - 获取笔记列表
 */
app.get('/api/knowledge/notes', (req, res) => {
  const notes = readJsonFile(NOTES_FILE)
  res.json(notes)
})

/**
 * POST /api/knowledge/notes - 添加笔记（需管理员权限）
 * Body: { note: {...} }
 */
app.post('/api/knowledge/notes', requireAdmin, (req, res) => {
  const { note } = req.body
  if (!note || !note.text) {
    return res.status(400).json({ error: '笔记数据不完整' })
  }
  const notes = readJsonFile(NOTES_FILE)
  if (!note.id) {
    note.id = Date.now() + Math.random()
  }
  notes.push(note)
  writeJsonFile(NOTES_FILE, notes)

  // 更新文档的 noteCount
  if (note.docId) {
    const docs = readJsonFile(DOCS_FILE)
    const doc = docs.find(d => d.id === note.docId)
    if (doc) {
      doc.noteCount = (doc.noteCount || 0) + 1
      writeJsonFile(DOCS_FILE, docs)
    }
  }

  res.json({ success: true, note })
})

/**
 * DELETE /api/knowledge/notes/:id - 删除笔记（需管理员权限）
 */
app.delete('/api/knowledge/notes/:id', requireAdmin, (req, res) => {
  const noteId = parseFloat(req.params.id)
  const notes = readJsonFile(NOTES_FILE)
  const target = notes.find(n => n.id === noteId)

  if (!target) {
    return res.status(404).json({ error: '笔记不存在' })
  }

  const filtered = notes.filter(n => n.id !== noteId)
  writeJsonFile(NOTES_FILE, filtered)

  // 更新文档的 noteCount
  if (target.docId) {
    const docs = readJsonFile(DOCS_FILE)
    const doc = docs.find(d => d.id === target.docId)
    if (doc && doc.noteCount > 0) {
      doc.noteCount--
      writeJsonFile(DOCS_FILE, docs)
    }
  }

  res.json({ success: true })
})

// ==================== 导入 Markdown 文件 ====================

/**
 * POST /api/knowledge/import - 导入文档并保存原始文件（需管理员权限）
 * Body: { doc: {...}, rawContent: '原始文件内容', filename: '文件名.md' }
 */
app.post('/api/knowledge/import', requireAdmin, (req, res) => {
  const { doc, rawContent, filename } = req.body
  if (!doc || !doc.title) {
    return res.status(400).json({ error: '文档数据不完整' })
  }

  // 如果有原始内容和文件名，保存原始文件到 knowledge 目录
  if (rawContent && filename) {
    const safeName = filename.replace(/[^a-zA-Z0-9._\-\u4e00-\u9fa5]/g, '_')
    const filePath = path.join(DATA_DIR, safeName)
    fs.writeFileSync(filePath, rawContent, 'utf-8')
    // 在文档记录中保存文件引用
    doc.file = safeName
  }

  if (!doc.id) {
    doc.id = Date.now() + Math.random()
  }

  const docs = readJsonFile(DOCS_FILE)
  docs.unshift(doc)
  writeJsonFile(DOCS_FILE, docs)

  res.json({ success: true, doc })
})

// ==================== 启动服务 ====================

app.listen(PORT, () => {
  console.log(`📚 知识库 API 服务已启动: http://localhost:${PORT}`)
  console.log(`📁 数据目录: ${DATA_DIR}`)
  console.log(`🔐 管理员密钥: ${ADMIN_TOKEN ? '已配置' : '⚠️ 未配置'}`)
})
