/**
 * 数据服务层
 *
 * 统一封装各模块的数据获取逻辑
 *
 * 数据源策略（自动切换）：
 *  1. 优先从 GitHub 仓库读取（通过 Vercel Serverless API 中转）
 *  2. GitHub 未配置或请求失败时，降级到本地 public/data/*.json
 *
 * 视图组件只需调用一个 async 函数即可获取处理后的数据，无需关心数据来源
 */
import { processEntries } from '@/config/content.config.js'
import {
  GITHUB_ENABLED,
  GITHUB_DATA_ROOT,
  dataPathMap,
  getGitHubFilePath,
  getGitHubRawConfig
} from '@/config/github.config.js'

// ==================== 通用 fetch 封装 ====================

/**
 * 从本地 public/data/ 目录加载 JSON
 */
async function fetchLocalJson(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`加载本地数据失败: ${path} (${res.status})`)
  return res.json()
}

/**
 * 从本地 public/data/ 目录加载文本文件
 */
async function fetchLocalText(path) {
  const res = await fetch(path)
  if (!res.ok) throw new Error(`加载本地文件失败: ${path} (${res.status})`)
  return res.text()
}

/**
 * 通过 Vercel Serverless API 从 GitHub 仓库加载文件
 * @param {string} repoPath - 文件在仓库中的路径（如 'data/projects.json'）
 * @returns {Promise<Response>} - fetch Response 对象
 */
async function fetchFromGitHub(repoPath) {
  const res = await fetch(`/api/github?path=${encodeURIComponent(repoPath)}`)
  if (!res.ok) {
    throw new Error(`GitHub 数据加载失败: ${repoPath} (${res.status})`)
  }
  return res
}

/**
 * 智能加载 JSON 数据：优先 GitHub，降级本地
 * @param {string} moduleKey - 数据模块名（对应 dataPathMap 中的 key）
 * @param {string} localPath - 本地降级路径（如 '/data/projects.json'）
 * @returns {Promise<any>} - 解析后的 JSON 数据
 */
async function smartFetchJson(moduleKey, localPath) {
  // 如果 GitHub 数据源已启用，优先从 GitHub 读取
  if (GITHUB_ENABLED && dataPathMap[moduleKey]) {
    try {
      const repoPath = getGitHubFilePath(dataPathMap[moduleKey])
      const res = await fetchFromGitHub(repoPath)
      return await res.json()
    } catch (err) {
      console.warn(`[数据服务] GitHub 加载失败，降级到本地: ${moduleKey}`, err.message)
    }
  }
  // 降级到本地
  return fetchLocalJson(localPath)
}

/**
 * 智能加载文本文件：优先 GitHub，降级本地
 * @param {string} repoRelativePath - 文件相对于 GITHUB_DATA_ROOT 的路径
 * @param {string} localPath - 本地降级路径
 * @returns {Promise<string>} - 文件文本内容
 */
async function smartFetchText(repoRelativePath, localPath) {
  if (GITHUB_ENABLED) {
    try {
      const repoPath = getGitHubFilePath(repoRelativePath)
      const res = await fetchFromGitHub(repoPath)
      return await res.text()
    } catch (err) {
      console.warn(`[数据服务] GitHub 加载失败，降级到本地: ${repoRelativePath}`, err.message)
    }
  }
  return fetchLocalText(localPath)
}

// ==================== 首页数据 ====================
export async function getHomeData() {
  return await smartFetchJson('home', '/data/home.json')
}

// ==================== 项目 ====================
export async function getProjects() {
  const data = await smartFetchJson('projects', '/data/projects.json')
  return processEntries(data)
}

// ==================== 工具 ====================
export async function getTools() {
  const data = await smartFetchJson('tools', '/data/tools.json')
  return processEntries(data)
}

// ==================== 游戏 ====================
/**
 * 获取处理后的游戏列表（不含 resolvedUrl）
 * URL 由组件层动态计算，确保登录后 token 自动更新
 */
export async function getGames() {
  const data = await smartFetchJson('games', '/data/games.json')
  return processEntries(data)
}

// ==================== 知识库 ====================
export async function getKnowledgeDocs() {
  const data = await smartFetchJson('knowledgeDocs', '/data/knowledge/index.json')
  return processEntries(data)
}

export async function getKnowledgeNotes() {
  return await smartFetchJson('knowledgeNotes', '/data/knowledge/notes.json')
}

/**
 * 按需加载单篇知识库文章的 Markdown 内容
 * @param {string} filename - 文章文件名（如 'java-concurrency.md'）
 * @returns {Promise<string>} - Markdown 原始文本
 */
export async function getKnowledgeContent(filename) {
  return await smartFetchText(`knowledge/${filename}`, `/data/knowledge/${filename}`)
}

// ==================== 博客 ====================
export async function getBlogPosts() {
  const data = await smartFetchJson('blogPosts', '/data/blog/index.json')
  return processEntries(data)
}

/**
 * 按需加载单篇博客文章的 Markdown 内容
 * @param {string} filename - 文章文件名（如 'rag-in-practice.md'）
 * @returns {Promise<string>} - Markdown 原始文本
 */
export async function getBlogContent(filename) {
  return await smartFetchText(`blog/${filename}`, `/data/blog/${filename}`)
}

// ==================== 音乐 ====================

/**
 * 获取音乐音频文件的 URL
 *
 * 策略：
 *  - GitHub 启用时：使用 GitHub Raw URL 直接访问（绕过 Serverless 中转的大小限制）
 *    格式：https://raw.githubusercontent.com/{owner}/{repo}/{branch}/data/music/{filename}
 *  - GitHub 未启用时：使用本地 public 路径
 *
 * @param {string} filename - 音频文件名（如 '人模狗样-20250302.mp3'）
 * @returns {string} - 音频文件 URL
 */
export function getMusicAudioUrl(filename) {
  if (GITHUB_ENABLED) {
    // 使用 GitHub Raw URL 直接访问音频文件，不经过 Serverless 中转
    const { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH } = getGitHubRawConfig()
    const root = GITHUB_DATA_ROOT ? `${GITHUB_DATA_ROOT}/` : ''
    return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${root}music/${encodeURIComponent(filename)}`
  }
  return `/data/music/${filename}`
}

/**
 * 按需加载歌词文件内容
 * @param {string} filename - 歌词文件名（如 '人模狗样歌词.txt'）
 * @returns {Promise<string>} - 歌词文本内容
 */
export async function getMusicLyrics(filename) {
  return await smartFetchText(`music/${filename}`, `/data/music/${filename}`)
}
