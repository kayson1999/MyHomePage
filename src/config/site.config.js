/**
 * 站点全局配置
 * 
 * 仅包含全站共享的元信息：品牌、导航、各页面标题/副标题
 * 各页面的业务数据（如首页终端内容、About 详情）在各自的数据文件中维护
 */
import { ROUTES } from '@/router/routes.js'

// ==================== 品牌信息 ====================
export const brandConfig = {
  name: 'MambaCoder',
  namePrefix: 'Mamba',
  nameAccent: 'Coder',
  logo: '</>',
  tagline: '健康生活 开心工作 早日财富自由',
  copyright: {
    year: '2026',
    message: 'Crafted with',
    heart: '♥',
    suffix: 'and lots of',
    code: 'warning, error, debug...'
  }
}

// ==================== 导航配置 ====================
export const navConfig = {
  links: [
    { path: ROUTES.HOME, label: '首页', icon: '🏠', desc: '关于我 · 技术栈 · 个人简介', color: '#A855F7' },
    { path: ROUTES.TOOLS, label: '游戏', icon: '🎮', desc: '在线工具 · 休闲小游戏', color: '#6366F1' },
    { path: ROUTES.WORKSPACE, label: '项目', icon: '🚀', desc: '个人项目 · 知识库', color: '#818CF8' },
    { path: ROUTES.BLOG, label: '博客', icon: '✍️', desc: '技术文章 · 生活随笔', color: '#F472B6' }
  ],
  githubUrl: 'https://github.com/kayson1999',
  socialLinks: [
    { name: 'GitHub', url: 'https://github.com/kayson1999' },
    { name: 'Wechat', url: '#', type: 'qrcode', image: '/images/wechat-qrcode.jpg', label: '微信号: k_15240' }
  ]
}

// ==================== 各页面标题配置（仅文案，不含业务数据） ====================

export const workspacePageConfig = {
  tag: '// workspace',
  title: '项目与',
  titleGradient: '知识库',
  desc: '学习 学习 学习',
  filterTags: ['全部', '项目', '知识库']
}

export const toolsPageConfig = {
  tag: '// 游戏 & 工具',
  title: '实用工具与',
  titleGradient: '趣味游戏',
  desc: '玩游戏用工具',
  toolsSectionTag: '// 工具',
  toolsSectionTitle: '多啦A梦工具箱',
  gamesSectionTag: '// 游戏',
  gamesSectionTitle: '趣味小游戏',
  tabs: [
    { id: 'all', label: '全部', icon: '📦' },
    { id: 'tools', label: '工具', icon: '🛠️' },
    { id: 'games', label: '游戏', icon: '🎮' }
  ]
}

export const blogPageConfig = {
  tag: '// 个人博客',
  title: '思考与',
  titleGradient: '记录',
  desc: '分享生活～',
  categories: ['全部', '生活', '音乐', '电影', '读书']
}


