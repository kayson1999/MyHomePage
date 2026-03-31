/**
 * Vercel Serverless Function — GitHub 数据中转 API
 *
 * 功能：服务端调用 GitHub API 读取仓库中的数据文件，带缓存返回给前端
 * 路由：GET /api/github?path=<文件路径>
 *
 * 优势：
 *  - Token 不暴露给前端，安全
 *  - 服务端缓存，减少 GitHub API 调用次数
 *  - 通过 Vercel 边缘网络加速，国内访问更稳定
 *
 * 环境变量（在 Vercel Dashboard 中配置）：
 *  - GITHUB_TOKEN:  GitHub Personal Access Token（私有仓库必须，公开仓库可选但建议配置以提高速率限制）
 *  - GITHUB_OWNER:  仓库拥有者（用户名或组织名）
 *  - GITHUB_REPO:   仓库名称
 *  - GITHUB_BRANCH: 分支名（默认 main）
 */

// 内存缓存（Serverless 冷启动间共享，热实例内有效）
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000 // 缓存 5 分钟

export default async function handler(req, res) {
  // 仅允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const { path: filePath } = req.query

  if (!filePath) {
    return res.status(400).json({ error: '缺少 path 参数' })
  }

  // 读取环境变量
  const token = process.env.GITHUB_TOKEN
  const owner = process.env.GITHUB_OWNER
  const repo = process.env.GITHUB_REPO
  const branch = process.env.GITHUB_BRANCH || 'main'

  if (!owner || !repo) {
    return res.status(500).json({ error: 'GitHub 仓库配置缺失，请在 Vercel 环境变量中配置 GITHUB_OWNER 和 GITHUB_REPO' })
  }

  // 构建缓存 key
  const cacheKey = `${owner}/${repo}/${branch}/${filePath}`

  // 检查缓存
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    res.setHeader('X-Cache', 'HIT')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return sendResponse(res, cached.data, cached.contentType)
  }

  try {
    // 调用 GitHub Contents API
    // 对路径中每一段分别编码，保留 / 分隔符
    const encodedPath = filePath.split('/').map(encodeURIComponent).join('/')
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${branch}`

    const headers = {
      'Accept': 'application/vnd.github.v3.raw', // 直接获取原始内容，无需 Base64 解码
      'User-Agent': 'MambaCoder-Homepage'
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(apiUrl, { headers })

    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ error: `文件不存在: ${filePath}` })
      }
      if (response.status === 403) {
        return res.status(503).json({ error: 'GitHub API 速率限制，请稍后重试' })
      }
      return res.status(response.status).json({ error: `GitHub API 错误: ${response.statusText}` })
    }

    // 根据文件类型确定 Content-Type
    const contentType = filePath.endsWith('.json') ? 'application/json' : 'text/plain'
    const data = await response.text()

    // 写入缓存
    cache.set(cacheKey, {
      data,
      contentType,
      timestamp: Date.now()
    })

    // 限制缓存大小，防止内存泄漏
    if (cache.size > 100) {
      const oldestKey = cache.keys().next().value
      cache.delete(oldestKey)
    }

    res.setHeader('X-Cache', 'MISS')
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600')
    return sendResponse(res, data, contentType)

  } catch (err) {
    console.error('GitHub API 请求失败:', err)
    return res.status(500).json({ error: '服务器内部错误', detail: err.message })
  }
}

/**
 * 统一响应发送
 */
function sendResponse(res, data, contentType) {
  // 允许跨域（Vercel 同域名下不需要，但保留以防自定义域名场景）
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Content-Type', `${contentType}; charset=utf-8`)
  return res.status(200).send(data)
}
