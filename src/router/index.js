/**
 * 路由配置
 * 集中管理路由表，从 main.js 中解耦
 */
import { createRouter, createWebHistory } from 'vue-router'
import { ROUTES } from './routes.js'

const routeTable = [
  {
    path: ROUTES.HOME,
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: { title: '首页' }
  },
  {
    path: ROUTES.WORKSPACE,
    name: 'Workspace',
    component: () => import('@/views/Workspace.vue'),
    meta: { title: '项目与知识库' }
  },
  {
    path: ROUTES.PROJECTS,
    redirect: ROUTES.WORKSPACE
  },
  {
    path: ROUTES.KNOWLEDGE,
    redirect: ROUTES.WORKSPACE
  },
  {
    path: ROUTES.TOOLS,
    name: 'Tools',
    component: () => import('@/views/Tools.vue'),
    meta: { title: '游戏/工具' }
  },
  {
    path: ROUTES.BLOG,
    name: 'Blog',
    component: () => import('@/views/Blog.vue'),
    meta: { title: '博客' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes: routeTable,
  scrollBehavior() {
    return { top: 0 }
  }
})

// 路由守卫：更新页面标题
router.afterEach((to) => {
  const baseTitle = 'MambaCoder'
  document.title = to.meta.title ? `${to.meta.title} — ${baseTitle}` : baseTitle
})

export default router
