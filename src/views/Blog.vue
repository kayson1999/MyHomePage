<template>
  <div class="blog">
    <!-- 页面头部 -->
    <PageHero :tag="pageConfig.tag" :title="pageConfig.title" :gradient="pageConfig.titleGradient" :desc="pageConfig.desc"
orb-color="rgba(0, 212, 255, 0.06)" />

    <!-- 搜索 & 分类 -->
    <section class="toolbar-section">
      <div class="container">
        <div class="toolbar">
          <div class="search-box">
            <span class="search-icon">⌕</span>
            <input v-model="searchQuery" type="text"
              placeholder="搜索文章..." class="search-input" />
          </div>
          <div class="category-tabs">
            <button v-for="cat in categories" :key="cat"
              :class="['cat-chip', { active: activeCategory === cat }]"
              @click="activeCategory = cat">
              {{ cat }}
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- 文章列表 -->
    <section class="articles-section">
      <div class="container">
        <!-- 加载中状态 -->
        <div v-if="loading" class="loading-state">
          <span class="loading-icon">⏳</span>
          <span class="loading-text">加载中...</span>
        </div>

        <div v-else class="articles-list">
          <div v-for="post in paginatedPosts" :key="post.id">
            <!-- 文章卡片 -->
            <SpotlightCard :tilt-max="5" :glow-color="'rgba(129, 140, 248, 0.06)'">
            <article class="article-card glass-card" :class="{ 'music-card': post.type === 'music' }" @click="openArticle(post)">
              <div class="article-header">
                <span :class="['article-badge', 'badge-' + post.categoryKey]">
                  {{ post.type === 'music' ? '🎵 ' + post.category : post.category }}
                </span>
                <span class="article-date font-mono">{{ post.date }}</span>
              </div>
              <h3 class="article-title">
                <span v-if="post.type === 'music'" class="music-icon">♪</span>
                {{ post.title }}
              </h3>
              <p class="article-excerpt">{{ post.excerpt }}</p>
              <div class="article-footer">
                <div class="article-tags">
                  <span class="article-tag font-mono" v-for="tag in post.tags" :key="tag">
                    #{{ tag }}
                  </span>
                </div>
                <span v-if="post.type === 'music'" class="read-time font-mono">
                  <span class="time-icon">🎧</span> 点击播放
                </span>
                <span v-else class="read-time font-mono">
                  <span class="time-icon">⏱</span> {{ post.readTime }}min
                </span>
              </div>
            </article>
            </SpotlightCard>
          </div>
        </div>

        <!-- 空状态 -->
        <EmptyState v-if="!loading && filteredPosts.length === 0" icon="📭" text="未找到相关文章" />

        <!-- 分页 -->
        <Pagination v-if="!loading && blogTotalPages > 1" v-model:currentPage="blogCurrentPage" :totalPages="blogTotalPages" />
      </div>
    </section>

    <!-- 文章阅读器 -->
    <Teleport to="body">
      <Transition name="reader-fade">
        <div v-if="showReader" class="reader-overlay" @click.self="closeReader">
          <div class="reader-panel">
            <div class="reader-header">
              <div class="reader-title-area">
                <h2 class="reader-title">{{ currentPost.title }}</h2>
                <div class="reader-meta">
                  <span :class="['article-badge', 'badge-' + currentPost.categoryKey]">{{ currentPost.category }}</span>
                  <span class="reader-date font-mono">{{ currentPost.date }}</span>
                  <span class="reader-time font-mono">⏱ {{ currentPost.readTime }}min</span>
                </div>
              </div>
              <button class="reader-close" @click="closeReader">&times;</button>
            </div>
            <div class="reader-body">
              <div v-if="contentLoading" class="loading-state" style="padding: 4rem 0;">
                <span class="loading-icon">⏳</span>
                <span class="loading-text">加载内容中...</span>
              </div>
              <div v-else class="reader-content" v-html="currentPost.content"></div>
            </div>
            <div class="reader-footer">
              <div class="article-tags">
                <span class="article-tag font-mono" v-for="tag in (currentPost.tags || [])" :key="tag">#{{ tag }}</span>
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
import { blogPageConfig } from '@/config/site.config.js'
import { getBlogPosts, getBlogContent } from '@/services/data.service.js'
import { musicStore } from '@/services/music.store.js'
import { PageHero, EmptyState, SpotlightCard, Pagination } from '@/components/common'

export default {
  name: 'Blog',
  components: { PageHero, EmptyState, SpotlightCard, Pagination },
  setup() {
    const pageConfig = blogPageConfig
    const searchQuery = ref('')
    const activeCategory = ref('全部')
    const categories = pageConfig.categories

    // 异步加载博客文章列表
    const posts = ref([])
    const loading = ref(true)

    onMounted(async () => {
      try {
        posts.value = await getBlogPosts()
      } catch (e) {
        console.error('加载博客数据失败:', e)
      } finally {
        loading.value = false
      }
    })

    const filteredPosts = computed(() => {
      let result = posts.value
      if (activeCategory.value !== '全部') {
        result = result.filter(p => p.category === activeCategory.value)
      }
      if (searchQuery.value.trim()) {
        const q = searchQuery.value.toLowerCase()
        result = result.filter(p =>
          p.title.toLowerCase().includes(q) ||
          p.excerpt.toLowerCase().includes(q) ||
          p.tags.some(t => t.toLowerCase().includes(q))
        )
      }
      return result
    })

    // 分页
    const blogPageSize = 3
    const blogCurrentPage = ref(1)
    const blogTotalPages = computed(() => Math.ceil(filteredPosts.value.length / blogPageSize))
    const paginatedPosts = computed(() => {
      const start = (blogCurrentPage.value - 1) * blogPageSize
      return filteredPosts.value.slice(start, start + blogPageSize)
    })
    // 切换分类或搜索时重置页码
    watch([activeCategory, searchQuery], () => { blogCurrentPage.value = 1 })

    // ==================== Markdown 渲染配置 ====================
    marked.setOptions({ gfm: true, breaks: true })
    const renderer = new marked.Renderer()
    renderer.link = function ({ href, title, text }) {
      const titleAttr = title ? ` title="${title}"` : ''
      return `<a href="${href}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
    }
    marked.use({ renderer })

    // ==================== 文章阅读器 ====================
    const showReader = ref(false)
    const currentPost = ref({})
    const contentLoading = ref(false)

    const openArticle = async (post) => {
      // 如果有外部链接，直接跳转
      if (post.link) {
        window.open(post.link, '_blank')
        return
      }
      // 音乐类型：使用全局音乐播放器
      if (post.type === 'music') {
        musicStore.play(post)
        return
      }
      currentPost.value = { ...post, content: '' }
      showReader.value = true
      document.body.style.overflow = 'hidden'
      // 按需加载 Markdown 文件内容
      if (post.file) {
        contentLoading.value = true
        try {
          const mdText = await getBlogContent(post.file)
          currentPost.value = { ...post, content: marked.parse(mdText) }
        } catch (e) {
          console.error('加载文章内容失败:', e)
          currentPost.value = { ...post, content: '<p style="color:#FF5F56;">⚠️ 内容加载失败，请稍后重试</p>' }
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
      pageConfig, searchQuery, activeCategory, categories, filteredPosts, paginatedPosts, loading,
      blogCurrentPage, blogTotalPages,
      // 文章阅读器
      showReader, currentPost, contentLoading, openArticle, closeReader
    }
  }
}
</script>

<style scoped>
.font-mono { font-family: var(--font-mono); }
.container { max-width: 900px; margin: 0 auto; }

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

/* ========== 工具栏 ========== */
.toolbar-section {
  padding: var(--space-6);
  position: sticky;
  top: 68px;
  z-index: 50;
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  flex: 1;
  max-width: 300px;
  transition: all 0.3s ease;
}

.search-box:focus-within {
  border-color: var(--neon-cyan);
  box-shadow: 0 0 15px rgba(0, 255, 136, 0.08);
}

.search-icon {
  font-size: var(--text-lg);
  color: var(--text-muted);
}

.search-input {
  border: none;
  outline: none;
  flex: 1;
  font-size: var(--text-sm);
  color: var(--text-primary);
  background: transparent;
  font-family: var(--font-sans);
}

.search-input::placeholder {
  color: var(--text-muted);
}

.category-tabs {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.cat-chip {
  padding: var(--space-1) var(--space-4);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.3s ease;
}

.cat-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}

.cat-chip.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 255, 136, 0.2);
}

/* ========== 文章列表 ========== */
.articles-section {
  padding: var(--space-16) var(--space-6);
}

.articles-list {
  display: grid;
  gap: var(--space-6);
}

.article-card {
  padding: var(--space-8);
  cursor: pointer;
  transition: all 0.3s ease;
}

.article-card:hover {
  transform: translateY(-3px);
  border-color: var(--border-glow);
  box-shadow: var(--shadow-glow);
}

.article-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-4);
}

.article-badge {
  padding: 3px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.badge-tech {
  background: rgba(0, 255, 136, 0.1);
  color: var(--color-primary-light);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.badge-tool {
  background: rgba(255, 107, 157, 0.15);
  color: var(--neon-pink);
  border: 1px solid rgba(255, 107, 157, 0.3);
}

.badge-life {
  background: rgba(0, 230, 118, 0.15);
  color: var(--neon-green);
  border: 1px solid rgba(0, 230, 118, 0.3);
}

.badge-book {
  background: rgba(0, 255, 136, 0.1);
  color: var(--neon-green);
  border: 1px solid rgba(0, 255, 136, 0.2);
}

.article-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.article-title {
  font-size: var(--text-xl);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-3);
  line-height: 1.4;
  transition: color 0.3s ease;
}

.article-card:hover .article-title {
  color: var(--neon-cyan);
}

.article-excerpt {
  color: var(--text-muted);
  font-size: var(--text-sm);
  line-height: 1.7;
  margin-bottom: var(--space-5);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  gap: var(--space-3);
}

.article-tag {
  font-size: var(--text-xs);
  color: var(--color-primary-light);
  transition: color 0.2s;
}

.article-tag:hover { color: var(--neon-cyan); }

.read-time {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.time-icon { font-size: var(--text-sm); }

/* ========== 文章阅读器 ========== */
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
  max-width: 800px;
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

.reader-date, .reader-time {
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
}

.reader-body h3 {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: var(--space-4) 0 var(--space-2);
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

.reader-footer {
  padding: var(--space-4) var(--space-8) var(--space-6);
  border-top: 1px solid var(--border-color);
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

/* ========== 音乐卡片特殊样式 ========== */
.badge-music {
  background: rgba(255, 107, 157, 0.15);
  color: #FF6B9D;
  border: 1px solid rgba(255, 107, 157, 0.3);
}

.music-card {
  position: relative;
}

.music-card:hover {
  border-color: rgba(255, 107, 157, 0.4) !important;
  box-shadow: 0 0 20px rgba(255, 107, 157, 0.1) !important;
}

.music-card:hover .article-title {
  color: #FF6B9D !important;
}

.music-icon {
  display: inline-block;
  margin-right: 6px;
  font-size: 1.1em;
  animation: musicBounce 1.5s ease-in-out infinite;
}

@keyframes musicBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .toolbar { flex-direction: column; }
  .search-box { max-width: 100%; }
  .articles-section { padding: var(--space-12) var(--space-4); }
  .article-card { padding: var(--space-6); }
  .reader-panel { margin-top: var(--space-4); }
  .reader-header { padding: var(--space-6) var(--space-6) var(--space-3); }
  .reader-body { padding: var(--space-6); }
  .reader-footer { padding: var(--space-3) var(--space-6) var(--space-4); }
}
</style>
