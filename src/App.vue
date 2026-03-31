<template>
  <div id="app">
    <!-- 自定义光标 -->
    <CursorGlow />
    <!-- 噪点纹理层 -->
    <div class="noise-overlay"></div>
    <!-- 扫描线动效 -->
    <div class="scan-line"></div>

    <!-- 左上角品牌标识 -->
    <router-link to="/" class="brand-float">
      <span class="brand-logo" v-html="brand.logo"></span>
      <span class="brand-text">{{ brand.namePrefix }}<span class="brand-accent">{{ brand.nameAccent }}</span></span>
    </router-link>

    <!-- 右上角操作区 -->
    <div class="top-actions">
      <UserMenu />
      <a :href="nav.githubUrl" target="_blank" class="action-btn" title="GitHub">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
        </svg>
      </a>
    </div>

    <!-- ========== 侧边浮动导航 (桌面端) ========== -->
    <nav class="side-nav" :class="{ 'intro-done': introDone }">
      <div class="side-nav-track">
        <div v-for="(link, idx) in nav.links" :key="link.path" class="nav-item-wrap"
          @mouseenter="hoveredIdx = idx" @mouseleave="hoveredIdx = -1">
          <!-- 导航按钮 -->
          <component :is="link.openInNewTab ? 'a' : 'router-link'"
            v-bind="link.openInNewTab ? { href: getNavHref(link), target: '_blank', rel: 'noopener' } : { to: link.path }"
            class="nav-pill"
            :class="{ active: isActive(link.path) }"
            :style="{ '--item-color': link.color, '--item-delay': idx * 0.08 + 's' }">
            <span class="pill-icon">{{ link.icon }}</span>
            <span class="pill-label">{{ link.label }}</span>
            <!-- 激活指示器 -->
            <span v-if="isActive(link.path)" class="pill-glow"></span>
          </component>

          <!-- Tooltip 预览卡片 -->
          <Transition name="tooltip-pop">
            <div v-if="hoveredIdx === idx" class="nav-tooltip" :style="{ '--tip-color': link.color }">
              <div class="tooltip-arrow"></div>
              <div class="tooltip-header">
                <span class="tooltip-icon">{{ link.icon }}</span>
                <span class="tooltip-title">{{ link.label }}</span>
              </div>
              <p class="tooltip-desc">{{ link.desc }}</p>
              <span class="tooltip-hint">点击进入 →</span>
            </div>
          </Transition>
        </div>
      </div>

      <!-- 首次进入引导脉冲 -->
      <Transition name="fade">
        <div v-if="showGuide" class="nav-guide-pulse">
          <span class="guide-text">← 导航在这里</span>
        </div>
      </Transition>
    </nav>

    <!-- ========== 底部 Dock 导航 (移动端) ========== -->
    <nav class="dock-nav">
      <component v-for="link in nav.links" :key="link.path"
        :is="link.openInNewTab ? 'a' : 'router-link'"
        v-bind="link.openInNewTab ? { href: getNavHref(link), target: '_blank', rel: 'noopener' } : { to: link.path }"
        class="dock-item"
        :class="{ active: isActive(link.path) }"
        :style="{ '--item-color': link.color }">
        <span class="dock-icon">{{ link.icon }}</span>
        <span class="dock-label">{{ link.label }}</span>
      </component>
    </nav>

    <!-- 主内容区域 -->
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page-fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 全局登录弹窗 -->
    <LoginModal />

    <!-- 二维码弹窗 -->
    <Teleport to="body">
      <transition name="modal-fade">
        <div v-if="showQrcode" class="qrcode-overlay" @click.self="showQrcode = null">
          <div class="qrcode-modal">
            <button class="qrcode-close" @click="showQrcode = null">&times;</button>
            <img :src="showQrcode.image" :alt="showQrcode.name" class="qrcode-img" />
            <p v-if="showQrcode.label" class="qrcode-label">{{ showQrcode.label }}</p>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- ========== 全局音乐迷你播放器 ========== -->
    <Transition name="mini-slide">
      <div v-if="music.state.showMiniPlayer && !music.state.showFullPlayer" class="mini-player" :class="{ 'has-dock': isMobile }">
        <div class="mini-progress" :style="{ width: music.state.progressPercent + '%' }"></div>
        <div class="mini-content" @click="music.openFullPlayer()">
          <div class="mini-cover" :style="{ background: music.state.currentMusic?.coverColor || 'linear-gradient(135deg, #667eea, #764ba2)' }">
            <span class="mini-cover-icon" :class="{ spinning: music.state.isPlaying }">♪</span>
          </div>
          <div class="mini-info">
            <span class="mini-title">{{ music.state.currentMusic?.title || '未知歌曲' }}</span>
            <span class="mini-time font-mono">{{ music.formatTime(music.state.currentTime) }} / {{ music.formatTime(music.state.duration) }}</span>
          </div>
        </div>
        <div class="mini-actions">
          <button class="mini-btn" @click.stop="music.togglePlay()">
            {{ music.state.isPlaying ? '⏸' : '▶' }}
          </button>
          <button class="mini-btn mini-close-btn" @click.stop="music.stopAndClose()" title="停止播放">
            ✕
          </button>
        </div>
      </div>
    </Transition>

    <!-- ========== 全局音乐完整播放器弹窗 ========== -->
    <Teleport to="body">
      <Transition name="player-fade">
        <div v-if="music.state.showFullPlayer" class="player-overlay" @click.self="music.closeFullPlayer()">
          <div class="player-panel">
            <!-- 播放器头部 -->
            <div class="player-header">
              <div class="player-cover" :style="{ background: music.state.currentMusic?.coverColor || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }">
                <span class="player-cover-icon" :class="{ spinning: music.state.isPlaying }">♪</span>
              </div>
              <div class="player-info">
                <h2 class="player-title">{{ music.state.currentMusic?.title }}</h2>
                <div class="player-meta">
                  <span class="player-badge">🎵 音乐</span>
                  <span class="player-date font-mono">{{ music.state.currentMusic?.date }}</span>
                </div>
                <div class="player-tags">
                  <span class="player-tag font-mono" v-for="tag in (music.state.currentMusic?.tags || [])" :key="tag">#{{ tag }}</span>
                </div>
              </div>
              <button class="player-close" @click="music.closeFullPlayer()">&times;</button>
            </div>

            <!-- 播放控制区 -->
            <div class="player-controls">
              <div class="player-progress-bar" @click="music.seekTo($event)">
                <div class="player-progress-filled" :style="{ width: music.state.progressPercent + '%' }"></div>
                <div class="player-progress-thumb" :style="{ left: music.state.progressPercent + '%' }"></div>
              </div>
              <div class="player-time-display font-mono">
                <span>{{ music.formatTime(music.state.currentTime) }}</span>
                <span>{{ music.formatTime(music.state.duration) }}</span>
              </div>
              <div class="player-control-buttons">
                <button class="p-ctrl-btn" @click="music.rewind()" title="后退10秒">⏪</button>
                <button class="p-ctrl-btn p-play-btn" @click="music.togglePlay()">
                  {{ music.state.isPlaying ? '⏸' : '▶' }}
                </button>
                <button class="p-ctrl-btn" @click="music.forward()" title="前进10秒">⏩</button>
                <div class="p-volume-control">
                  <button class="p-ctrl-btn p-volume-btn" @click="music.toggleMute()">{{ music.state.isMuted ? '🔇' : '🔊' }}</button>
                  <input type="range" class="p-volume-slider" min="0" max="1" step="0.01" :value="music.state.volume" @input="music.setVolume($event)" />
                </div>
              </div>
            </div>

            <!-- 歌词区域 -->
            <div class="player-lyrics-section">
              <div class="player-lyrics-header">
                <span class="player-lyrics-label">📝 歌词</span>
              </div>
              <div class="player-lyrics-body">
                <div v-if="music.state.lyricsLoading" class="player-loading" style="padding: 2rem 0;">
                  <span class="player-loading-icon">⏳</span>
                  <span class="player-loading-text">加载歌词中...</span>
                </div>
                <pre v-else class="player-lyrics-content">{{ music.state.lyricsText }}</pre>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 全局 audio 元素 -->
    <audio ref="globalAudioRef" preload="auto"
      @timeupdate="music.onTimeUpdate()"
      @loadedmetadata="music.onLoadedMetadata()"
      @ended="music.onEnded()"
      @play="music.onPlay()"
      @pause="music.onPause()">
    </audio>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-glow"></div>
      <div class="footer-content">
        <div class="footer-grid">
          <div class="footer-brand">
            <span class="footer-logo" v-html="brand.logo"></span>
            <p class="footer-tagline">{{ brand.tagline }}</p>
          </div>
          <div class="footer-links-group">
            <h4 class="footer-heading">导航</h4>
            <template v-for="link in nav.links" :key="link.path">
              <a v-if="link.openInNewTab" :href="getNavHref(link)" target="_blank" rel="noopener" class="footer-link">
                {{ link.label }}
              </a>
              <router-link v-else :to="link.path" class="footer-link">
                {{ link.icon }} {{ link.label }}
              </router-link>
            </template>
          </div>
          <div class="footer-links-group">
            <h4 class="footer-heading">社交</h4>
            <template v-for="social in nav.socialLinks" :key="social.name">
              <a v-if="social.type === 'qrcode'" href="#" class="footer-link"
                @click.prevent="showQrcode = social">{{ social.name }}</a>
              <a v-else :href="social.url" target="_blank" rel="noopener" class="footer-link">{{ social.name }}</a>
            </template>
          </div>
        </div>
        <div class="footer-bottom">
          <div class="footer-line"></div>
          <p class="footer-copyright">
            <span class="mono-text">© {{ brand.copyright.year }}</span> — {{ brand.copyright.message }}
            <span class="heart">{{ brand.copyright.heart }}</span> {{ brand.copyright.suffix }}
            <span class="mono-text">{{ brand.copyright.code }}</span>
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { brandConfig, navConfig } from '@/config/site.config.js'
import { resolveEntryUrl } from '@/config/content.config.js'
import { authStore } from '@/services/auth.store.js'
import { musicStore } from '@/services/music.store.js'
import LoginModal from '@/components/common/LoginModal.vue'
import UserMenu from '@/components/common/UserMenu.vue'
import CursorGlow from '@/components/common/CursorGlow.vue'

export default {
  name: 'App',
  components: { LoginModal, UserMenu, CursorGlow },
  setup() {
    const route = useRoute()
    const menuOpen = ref(false)
    const showQrcode = ref(null)
    const hoveredIdx = ref(-1)
    const showGuide = ref(false)
    const introDone = ref(false)

    // 首次进入引导动画
    onMounted(() => {
      const hasVisited = sessionStorage.getItem('nav_intro_done')
      if (!hasVisited) {
        setTimeout(() => { showGuide.value = true }, 800)
        setTimeout(() => { showGuide.value = false; sessionStorage.setItem('nav_intro_done', '1') }, 4000)
      }
      // 入场动画完成标记
      setTimeout(() => { introDone.value = true }, 600)
    })

    const isActive = (path) => {
      if (path === '/') return route.path === '/'
      return route.path.startsWith(path)
    }

    const getNavHref = (link) => {
      if (link.envKey) {
        return resolveEntryUrl(link, authStore.state.token)
      }
      return link.path
    }

    // ==================== 全局音乐播放器 ====================
    const globalAudioRef = ref(null)
    const music = musicStore

    // 移动端检测（用于迷你播放器位置调整）
    const isMobile = computed(() => {
      if (typeof window === 'undefined') return false
      return window.innerWidth <= 768
    })

    onMounted(() => {
      // 将全局 audio 元素绑定到 musicStore
      if (globalAudioRef.value) {
        musicStore.audioRef.value = globalAudioRef.value
      }
    })

    return {
      menuOpen, showQrcode, hoveredIdx, showGuide, introDone,
      brand: brandConfig,
      nav: navConfig,
      isActive, getNavHref,
      // 全局音乐播放器
      globalAudioRef, music, isMobile
    }
  }
}
</script>

<style scoped>
/* ========== 扫描线 ========== */
.scan-line {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--color-primary), transparent);
  opacity: 0.4;
  z-index: 9999;
  animation: scan-line 6s linear infinite;
  pointer-events: none;
}

/* ========== 左上角品牌 ========== */
.brand-float {
  position: fixed;
  top: var(--space-5);
  left: var(--space-6);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: var(--space-2);
  text-decoration: none;
  color: var(--text-primary);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  transition: all 0.3s ease;
}

.brand-float:hover {
  background: rgba(168, 85, 247, 0.08);
}

.brand-logo {
  font-family: var(--font-mono);
  font-size: var(--text-xl);
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.brand-text {
  font-size: var(--text-lg);
  font-weight: 600;
  letter-spacing: -0.02em;
}

.brand-accent {
  color: var(--color-primary-light);
  text-shadow: 0 0 10px rgba(168, 85, 247, 0.3);
}

/* ========== 右上角操作区 ========== */
.top-actions {
  position: fixed;
  top: var(--space-5);
  right: var(--space-6);
  z-index: 1001;
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: var(--radius-lg);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  background: rgba(10, 10, 15, 0.6);
  backdrop-filter: blur(12px);
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: var(--color-primary-light);
  border-color: rgba(168, 85, 247, 0.3);
  background: rgba(168, 85, 247, 0.08);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.15);
}

/* ========== 侧边浮动导航 ========== */
.side-nav {
  position: fixed;
  left: var(--space-5);
  top: 50%;
  transform: translateY(-50%);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.side-nav-track {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
  padding: var(--space-3);
  background: rgba(10, 10, 15, 0.7);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: var(--radius-2xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(168, 85, 247, 0.05);
}

.nav-item-wrap {
  position: relative;
}

/* 导航胶囊按钮 */
.nav-pill {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-xl);
  text-decoration: none;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
  min-width: 44px;
  /* 入场动画 */
  opacity: 0;
  transform: translateX(-20px);
  animation: pill-enter 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  animation-delay: var(--item-delay);
}

@keyframes pill-enter {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.pill-icon {
  font-size: 1.15rem;
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.pill-label {
  font-family: var(--font-sans);
  letter-spacing: 0.02em;
  transition: opacity 0.2s;
}

.nav-pill:hover {
  color: var(--text-primary);
  background: rgba(168, 85, 247, 0.1);
  transform: translateX(2px);
}

.nav-pill:hover .pill-icon {
  transform: scale(1.15);
}

/* 激活状态 */
.nav-pill.active {
  color: var(--text-primary);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(99, 102, 241, 0.1));
  border: 1px solid rgba(168, 85, 247, 0.2);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.1);
}

.pill-glow {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 60%;
  border-radius: 2px;
  background: var(--item-color, var(--color-primary));
  box-shadow: 0 0 8px var(--item-color, var(--color-primary)),
              0 0 16px var(--item-color, var(--color-primary));
  animation: glow-breathe 2s ease-in-out infinite;
}

@keyframes glow-breathe {
  0%, 100% { opacity: 0.7; box-shadow: 0 0 6px var(--item-color); }
  50% { opacity: 1; box-shadow: 0 0 12px var(--item-color), 0 0 24px var(--item-color); }
}

/* ========== Tooltip 预览卡片 ========== */
.nav-tooltip {
  position: absolute;
  left: calc(100% + 16px);
  top: 50%;
  transform: translateY(-50%);
  width: 200px;
  padding: var(--space-4);
  background: rgba(15, 14, 24, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-xl);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(168, 85, 247, 0.05);
  pointer-events: none;
  z-index: 1002;
}

.tooltip-arrow {
  position: absolute;
  left: -6px;
  top: 50%;
  transform: translateY(-50%) rotate(45deg);
  width: 12px;
  height: 12px;
  background: rgba(15, 14, 24, 0.95);
  border-left: 1px solid rgba(168, 85, 247, 0.15);
  border-bottom: 1px solid rgba(168, 85, 247, 0.15);
}

.tooltip-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.tooltip-icon {
  font-size: 1.3rem;
}

.tooltip-title {
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: 0.02em;
}

.tooltip-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.6;
  margin-bottom: var(--space-3);
}

.tooltip-hint {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--tip-color, var(--color-primary));
  opacity: 0.8;
  letter-spacing: 0.05em;
}

/* Tooltip 动画 */
.tooltip-pop-enter-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.tooltip-pop-leave-active {
  transition: all 0.15s ease-in;
}

.tooltip-pop-enter-from {
  opacity: 0;
  transform: translateY(-50%) translateX(-8px) scale(0.95);
}

.tooltip-pop-leave-to {
  opacity: 0;
  transform: translateY(-50%) translateX(-4px);
}

/* ========== 首次引导脉冲 ========== */
.nav-guide-pulse {
  position: absolute;
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  gap: var(--space-2);
  white-space: nowrap;
}

.guide-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-primary-light);
  padding: var(--space-2) var(--space-3);
  background: rgba(168, 85, 247, 0.12);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: var(--radius-lg);
  animation: guide-bounce 1.5s ease-in-out infinite;
}

@keyframes guide-bounce {
  0%, 100% { transform: translateX(0); }
  50% { transform: translateX(6px); }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* ========== 底部 Dock 导航 (移动端) ========== */
.dock-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: rgba(10, 10, 15, 0.92);
  backdrop-filter: blur(24px) saturate(180%);
  -webkit-backdrop-filter: blur(24px) saturate(180%);
  border-top: 1px solid rgba(168, 85, 247, 0.1);
  padding: var(--space-2) var(--space-3);
  padding-bottom: calc(var(--space-2) + env(safe-area-inset-bottom, 0px));
  justify-content: space-around;
  align-items: center;
}

.dock-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-2) var(--space-3);
  border-radius: var(--radius-lg);
  text-decoration: none;
  color: var(--text-muted);
  transition: all 0.3s ease;
  position: relative;
}

.dock-icon {
  font-size: 1.25rem;
  transition: transform 0.3s ease;
}

.dock-label {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0.02em;
}

.dock-item.active {
  color: var(--text-primary);
}

.dock-item.active .dock-icon {
  transform: scale(1.15) translateY(-2px);
}

.dock-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 20px;
  height: 3px;
  border-radius: 2px;
  background: var(--item-color, var(--color-primary));
  box-shadow: 0 0 8px var(--item-color, var(--color-primary));
}

/* ========== 主内容 ========== */
.main-content {
  min-height: 100vh;
  padding-top: 20px;
  padding-left: 100px; /* 为侧边导航留空间 */
  position: relative;
  z-index: 1;
}

/* 页面过渡动画 */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* ========== 页脚 ========== */
.footer {
  position: relative;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-color);
  overflow: hidden;
  margin-left: 100px; /* 与主内容对齐 */
}

.footer-glow {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 2px;
  background: var(--gradient-primary);
  box-shadow: 0 0 30px 10px rgba(168, 85, 247, 0.12);
}

/* 电路板纹路装饰 */
.footer::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-image:
    linear-gradient(90deg, transparent 49.5%, rgba(168, 85, 247, 0.08) 49.5%, rgba(168, 85, 247, 0.08) 50.5%, transparent 50.5%),
    linear-gradient(0deg, transparent 49.5%, rgba(168, 85, 247, 0.08) 49.5%, rgba(168, 85, 247, 0.08) 50.5%, transparent 50.5%);
  background-size: 30px 30px;
  mask-image: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
  -webkit-mask-image: linear-gradient(180deg, rgba(0,0,0,0.3) 0%, transparent 100%);
  pointer-events: none;
}

.footer-content {
  max-width: 1280px;
  margin: 0 auto;
  padding: var(--space-16) var(--space-6) var(--space-8);
}

.footer-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: var(--space-12);
  margin-bottom: var(--space-12);
}

.footer-logo {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.footer-tagline {
  color: var(--text-muted);
  font-size: var(--text-sm);
  margin-top: var(--space-3);
}

.footer-heading {
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-4);
}

.footer-link {
  display: block;
  color: var(--text-muted);
  text-decoration: none;
  font-size: var(--text-sm);
  padding: var(--space-1) 0;
  transition: all 0.2s ease;
}

.footer-link:hover {
  color: var(--color-primary-light);
  transform: translateX(4px);
}

.footer-bottom {
  text-align: center;
}

.footer-line {
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-color), rgba(168, 85, 247, 0.3), var(--border-color), transparent);
  margin-bottom: var(--space-6);
  position: relative;
}

/* 电路板节点装饰 */
.footer-line::before,
.footer-line::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-primary);
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
  animation: circuit-pulse 3s ease-in-out infinite;
}

.footer-line::before { left: 30%; }
.footer-line::after { right: 30%; animation-delay: 1.5s; }

.footer-copyright {
  color: var(--text-muted);
  font-size: var(--text-sm);
}

.mono-text {
  font-family: var(--font-mono);
  color: var(--color-primary-light);
}

.heart {
  color: var(--neon-pink);
  animation: glow-pulse 2s ease-in-out infinite;
  display: inline-block;
}

/* ========== 二维码弹窗 ========== */
.qrcode-overlay {
  position: fixed;
  inset: 0;
  z-index: 9000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.qrcode-modal {
  position: relative;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-8);
  text-align: center;
  box-shadow: 0 0 40px rgba(168, 85, 247, 0.1);
  max-width: 320px;
  width: 90%;
}

.qrcode-close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 1.5rem;
  cursor: pointer;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  transition: all 0.2s ease;
}

.qrcode-close:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.08);
}

.qrcode-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border-radius: var(--radius-md);
  margin-bottom: var(--space-4);
}

.qrcode-label {
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

/* 弹窗过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.25s ease;
}

.modal-fade-enter-active .qrcode-modal,
.modal-fade-leave-active .qrcode-modal {
  transition: transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .qrcode-modal,
.modal-fade-leave-to .qrcode-modal {
  transform: scale(0.9);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .side-nav {
    display: none;
  }

  .dock-nav {
    display: flex;
  }

  .brand-float {
    left: var(--space-4);
    top: var(--space-4);
  }

  .top-actions {
    right: var(--space-4);
    top: var(--space-4);
  }

  .main-content {
    padding-left: 0;
    padding-top: 10px;
    padding-bottom: 80px; /* 为底部 dock 留空间 */
  }

  .footer {
    margin-left: 0;
    padding-bottom: 80px;
  }

  .footer-grid {
    grid-template-columns: 1fr;
    gap: var(--space-8);
  }
}

/* 中等屏幕：收窄侧边栏 */
@media (min-width: 769px) and (max-width: 1024px) {
  .pill-label {
    display: none;
  }

  .nav-pill {
    justify-content: center;
    padding: var(--space-3);
  }

  .side-nav-track {
    padding: var(--space-2);
  }

  .main-content {
    padding-left: 72px;
  }

  .footer {
    margin-left: 72px;
  }
}

/* ========== 全局迷你播放器 ========== */
.font-mono { font-family: var(--font-mono); }

.mini-player {
  position: fixed;
  bottom: 0;
  left: 100px; /* 与侧边导航对齐 */
  right: 0;
  z-index: 999;
  height: 56px;
  background: rgba(10, 10, 20, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(168, 85, 247, 0.15);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  overflow: hidden;
}

.mini-player.has-dock {
  left: 0;
  bottom: 60px; /* 在移动端 dock 导航上方 */
}

.mini-progress {
  position: absolute;
  top: 0;
  left: 0;
  height: 2px;
  background: linear-gradient(90deg, #FF6B9D, #B14EFF);
  transition: width 0.3s linear;
}

.mini-content {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.mini-cover {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.mini-cover-icon {
  font-size: 1rem;
  color: white;
}

.mini-cover-icon.spinning {
  animation: mini-spin 3s linear infinite;
}

@keyframes mini-spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.mini-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.mini-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-time {
  font-size: 10px;
  color: var(--text-muted);
}

.mini-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.mini-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.mini-btn:hover {
  border-color: rgba(255, 107, 157, 0.4);
  color: #FF6B9D;
  background: rgba(255, 107, 157, 0.08);
}

.mini-close-btn {
  font-size: 0.8rem;
}

.mini-close-btn:hover {
  border-color: rgba(255, 95, 86, 0.4);
  color: #FF5F56;
  background: rgba(255, 95, 86, 0.08);
}

/* 迷你播放器动画 */
.mini-slide-enter-active,
.mini-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.mini-slide-enter-from,
.mini-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ========== 全局完整播放器弹窗 ========== */
.player-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: var(--space-8) var(--space-4);
  overflow-y: auto;
}

.player-panel {
  width: 100%;
  max-width: 600px;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  margin-top: var(--space-8);
  margin-bottom: var(--space-8);
  overflow: hidden;
}

.player-header {
  display: flex;
  align-items: flex-start;
  gap: var(--space-5);
  padding: var(--space-8);
  border-bottom: 1px solid var(--border-color);
  position: relative;
}

.player-cover {
  width: 100px;
  height: 100px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.player-cover-icon {
  font-size: 2.5rem;
  color: white;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.player-cover-icon.spinning {
  animation: mini-spin 3s linear infinite;
}

.player-info {
  flex: 1;
  min-width: 0;
}

.player-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
  line-height: 1.3;
}

.player-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-2);
}

.player-badge {
  padding: 3px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  background: rgba(255, 107, 157, 0.15);
  color: #FF6B9D;
  border: 1px solid rgba(255, 107, 157, 0.3);
}

.player-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.player-tags {
  display: flex;
  gap: var(--space-2);
  flex-wrap: wrap;
}

.player-tag {
  font-size: var(--text-xs);
  color: var(--color-primary-light);
}

.player-close {
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

.player-close:hover {
  background: rgba(255, 95, 86, 0.15);
  border-color: rgba(255, 95, 86, 0.4);
  color: #FF5F56;
}

/* ========== 播放控制区 ========== */
.player-controls {
  padding: var(--space-6) var(--space-8);
  border-bottom: 1px solid var(--border-color);
}

.player-progress-bar {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  cursor: pointer;
  position: relative;
  margin-bottom: var(--space-2);
  transition: height 0.2s;
}

.player-progress-bar:hover {
  height: 8px;
}

.player-progress-filled {
  height: 100%;
  background: linear-gradient(90deg, #FF6B9D, #B14EFF);
  border-radius: 3px;
  transition: width 0.1s linear;
}

.player-progress-thumb {
  position: absolute;
  top: 50%;
  width: 14px;
  height: 14px;
  background: white;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  box-shadow: 0 0 6px rgba(255, 107, 157, 0.5);
  opacity: 0;
  transition: opacity 0.2s;
}

.player-progress-bar:hover .player-progress-thumb {
  opacity: 1;
}

.player-time-display {
  display: flex;
  justify-content: space-between;
  font-size: var(--text-xs);
  color: var(--text-muted);
  margin-bottom: var(--space-4);
}

.player-control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-4);
}

.p-ctrl-btn {
  width: 44px;
  height: 44px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.p-ctrl-btn:hover {
  border-color: rgba(255, 107, 157, 0.4);
  color: #FF6B9D;
  background: rgba(255, 107, 157, 0.08);
}

.p-play-btn {
  width: 56px;
  height: 56px;
  font-size: 1.5rem;
  background: linear-gradient(135deg, #FF6B9D, #B14EFF);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(255, 107, 157, 0.3);
}

.p-play-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 20px rgba(255, 107, 157, 0.4);
  background: linear-gradient(135deg, #FF6B9D, #B14EFF);
  color: white;
}

.p-volume-control {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  margin-left: var(--space-2);
}

.p-volume-btn {
  width: 36px;
  height: 36px;
  font-size: 1rem;
}

.p-volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.p-volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF6B9D;
  cursor: pointer;
}

.p-volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #FF6B9D;
  cursor: pointer;
  border: none;
}

/* ========== 歌词区域 ========== */
.player-lyrics-section {
  max-height: 350px;
  display: flex;
  flex-direction: column;
}

.player-lyrics-header {
  padding: var(--space-4) var(--space-8) 0;
}

.player-lyrics-label {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
}

.player-lyrics-body {
  padding: var(--space-3) var(--space-8) var(--space-6);
  overflow-y: auto;
  flex: 1;
}

.player-lyrics-content {
  font-family: var(--font-sans);
  font-size: var(--text-sm);
  line-height: 2;
  color: var(--text-secondary);
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
  background: none;
  border: none;
}

.player-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.player-loading-icon {
  font-size: 1.5rem;
  animation: mini-spin 1.5s linear infinite;
}

.player-loading-text {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* 歌词滚动条美化 */
.player-lyrics-body::-webkit-scrollbar {
  width: 4px;
}

.player-lyrics-body::-webkit-scrollbar-track {
  background: transparent;
}

.player-lyrics-body::-webkit-scrollbar-thumb {
  background: rgba(255, 107, 157, 0.3);
  border-radius: 2px;
}

.player-lyrics-body::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 107, 157, 0.5);
}

/* 完整播放器动画 */
.player-fade-enter-active,
.player-fade-leave-active {
  transition: opacity 0.3s ease;
}

.player-fade-enter-active .player-panel,
.player-fade-leave-active .player-panel {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.player-fade-enter-from,
.player-fade-leave-to {
  opacity: 0;
}

.player-fade-enter-from .player-panel {
  transform: translateY(30px);
  opacity: 0;
}

.player-fade-leave-to .player-panel {
  transform: translateY(30px);
  opacity: 0;
}

/* ========== 迷你播放器响应式 ========== */
@media (max-width: 768px) {
  .mini-player {
    left: 0;
    bottom: 60px; /* dock 导航高度 */
  }

  .mini-player.has-dock {
    bottom: 60px;
  }

  /* 完整播放器响应式 */
  .player-panel { margin-top: var(--space-4); }
  .player-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: var(--space-6);
  }
  .player-header .player-close {
    position: absolute;
    top: var(--space-3);
    right: var(--space-3);
  }
  .player-cover { width: 80px; height: 80px; }
  .player-tags { justify-content: center; }
  .player-meta { justify-content: center; }
  .player-controls { padding: var(--space-4) var(--space-6); }
  .p-volume-control { display: none; }
  .player-lyrics-header { padding: var(--space-3) var(--space-6) 0; }
  .player-lyrics-body { padding: var(--space-3) var(--space-6) var(--space-4); }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .mini-player {
    left: 72px;
  }
}
</style>