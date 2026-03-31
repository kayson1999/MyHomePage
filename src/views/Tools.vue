<template>
  <div class="tools">
    <!-- 游戏区域（放在最前面） -->
    <section class="content-section games-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag font-mono">{{ pageConfig.gamesSectionTag }}</span>
          <h2 class="section-title">{{ pageConfig.gamesSectionTitle }}</h2>
        </div>
        <div class="tools-grid">
<template v-for="entry in paginatedGames" :key="entry.id">
            <!-- external + 已登录: 外部跳转（带 sso_token） -->
            <SpotlightCard v-if="entry.entryType === 'external' && getEntryUrl(entry)">
            <a
               :href="getEntryUrl(entry)" target="_blank" rel="noopener" class="tool-card clockin-card">
              <div class="tool-icon-box" :style="{ background: entry.coverColor }">
                <span class="tool-icon">{{ entry.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ entry.name }}</h3>
                <p class="tool-desc">{{ entry.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action">进入 →</span>
            </a>
            </SpotlightCard>
            <!-- external + 未登录 + 需要认证: 点击弹出登录框 -->
            <SpotlightCard v-else-if="entry.entryType === 'external' && entry.authMode === 'sso_token' && !authStore.isLoggedIn()">
            <div
                 class="tool-card clockin-card" style="cursor: pointer" @click="handleGameClick(entry)">
              <div class="tool-icon-box" :style="{ background: entry.coverColor }">
                <span class="tool-icon">{{ entry.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ entry.name }}</h3>
                <p class="tool-desc">{{ entry.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action">登录后进入 🔒</span>
            </div>
            </SpotlightCard>
            <!-- iframe: 弹窗打开 -->
            <SpotlightCard v-else-if="entry.entryType === 'iframe' && getEntryUrl(entry)">
            <div
                 class="tool-card" @click="openGame(entry)" style="cursor: pointer">
              <div class="tool-icon-box" :style="{ background: entry.coverColor }">
                <span class="tool-icon">{{ entry.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ entry.name }}</h3>
                <p class="tool-desc">{{ entry.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action">开始 ▶</span>
            </div>
            </SpotlightCard>
            <!-- 即将上线 -->
            <SpotlightCard v-else>
            <div class="tool-card">
              <div class="tool-icon-box" :style="{ background: entry.coverColor }">
                <span class="tool-icon">{{ entry.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ entry.name }}</h3>
                <p class="tool-desc">{{ entry.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in entry.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action tool-coming">即将上线</span>
            </div>
            </SpotlightCard>
          </template>
        </div>

        <!-- 游戏分页 -->
        <Pagination v-if="gameTotalPages > 1" v-model:currentPage="gameCurrentPage" :totalPages="gameTotalPages" />
      </div>
    </section>

    <!-- 工具区域 -->
    <section class="content-section">
      <div class="container">
        <div class="section-header">
          <span class="section-tag font-mono">{{ pageConfig.toolsSectionTag }}</span>
          <h2 class="section-title">{{ pageConfig.toolsSectionTitle }}</h2>
        </div>
        <div class="tools-grid">
          <template v-for="tool in paginatedTools" :key="tool.id">
            <!-- external + 已登录: 外部跳转（带 sso_token） -->
            <SpotlightCard v-if="tool.entryType === 'external' && getEntryUrl(tool)">
            <a :href="getEntryUrl(tool)" target="_blank" rel="noopener" class="tool-card clockin-card">
              <div class="tool-icon-box" :style="{ background: tool.coverColor }">
                <span class="tool-icon">{{ tool.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-desc">{{ tool.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in tool.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action">进入 →</span>
            </a>
            </SpotlightCard>
            <!-- external + 未登录 + 需要认证: 点击弹出登录框 -->
            <SpotlightCard v-else-if="tool.entryType === 'external' && tool.authMode === 'sso_token' && !authStore.isLoggedIn()">
            <div class="tool-card clockin-card" style="cursor: pointer" @click="handleGameClick(tool)">
              <div class="tool-icon-box" :style="{ background: tool.coverColor }">
                <span class="tool-icon">{{ tool.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-desc">{{ tool.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in tool.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action">登录后进入 🔒</span>
            </div>
            </SpotlightCard>
            <!-- route 类型 -->
            <SpotlightCard v-else-if="tool.entryType === 'route' && tool.url !== '#'">
            <div class="tool-card">
              <div class="tool-icon-box" :style="{ background: tool.coverColor }">
                <span class="tool-icon">{{ tool.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-desc">{{ tool.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in tool.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <router-link :to="tool.url" class="tool-action">进入 →</router-link>
            </div>
            </SpotlightCard>
            <!-- 即将上线 -->
            <SpotlightCard v-else>
            <div class="tool-card">
              <div class="tool-icon-box" :style="{ background: tool.coverColor }">
                <span class="tool-icon">{{ tool.icon }}</span>
              </div>
              <div class="tool-info">
                <h3 class="tool-name">{{ tool.name }}</h3>
                <p class="tool-desc">{{ tool.description }}</p>
                <div class="tool-tags">
                  <span class="tool-tag" v-for="tag in tool.tags" :key="tag">{{ tag }}</span>
                </div>
              </div>
              <span class="tool-action tool-coming">即将上线</span>
            </div>
            </SpotlightCard>
          </template>
        </div>

        <!-- 工具分页 -->
        <Pagination v-if="toolTotalPages > 1" v-model:currentPage="toolCurrentPage" :totalPages="toolTotalPages" />
      </div>
    </section>

    <!-- 游戏弹窗 -->
    <teleport to="body">
      <div class="game-modal" v-if="activeGame" @click.self="activeGame = null">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">{{ activeGame.icon }} {{ activeGame.name }}</h3>
            <button class="modal-close" @click="activeGame = null">✕</button>
          </div>
          <div class="modal-body">
            <iframe v-if="getEntryUrl(activeGame)" :src="getEntryUrl(activeGame)"
              class="game-iframe" frameborder="0" allow="autoplay"></iframe>
            <div v-else class="game-placeholder">
              <span class="placeholder-icon">🚧</span>
              <p>游戏正在开发中，敬请期待...</p>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { toolsPageConfig } from '@/config/site.config.js'
import { getTools, getGames } from '@/services/data.service.js'
import { resolveEntryUrl } from '@/config/content.config.js'
import { authStore } from '@/services/auth.store.js'
import { SpotlightCard, Pagination } from '@/components/common'

export default {
  name: 'Tools',
  setup() {
    const pageConfig = toolsPageConfig
    const activeGame = ref(null)
    const loading = ref(true)

    // 通过数据服务层异步获取处理后的工具和游戏列表
    const tools = ref([])
    const games = ref([])

    onMounted(async () => {
      try {
        const [toolsData, gamesData] = await Promise.all([getTools(), getGames()])
        tools.value = toolsData
        games.value = gamesData
      } catch (e) {
        console.error('加载工具/游戏数据失败:', e)
      } finally {
        loading.value = false
      }
    })

    /**
     * 动态获取条目 URL（传入响应式 token，确保登录/登出时自动重新渲染）
     * Vue 会追踪 authStore.state.token 的依赖，token 变化时自动触发模板更新
     */
    const getEntryUrl = (entry) => {
      return resolveEntryUrl(entry, authStore.state.token)
    }

    const openGame = (game) => {
      activeGame.value = game
    }

    /**
     * 处理需要登录的游戏卡片点击
     * 未登录时弹出登录框，不进行跳转
     */
    const handleGameClick = (entry) => {
      if (!authStore.isLoggedIn()) {
        authStore.openLoginModal()
      }
    }

    // 分页
    const pageSize = 3
    const gameCurrentPage = ref(1)
    const toolCurrentPage = ref(1)
    const gameTotalPages = computed(() => Math.ceil(games.value.length / pageSize))
    const toolTotalPages = computed(() => Math.ceil(tools.value.length / pageSize))
    const paginatedGames = computed(() => {
      const start = (gameCurrentPage.value - 1) * pageSize
      return games.value.slice(start, start + pageSize)
    })
    const paginatedTools = computed(() => {
      const start = (toolCurrentPage.value - 1) * pageSize
      return tools.value.slice(start, start + pageSize)
    })

    return {
      pageConfig, activeGame, tools, games, openGame, getEntryUrl, handleGameClick, authStore,
      paginatedGames, paginatedTools,
      gameCurrentPage, toolCurrentPage, gameTotalPages, toolTotalPages
    }
  },
  components: { SpotlightCard, Pagination }
}
</script>

<style scoped>
.font-mono { font-family: var(--font-mono); }
.container { max-width: 1280px; margin: 0 auto; }

/* ========== 通用 ========== */
.content-section {
  padding: var(--space-16) var(--space-6);
}

.games-section {
  background: var(--bg-secondary);
  padding-top: var(--space-20, 5rem);
}

.section-header {
  text-align: center;
  margin-bottom: var(--space-12);
}

.section-tag {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--neon-cyan);
  display: block;
  margin-bottom: var(--space-3);
}

.section-title {
  font-size: var(--text-3xl);
  font-weight: 700;
  color: var(--text-primary);
}

/* ========== 工具网格 ========== */
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: var(--space-6);
}

.tool-card {
  display: flex;
  align-items: center;
  gap: var(--space-5);
  padding: var(--space-6);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  transition: all 0.3s ease;
}

.tool-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow);
}

.tool-icon-box {
  width: 56px; height: 56px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.tool-icon { font-size: 1.6rem; }

.tool-info { flex: 1; min-width: 0; }

.tool-name {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.tool-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.5;
  margin-bottom: var(--space-2);
}

.tool-tags {
  display: flex;
  gap: var(--space-2);
}

.tool-tag {
  padding: 1px var(--space-2);
  background: rgba(0, 255, 136, 0.06);
  border: 1px solid rgba(0, 255, 136, 0.12);
  color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: 10px;
  font-family: var(--font-mono);
}

.tool-action {
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  background: var(--gradient-primary);
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.tool-action:hover {
  box-shadow: 0 4px 15px rgba(0, 255, 136, 0.3);
  transform: translateY(-1px);
}

.tool-coming {
  background: var(--bg-tertiary);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
  cursor: default;
}

.tool-coming:hover {
  box-shadow: none;
  transform: none;
}

/* 外部跳转入口卡片 */
.clockin-card {
  text-decoration: none;
  color: inherit;
}

/* ========== 游戏弹窗 ========== */
.game-modal {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-8);
}

.modal-content {
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: var(--shadow-glow-strong);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-4) var(--space-6);
  border-bottom: 1px solid var(--border-color);
}

.modal-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.modal-close {
  width: 32px; height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.2);
  border-radius: var(--radius-md);
  color: var(--neon-pink);
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: var(--neon-pink);
}

.modal-body {
  flex: 1;
  min-height: 500px;
}

.game-iframe {
  width: 100%;
  height: 100%;
  min-height: 500px;
  border: none;
}

.game-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: var(--text-muted);
}

.placeholder-icon {
  font-size: 4rem;
  margin-bottom: var(--space-4);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .tools-grid { grid-template-columns: 1fr; }
  .tool-card { flex-direction: column; text-align: center; }

  .content-section { padding: var(--space-12) var(--space-4); }
  .game-modal { padding: var(--space-4); }
}
</style>
