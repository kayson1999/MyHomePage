/**
 * GitHub 数据源配置
 *
 * 网站的项目、知识库、博客等数据可以从 GitHub 仓库动态读取
 * 你只需将数据 JSON 文件推送到 GitHub 仓库，网站会自动通过 Serverless API 读取
 *
 * 使用方式：
 *  1. 在 GitHub 上创建/使用一个仓库存放数据文件（可以是当前仓库，也可以是独立仓库）
 *  2. 在 Vercel 环境变量中配置 GITHUB_TOKEN（可选，私有仓库必须）
 *  3. 在 Vercel 环境变量中配置 GITHUB_OWNER 和 GITHUB_REPO
 *  4. 将数据文件按照下方 dataPathMap 的路径结构放入仓库
 */

// ==================== GitHub 仓库配置 ====================

/** GitHub 仓库拥有者（用户名或组织名），通过环境变量配置 */
export const GITHUB_OWNER = import.meta.env.VITE_GITHUB_OWNER || ''

/** GitHub 仓库名称，通过环境变量配置 */
export const GITHUB_REPO = import.meta.env.VITE_GITHUB_REPO || ''

/** GitHub 数据文件所在的分支，默认 main */
export const GITHUB_BRANCH = import.meta.env.VITE_GITHUB_BRANCH || 'main'

/** 数据文件在仓库中的根目录（如果数据文件放在子目录下） */
export const GITHUB_DATA_ROOT = import.meta.env.VITE_GITHUB_DATA_ROOT || 'data'

// ==================== 是否启用 GitHub 数据源 ====================

/**
 * 当 GITHUB_OWNER 和 GITHUB_REPO 都配置时，自动启用 GitHub 数据源
 * 未配置时降级到本地 public/data/ 目录读取（保持原有行为）
 */
export const GITHUB_ENABLED = !!(GITHUB_OWNER && GITHUB_REPO)

// ==================== 数据路径映射 ====================

/**
 * 数据文件在 GitHub 仓库中的路径映射
 * key: 数据模块名（与 data.service.js 中的函数对应）
 * value: 文件在仓库 GITHUB_DATA_ROOT 目录下的相对路径
 *
 * 例如：GITHUB_DATA_ROOT = 'data'，则 projects 对应 data/projects.json
 */
export const dataPathMap = {
  home: 'home.json',
  projects: 'projects.json',
  tools: 'tools.json',
  games: 'games.json',
  knowledgeDocs: 'knowledge/index.json',
  knowledgeNotes: 'knowledge/notes.json',
  blogPosts: 'blog/index.json',
  music: 'music/index.json'
}

/**
 * 获取文件在 GitHub 仓库中的完整路径
 * @param {string} relativePath - 相对于 GITHUB_DATA_ROOT 的路径
 * @returns {string} - 完整路径
 */
export function getGitHubFilePath(relativePath) {
  const root = GITHUB_DATA_ROOT ? `${GITHUB_DATA_ROOT}/` : ''
  return `${root}${relativePath}`
}

/**
 * 获取构建 GitHub Raw URL 所需的配置
 * 用于直接访问大文件（如音频），绕过 Serverless 中转
 * @returns {{ GITHUB_OWNER: string, GITHUB_REPO: string, GITHUB_BRANCH: string }}
 */
export function getGitHubRawConfig() {
  return { GITHUB_OWNER, GITHUB_REPO, GITHUB_BRANCH }
}
