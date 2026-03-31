<template>
  <div class="workspace">
    <!-- 页面头部 -->
    <PageHero :tag="pageConfig.tag" :title="pageConfig.title" :gradient="pageConfig.titleGradient" :desc="pageConfig.desc" />

    <!-- 筛选栏 -->
    <FilterBar :items="filterTags" v-model="activeFilter" :sticky="false" />

    <!-- 项目列表 -->
    <section class="projects-section">
      <div class="container">
        <div v-if="loading" class="loading-state">
          <span class="loading-icon">⏳</span>
          <span class="loading-text">加载中...</span>
        </div>

        <div v-else class="projects-list">
          <div class="project-row" v-for="item in paginatedItems" :key="item.id">
            <!-- 左侧：封面 -->
            <div class="project-cover" :style="{ background: item.coverColor }">
              <span class="cover-icon">{{ item.icon }}</span>
              <div class="cover-overlay"></div>
              <span class="project-status" :class="item.statusClass">
                {{ item.status }}
              </span>
              <!-- 类型标识 -->
              <span class="type-badge" :class="item.type === 'knowledge' ? 'type-knowledge' : 'type-project'">
                {{ item.type === 'knowledge' ? '📚 知识库' : '🔨 项目' }}
              </span>
            </div>

            <!-- 右侧：信息 -->
            <div class="project-info">
              <div class="info-header">
                <h3 class="project-name">{{ item.name }}</h3>
                <div class="project-stats">
                  <span class="stat" v-if="item.stars">
                    <span class="stat-icon">⭐</span> {{ item.stars }}
                  </span>
                  <span class="stat" v-if="item.forks">
                    <span class="stat-icon">🔀</span> {{ item.forks }}
                  </span>
                </div>
              </div>

              <p class="project-desc">{{ item.description }}</p>

              <!-- 功能亮点 / 知识点 -->
              <div class="project-features" v-if="item.features && item.features.length">
                <div class="features-header">
                  <span class="features-title">{{ item.type === 'knowledge' ? '📝 知识点' : '✨ 功能亮点' }}</span>
                  <span class="features-count">{{ item.features.length }} 项</span>
                </div>
                <div class="features-list">
                  <div class="feature-item" v-for="(feat, i) in item.features" :key="i">
                    <span class="feature-text">{{ feat }}</span>
                  </div>
                </div>
              </div>

              <!-- 技术栈 -->
              <div class="project-tech-stack" v-if="item.techStack">
                <div class="tech-stack-grid">
                  <div class="tech-item" v-for="(value, key) in item.techStack" :key="key">
                    <span class="tech-label">{{ key }}</span>
                    <span class="tech-value">{{ value }}</span>
                  </div>
                </div>
              </div>

              <div class="project-tags">
                <span class="tag-chip" v-for="tag in item.tags" :key="tag">{{ tag }}</span>
              </div>

              <div class="project-actions">
                <div class="project-meta">
                  <span class="meta-item" v-if="item.language">
                    <span class="lang-dot" :style="{ background: item.langColor }"></span>
                    {{ item.language }}
                  </span>
                  <span class="meta-item" v-if="item.updatedAt">
                    📅 {{ item.updatedAt }}
                  </span>
                </div>
                <div class="action-btns">
                  <!-- 项目类型：体验 + 源码 -->
                  <template v-if="item.type === 'project'">
                    <a v-if="item.demo" :href="item.demo" class="action-btn action-demo" target="_blank">
                      <span class="btn-icon">🌐</span> 立马体验
                    </a>
                    <a v-if="item.github" :href="item.github" class="action-btn action-code" target="_blank">
                      <span class="btn-icon">📂</span> 源码地址
                    </a>
                  </template>
                  <!-- 知识库类型：查看详情（Markdown 阅读器） -->
                  <template v-else-if="item.type === 'knowledge'">
                    <button v-if="item.file" class="action-btn action-view" @click="openReader(item)">
                      <span class="btn-icon">📖</span> 查看详情
                    </button>
                    <a v-else-if="item.link" :href="item.link" class="action-btn action-view" target="_blank">
                      <span class="btn-icon">📖</span> 查看详情
                    </a>
                  </template>
                </div>
              </div>
            </div>
          </div>
        </div>

        <EmptyState v-if="!loading && filteredItems.length === 0" icon="🔍" text="暂无该分类下的内容" />

        <!-- 分页 -->
        <Pagination v-if="!loading && totalPages > 1" v-model:currentPage="currentPage" :totalPages="totalPages" />
      </div>
    </section>

    <!-- Markdown 阅读器弹窗 -->
    <Teleport to="body">
      <Transition name="reader-fade">
        <div v-if="showReader" class="reader-overlay" @click.self="closeReader">
          <div class="reader-panel">
            <div class="reader-header">
              <div class="reader-title-area">
                <h2 class="reader-title">{{ currentItem.name }}</h2>
                <div class="reader-meta">
                  <span class="reader-badge">📚 知识库</span>
                  <span class="reader-date font-mono" v-if="currentItem.updatedAt">📅 {{ currentItem.updatedAt }}</span>
                </div>
              </div>
              <button class="reader-close" @click="closeReader">&times;</button>
            </div>
            <div class="reader-body">
              <div v-if="contentLoading" class="loading-state" style="padding: 4rem 0;">
                <span class="loading-icon">⏳</span>
                <span class="loading-text">加载内容中...</span>
              </div>
              <div v-else class="reader-content" v-html="readerContent"></div>
            </div>
            <div class="reader-footer" v-if="currentItem.tags && currentItem.tags.length">
              <div class="reader-tags">
                <span class="reader-tag font-mono" v-for="tag in currentItem.tags" :key="tag">#{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { workspacePageConfig } from '@/config/site.config.js'
import { getProjects, getKnowledgeContent } from '@/services/data.service.js'
import { PageHero, FilterBar, EmptyState, Pagination } from '@/components/common'

export default {
  name: 'Workspace',
  components: { PageHero, FilterBar, EmptyState, Pagination },
  setup() {
    const pageConfig = workspacePageConfig
    const loading = ref(true)

    // 筛选
    const activeFilter = ref('全部')
    const filterTags = pageConfig.filterTags
    const items = ref([])

    const filteredItems = computed(() => {
      if (activeFilter.value === '全部') return items.value
      if (activeFilter.value === '项目') return items.value.filter(p => p.type === 'project')
      if (activeFilter.value === '知识库') return items.value.filter(p => p.type === 'knowledge')
      return items.value
    })

    // 分页
    const pageSize = 3
    const currentPage = ref(1)
    const totalPages = computed(() => Math.ceil(filteredItems.value.length / pageSize))
    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * pageSize
      return filteredItems.value.slice(start, start + pageSize)
    })
    // 切换筛选时重置页码
    watch(activeFilter, () => { currentPage.value = 1 })

    // 数据加载
    onMounted(async () => {
      try {
        items.value = await getProjects()
      } catch (e) {
        console.error('加载数据失败:', e)
      } finally {
        loading.value = false
      }
    })

    // ==================== Markdown 阅读器 ====================
    const showReader = ref(false)
    const currentItem = ref({})
    const readerContent = ref('')
    const contentLoading = ref(false)

    /**
     * 配置 marked 选项
     * 使用 marked 库实现完整的 Markdown → HTML 转换
     * 支持 GFM（GitHub Flavored Markdown）、表格、任务列表、代码高亮等
     */
    marked.setOptions({
      gfm: true,        // 启用 GitHub 风格 Markdown
      breaks: true,     // 换行符转为 <br>
    })

    // 自定义渲染器：链接在新标签页打开，图片添加样式
    const renderer = new marked.Renderer()
    renderer.link = function ({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
    }
    renderer.image = function ({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<img src="${href}" alt="${text}"${titleAttr} style="max-width:100%;border-radius:8px;margin:1rem 0;" />`
    }
    marked.use({ renderer })

    function markdownToHtml(md) {
      return marked.parse(md)
    }

    const openReader = async (item) => {
      currentItem.value = { ...item }
      readerContent.value = ''
      showReader.value = true
      document.body.style.overflow = 'hidden'

      if (item.file) {
        contentLoading.value = true
        try {
          const mdText = await getKnowledgeContent(item.file)
          readerContent.value = markdownToHtml(mdText)
        } catch (e) {
          console.error('加载知识库内容失败:', e)
          readerContent.value = '<p style="color:#FF5F56;">⚠️ 内容加载失败，请稍后重试</p>'
        } finally {
          contentLoading.value = false
        }
      }
    }

    const closeReader = () => {
      showReader.value = false
      document.body.style.overflow = ''
    }

    return {
      pageConfig, loading,
      activeFilter, filterTags, filteredItems, paginatedItems,
      currentPage, totalPages,
      // Markdown 阅读器
      showReader, currentItem, readerContent, contentLoading, openReader, closeReader
    }
  }
}
</script>

<style scoped>
.container { max-width: 1280px; margin: 0 auto; }

/* ========== 加载状态 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20) 0;
  gap: var(--space-4);
}

.loading-icon {
  font-size: 2.5rem;
  animation: spin 1.5s linear infinite;
}

.loading-text {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== 项目列表 ========== */
.projects-section {
  padding: var(--space-16) var(--space-6);
}

.projects-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-8);
}

.project-row {
  display: flex;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
  transition: all 0.4s ease;
}

.project-row:hover {
  transform: translateY(-4px);
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow);
}

.project-cover {
  flex-shrink: 0;
  width: 280px;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.cover-icon {
  font-size: 4rem;
  position: relative;
  z-index: 2;
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  transition: transform 0.4s ease;
}

.project-row:hover .cover-icon {
  transform: scale(1.15) rotate(-5deg);
}

.cover-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent 60%, var(--bg-card) 100%);
}

.project-status {
  position: absolute;
  top: var(--space-3);
  left: var(--space-3);
  padding: 2px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  z-index: 3;
  backdrop-filter: blur(8px);
}

.type-badge {
  position: absolute;
  bottom: var(--space-3);
  left: var(--space-3);
  padding: 2px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-weight: 600;
  font-family: var(--font-mono);
  z-index: 3;
  backdrop-filter: blur(8px);
}

.type-project {
  background: rgba(0, 212, 255, 0.15);
  color: #00D4FF;
  border: 1px solid rgba(0, 212, 255, 0.25);
}

.type-knowledge {
  background: rgba(168, 85, 247, 0.15);
  color: #C084FC;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.status-active {
  background: rgba(0, 230, 118, 0.2);
  color: #00E676;
  border: 1px solid rgba(0, 230, 118, 0.3);
}

.status-done {
  background: rgba(0, 212, 255, 0.15);
  color: #00D4FF;
  border: 1px solid rgba(0, 212, 255, 0.25);
}

.status-dev {
  background: rgba(255, 217, 61, 0.2);
  color: #FFD93D;
  border: 1px solid rgba(255, 217, 61, 0.3);
}

.project-info {
  flex: 1;
  padding: var(--space-6) var(--space-8);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--space-3);
}

.project-name {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
  transition: color 0.3s ease;
}

.project-row:hover .project-name {
  color: var(--neon-cyan);
}

.project-stats {
  display: flex;
  gap: var(--space-4);
  flex-shrink: 0;
}

.stat {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.project-desc {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  line-height: 1.7;
  margin-bottom: var(--space-4);
}

.project-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-5);
}

.tag-chip {
  padding: 2px var(--space-3);
  background: rgba(0, 255, 136, 0.08);
  border: 1px solid rgba(0, 255, 136, 0.15);
  color: var(--color-primary-light);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 500;
  font-family: var(--font-mono);
}

/* ========== 功能亮点 ========== */
.project-features {
  margin-bottom: var(--space-4);
}

.features-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-3);
}

.features-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--color-primary-light);
}

.features-count {
  font-size: 11px;
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: 1px var(--space-2);
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-sm);
}

.features-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(168, 85, 247, 0.04);
  border: 1px solid rgba(168, 85, 247, 0.08);
  border-radius: var(--radius-lg);
}

.feature-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-2);
  padding: var(--space-1) var(--space-2);
}

.feature-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  line-height: 1.5;
}

/* ========== 技术栈 ========== */
.project-tech-stack {
  margin-bottom: var(--space-4);
}

.tech-stack-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tech-item {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  background: rgba(0, 245, 255, 0.05);
  border: 1px solid rgba(0, 245, 255, 0.1);
  border-radius: var(--radius-sm);
  font-size: 11px;
  font-family: var(--font-mono);
}

.tech-label {
  color: var(--neon-cyan);
  font-weight: 600;
  text-transform: capitalize;
}

.tech-label::after {
  content: ':';
  margin-right: 2px;
}

.tech-value {
  color: var(--text-muted);
}

.project-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: var(--space-4);
  border-top: 1px solid var(--border-color);
}

.project-meta {
  display: flex;
  gap: var(--space-4);
  align-items: center;
}

.meta-item {
  font-size: var(--text-xs);
  color: var(--text-muted);
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-family: var(--font-mono);
}

.lang-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.action-btns {
  display: flex;
  gap: var(--space-3);
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-5);
  border-radius: var(--radius-md);
  font-size: var(--text-sm);
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-icon {
  font-size: 14px;
}

.action-demo {
  background: var(--gradient-primary);
  color: white;
}

.action-demo:hover {
  box-shadow: 0 4px 18px rgba(0, 255, 136, 0.3);
  transform: translateY(-2px);
}

.action-code {
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
}

.action-code:hover {
  border-color: var(--neon-green);
  color: var(--neon-green);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.1);
}

.action-view {
  background: linear-gradient(135deg, #A855F7, #6366F1);
  color: white;
}

.action-view:hover {
  box-shadow: 0 4px 18px rgba(168, 85, 247, 0.4);
  transform: translateY(-2px);
}

/* ========== Markdown 阅读器 ========== */
.font-mono { font-family: var(--font-mono); }

.reader-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--space-8) var(--space-4);
  overflow-y: auto;
}

.reader-panel {
  width: 100%;
  max-width: 860px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
  overflow: hidden;
}

.reader-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--space-8) var(--space-8) var(--space-4);
  border-bottom: 1px solid var(--border-color);
}

.reader-title-area { flex: 1; margin-right: var(--space-4); }

.reader-title {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  line-height: 1.3;
}

.reader-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.reader-badge {
  padding: 3px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  background: rgba(168, 85, 247, 0.15);
  color: #C084FC;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.reader-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.reader-close {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;
}

.reader-close:hover {
  background: rgba(255, 95, 86, 0.15);
  border-color: rgba(255, 95, 86, 0.4);
  color: #FF5F56;
}

.reader-body {
  padding: var(--space-8);
  color: var(--text-secondary);
  line-height: 1.8;
  font-size: var(--text-base);
}

.reader-body h1 {
  font-size: var(--text-2xl);
  font-weight: 700;
  color: var(--text-primary);
  margin: var(--space-6) 0 var(--space-3);
}

.reader-body h2 {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--space-5) 0 var(--space-2);
  padding-bottom: var(--space-2);
  border-bottom: 1px solid var(--border-color);
}

.reader-body h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--space-4) 0 var(--space-2);
}

.reader-body h4 {
  font-size: var(--text-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--space-3) 0 var(--space-1);
}

.reader-body blockquote {
  border-left: 3px solid var(--neon-cyan);
  padding: var(--space-2) var(--space-4);
  margin: var(--space-4) 0;
  color: var(--text-muted);
  background: rgba(0, 245, 255, 0.03);
  border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
}

.reader-body pre {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  overflow-x: auto;
  margin: var(--space-4) 0;
}

.reader-body pre code {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--neon-green);
  background: none;
  padding: 0;
}

.reader-body code {
  font-family: var(--font-mono);
  font-size: 0.9em;
  background: rgba(0, 255, 136, 0.08);
  color: var(--neon-cyan);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
}

.reader-body ul {
  padding-left: var(--space-6);
  margin: var(--space-3) 0;
}

.reader-body li {
  margin-bottom: var(--space-1);
}

.reader-body strong {
  color: var(--text-primary);
  font-weight: 600;
}

.reader-body a {
  color: var(--neon-cyan);
  text-decoration: none;
  border-bottom: 1px solid rgba(0, 245, 255, 0.3);
  transition: all 0.2s;
}

.reader-body a:hover {
  color: var(--neon-green);
  border-bottom-color: var(--neon-green);
}

.reader-body hr {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--space-6) 0;
}

.reader-body table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--space-4) 0;
  font-size: var(--text-sm);
}

.reader-body table td {
  padding: var(--space-2) var(--space-3);
  border: 1px solid var(--border-color);
}

.reader-body table tr:first-child td {
  font-weight: 600;
  color: var(--text-primary);
  background: rgba(168, 85, 247, 0.06);
}

.reader-footer {
  padding: var(--space-4) var(--space-8) var(--space-6);
  border-top: 1px solid var(--border-color);
}

.reader-tags {
  display: flex;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.reader-tag {
  font-size: var(--text-xs);
  color: var(--color-primary-light);
}

/* ========== 阅读器动画 ========== */
.reader-fade-enter-active,
.reader-fade-leave-active {
  transition: opacity 0.3s ease;
}

.reader-fade-enter-active .reader-panel,
.reader-fade-leave-active .reader-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.reader-fade-enter-from,
.reader-fade-leave-to {
  opacity: 0;
}

.reader-fade-enter-from .reader-panel {
  transform: translateY(30px);
  opacity: 0;
}

.reader-fade-leave-to .reader-panel {
  transform: translateY(30px);
  opacity: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .projects-section { padding: var(--space-12) var(--space-4); }
  .project-row { flex-direction: column; }
  .project-cover { width: 100%; min-height: 160px; }
  .cover-overlay { background: linear-gradient(180deg, transparent 60%, var(--bg-card) 100%); }
  .project-info { padding: var(--space-5); }
  .info-header { flex-direction: column; gap: var(--space-2); }
  .features-list { grid-template-columns: 1fr; }
  .project-actions { flex-direction: column; gap: var(--space-3); align-items: flex-start; }
  .action-btns { width: 100%; }
  .action-btn { flex: 1; justify-content: center; }
  .reader-panel { margin-top: var(--space-4); }
  .reader-header { padding: var(--space-6) var(--space-6) var(--space-3); }
  .reader-body { padding: var(--space-6); }
  .reader-footer { padding: var(--space-3) var(--space-6) var(--space-4); }
}
</style>
