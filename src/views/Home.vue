<template>
  <div class="home">
    <!-- 英雄区域 — 全屏科技风 -->
    <section class="hero">
      <!-- 粒子背景 -->
      <vue-particles
        id="hero-particles"
        class="particles-bg"
        :options="particlesOptions"
      />
      <!-- 矩阵网格背景 -->
      <div class="hero-grid-bg"></div>
      <!-- 极光背景 -->
      <div class="aurora-container">
        <div class="aurora aurora-1"></div>
        <div class="aurora aurora-2"></div>
        <div class="aurora aurora-3"></div>
      </div>
      <!-- 光圈装饰 -->
      <div class="hero-orb orb-1"></div>
      <div class="hero-orb orb-2"></div>
      <div class="hero-orb orb-3"></div>

      <div class="hero-content">
        <div class="hero-text">
          <div class="hero-badge">
            <span class="badge-dot"></span>
            <span class="badge-text">{{ heroConfig.badge }}</span>
          </div>
          <!-- Glitch 故障风标题 -->
          <h1 class="hero-title glitch-wrap">
            <span class="title-line" data-text="">{{ heroConfig.titleLine1 }}</span>
            <span class="glitch-layer glitch-1" aria-hidden="true">{{ heroConfig.titleLine1 }}</span>
            <span class="glitch-layer glitch-2" aria-hidden="true">{{ heroConfig.titleLine1 }}</span>
          </h1>
          <!-- 副标题 — 打字机效果 -->
          <p class="hero-subtitle" v-if="heroConfig.titleLine2">
            <span class="typewriter">{{ displayedSubtitle }}<span class="typewriter-cursor">|</span></span>
          </p>
          <!-- 技术标签 -->
          <div class="hero-tags">
            <span class="hero-tag" v-for="(tag, i) in techTags" :key="i"
              :style="{ animationDelay: (i * 0.1 + 0.5) + 's' }">
              {{ tag }}
            </span>
          </div>
          <div class="hero-actions">
            <button class="btn btn-glow" @click="showNailong = true">
              <img src="/images/nailong.png" alt="奶龙" class="btn-icon" />
              <span class="btn-text">{{ heroConfig.buttonSecondary }}</span>
              <span class="btn-arrow">→</span>
            </button>
          </div>

        </div>

        <div class="hero-visual">
          <!-- 终端窗口 -->
          <div class="terminal">
            <div class="terminal-header">
              <div class="terminal-controls">
                <span class="ctrl ctrl-red"></span>
                <span class="ctrl ctrl-yellow"></span>
                <span class="ctrl ctrl-green"></span>
              </div>
              <span class="terminal-title">{{ terminalConfig.title }}</span>
              <div class="terminal-actions">
                <span class="terminal-dot">⋯</span>
              </div>
            </div>
            <div class="terminal-body">
              <div class="terminal-line" v-for="(line, i) in terminalLines" :key="i"
                   :style="{ animationDelay: (i * 0.3) + 's' }">
                <span class="line-prompt" v-if="line.prompt">{{ line.prompt }}</span>
                <span :class="'line-' + (line.type || 'text')">{{ line.content }}</span>
              </div>
              <div class="terminal-cursor">_</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 向下滚动提示 -->
      <div class="scroll-hint" @click="scrollToContent">
        <div class="scroll-line"></div>
        <span class="scroll-text">SCROLL</span>
      </div>
    </section>

    <!-- 奶龙数字人弹窗 -->
    <Teleport to="body">
      <Transition name="nailong-fade">
        <div class="nailong-overlay" v-if="showNailong" @click.self="showNailong = false">
          <div class="nailong-container">
            <button class="nailong-close" @click="showNailong = false">✕</button>
            <div class="nailong-bubble">
              <p class="bubble-text" :key="currentGreeting">{{ currentGreeting }}</p>
            </div>
            <div class="nailong-avatar">
              <img src="/images/nailong.png" alt="奶龙" class="nailong-img" />
            </div>
            <div class="nailong-actions">
              <button class="nailong-btn" @click="changeGreeting">🎲 换一句</button>
              <button class="nailong-btn" @click="showNailong = false">👋 下次见</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { getHomeData } from '@/services/data.service.js'

export default {
  name: 'Home',
  components: {},
  setup() {
    const contentSection = ref(null)
    const loading = ref(true)

    // 响应式数据容器
    const heroConfig = reactive({ badge: '', titleLine1: '', titleLine2: '', buttonSecondary: '' })
    const terminalConfig = reactive({ title: '', lines: [] })
    const terminalLines = ref([])

    // 奶龙数字人
    const showNailong = ref(false)
    const greetings = [
      '嗨～我是奶龙！欢迎来到我的主页 🐉✨',
      '今天也要元气满满哦！加油鸭 💪🔥',
      '代码写累了？让奶龙给你加个buff！🎮',
      '你好呀～奶龙最喜欢交新朋友啦 🥰',
      '哇！有人来看我啦，好开心！🎉',
      '奶龙觉得你今天特别帅/美！😎✨',
      '嘿嘿，偷偷告诉你，奶龙会喷火哦 🔥🐲'
    ]
    const currentGreeting = ref(greetings[Math.floor(Math.random() * greetings.length)])
    const changeGreeting = () => {
      let next
      do {
        next = greetings[Math.floor(Math.random() * greetings.length)]
      } while (next === currentGreeting.value && greetings.length > 1)
      currentGreeting.value = next
    }

    // 打字机效果
    const displayedSubtitle = ref('')
    let typewriterTimer = null

    const startTypewriter = (text) => {
      let i = 0
      displayedSubtitle.value = ''
      if (typewriterTimer) clearInterval(typewriterTimer)
      typewriterTimer = setInterval(() => {
        if (i < text.length) {
          displayedSubtitle.value += text.charAt(i)
          i++
        } else {
          clearInterval(typewriterTimer)
        }
      }, 80)
    }

    // 技术标签
    const techTags = ref(['Mamba', 'NaiLong'])

    // 粒子配置
    const particlesOptions = {
      fullScreen: { enable: false },
      fpsLimit: 60,
      particles: {
        number: { value: 50, density: { enable: true, width: 1920, height: 1080 } },
        color: { value: ['#A855F7', '#6366F1', '#818CF8', '#C084FC'] },
        shape: { type: 'circle' },
        opacity: {
          value: { min: 0.1, max: 0.4 },
          animation: { enable: true, speed: 0.8, sync: false }
        },
        size: {
          value: { min: 1, max: 3 },
          animation: { enable: true, speed: 2, sync: false }
        },
        links: {
          enable: true,
          distance: 150,
          color: '#A855F7',
          opacity: 0.08,
          width: 1
        },
        move: {
          enable: true,
          speed: 0.6,
          direction: 'none',
          random: true,
          straight: false,
          outModes: { default: 'out' }
        }
      },
      interactivity: {
        events: {
          onHover: { enable: true, mode: 'grab' },
          onClick: { enable: true, mode: 'push' }
        },
        modes: {
          grab: { distance: 180, links: { opacity: 0.25, color: '#C084FC' } },
          push: { quantity: 3 }
        }
      },
      detectRetina: true
    }

    onMounted(async () => {
      try {
        const data = await getHomeData()
        Object.assign(heroConfig, data.hero)
        Object.assign(terminalConfig, data.terminal)
        terminalLines.value = data.terminal.lines

        // 启动打字机
        if (data.hero.titleLine2) {
          setTimeout(() => startTypewriter(data.hero.titleLine2), 600)
        }
      } catch (e) {
        console.error('加载首页数据失败:', e)
      } finally {
        loading.value = false
      }
    })

    onBeforeUnmount(() => {
      if (typewriterTimer) clearInterval(typewriterTimer)
    })

    const scrollToContent = () => {
      if (contentSection.value) {
        contentSection.value.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      contentSection, loading, heroConfig, terminalConfig, terminalLines,
      scrollToContent, displayedSubtitle, techTags, particlesOptions,
      showNailong, currentGreeting, changeGreeting
    }
  }
}
</script>

<style scoped>
/* ========== 英雄区域 ========== */
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  position: relative;
  overflow: hidden;
  padding: var(--space-20) var(--space-6);
}

/* ========== 粒子背景 ========== */
.particles-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
}

/* ========== 极光背景 ========== */
.aurora-container {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.5;
}

.aurora-1 {
  width: 600px;
  height: 300px;
  background: conic-gradient(from 0deg at 50% 50%, rgba(168, 85, 247, 0) 0deg, rgba(168, 85, 247, 0.12) 60deg, rgba(99, 102, 241, 0.08) 120deg, rgba(168, 85, 247, 0) 180deg);
  top: 10%;
  left: 20%;
  animation: aurora-drift 15s ease-in-out infinite;
}

.aurora-2 {
  width: 500px;
  height: 250px;
  background: conic-gradient(from 120deg at 50% 50%, rgba(99, 102, 241, 0) 0deg, rgba(129, 140, 248, 0.1) 60deg, rgba(244, 114, 182, 0.06) 120deg, rgba(99, 102, 241, 0) 180deg);
  top: 40%;
  right: 10%;
  animation: aurora-drift 20s ease-in-out infinite reverse;
  animation-delay: -5s;
}

.aurora-3 {
  width: 400px;
  height: 200px;
  background: conic-gradient(from 240deg at 50% 50%, rgba(244, 114, 182, 0) 0deg, rgba(168, 85, 247, 0.08) 60deg, rgba(129, 140, 248, 0.06) 120deg, rgba(244, 114, 182, 0) 180deg);
  bottom: 15%;
  left: 40%;
  animation: aurora-drift 18s ease-in-out infinite;
  animation-delay: -10s;
}

/* 网格背景 */
.hero-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(168, 85, 247, 0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(168, 85, 247, 0.04) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

/* 光圈装饰 */
.hero-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
}

.orb-1 {
  width: 500px; height: 500px;
  background: rgba(168, 85, 247, 0.08);
  top: -100px; left: -100px;
  animation: float 8s ease-in-out infinite;
}

.orb-2 {
  width: 400px; height: 400px;
  background: rgba(99, 102, 241, 0.06);
  bottom: -50px; right: -50px;
  animation: float 10s ease-in-out infinite reverse;
}

.orb-3 {
  width: 300px; height: 300px;
  background: rgba(129, 140, 248, 0.05);
  top: 50%; left: 50%;
  animation: float 12s ease-in-out infinite;
}

.hero-content {
  max-width: 1280px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-16);
  align-items: center;
  position: relative;
  z-index: 2;
  width: 100%;
}

/* 英雄文字 */
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(168, 85, 247, 0.06);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-full);
  margin-bottom: var(--space-6);
  font-family: var(--font-mono);
}

.badge-dot {
  width: 8px; height: 8px;
  background: var(--neon-green);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--neon-green);
  animation: glow-pulse 2s ease-in-out infinite;
}

.badge-text {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-secondary);
  letter-spacing: 0.05em;
}

.hero-title {
  margin-bottom: var(--space-6);
}

/* ========== Glitch 故障风标题 ========== */
.glitch-wrap {
  position: relative;
  display: inline-block;
}

.title-line {
  display: block;
  font-size: var(--text-5xl);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  color: var(--text-primary);
  animation: glitch-skew 8s ease-in-out infinite;
}

.glitch-layer {
  position: absolute;
  top: 0;
  left: 0;
  display: block;
  font-size: var(--text-5xl);
  font-weight: 800;
  line-height: 1.1;
  letter-spacing: -0.03em;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.glitch-1 {
  color: #C084FC;
  animation: glitch-1 6s infinite linear;
  opacity: 0.6;
}

.glitch-2 {
  color: #818CF8;
  animation: glitch-2 6s infinite linear;
  animation-delay: 0.1s;
  opacity: 0.6;
}

/* 标题悬停时加强 Glitch */
.hero-title:hover .glitch-1 {
  animation-duration: 0.3s;
  opacity: 0.8;
}

.hero-title:hover .glitch-2 {
  animation-duration: 0.3s;
  opacity: 0.8;
}

/* ========== 副标题 — 打字机 ========== */
.hero-subtitle {
  font-size: var(--text-xl);
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
  min-height: 1.8em;
}

.typewriter {
  font-family: var(--font-mono);
  letter-spacing: 0.02em;
}

.typewriter-cursor {
  color: var(--color-primary-light);
  animation: cursor-blink 0.8s step-end infinite;
  margin-left: 2px;
  font-weight: 300;
}

/* ========== 技术标签 ========== */
.hero-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
  margin-bottom: var(--space-8);
}

.hero-tag {
  display: inline-block;
  padding: var(--space-1) var(--space-3);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--color-primary-light);
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-full);
  letter-spacing: 0.05em;
  opacity: 0;
  transform: translateY(8px);
  animation: tag-enter 0.4s ease forwards;
  transition: all 0.3s ease;
}

.hero-tag:hover {
  background: rgba(168, 85, 247, 0.15);
  border-color: rgba(168, 85, 247, 0.3);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.2);
  transform: translateY(-2px);
}

@keyframes tag-enter {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 按钮 */
.hero-actions {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-10);
}

.btn {
  padding: var(--space-3) var(--space-8);
  border: none;
  border-radius: var(--radius-lg);
  font-weight: 600;
  font-size: var(--text-base);
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.btn-glow {
  background: var(--gradient-primary);
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
  color: #ffffff;
  font-weight: 700;
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.25);
}

.btn-glow:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(168, 85, 247, 0.4);
}

.btn-glow .btn-arrow {
  transition: transform 0.3s ease;
}

.btn-glow:hover .btn-arrow {
  transform: translateX(4px);
}

.btn-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
  border-radius: 50%;
  flex-shrink: 0;
}

.btn-outline {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
}

.btn-outline:hover {
  color: var(--neon-green);
  border-color: var(--neon-green);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.12);
}

/* 终端窗口 */
.terminal {
  background: rgba(10, 10, 15, 0.95);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-xl);
  overflow: hidden;
  box-shadow: 0 0 30px rgba(168, 85, 247, 0.08), var(--shadow-lg);
  animation: border-glow 4s ease-in-out infinite;
}

.terminal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-3) var(--space-4);
  background: rgba(15, 14, 24, 0.9);
  border-bottom: 1px solid rgba(168, 85, 247, 0.1);
}

.terminal-controls {
  display: flex;
  gap: var(--space-2);
}

.ctrl {
  width: 12px; height: 12px;
  border-radius: 50%;
}
.ctrl-red { background: #FF5F56; }
.ctrl-yellow { background: #FFBD2E; }
.ctrl-green { background: #27CA3F; }

.terminal-title {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.terminal-dot { color: var(--text-muted); }

.terminal-body {
  padding: var(--space-6);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: 1.8;
}

.terminal-line {
  opacity: 0;
  animation: terminal-appear 0.5s ease forwards;
}

@keyframes terminal-appear {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.line-prompt {
  color: var(--neon-green);
  margin-right: var(--space-2);
  font-weight: 600;
}

.line-command { color: var(--neon-cyan); }
.line-output { color: var(--text-secondary); }
.line-string { color: #C3E88D; }
.line-success { color: var(--neon-green); }

.terminal-cursor {
  color: var(--neon-green);
  animation: glow-pulse 1s ease-in-out infinite;
  margin-top: var(--space-1);
  text-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
}

/* 滚动提示 */
.scroll-hint {
  position: absolute;
  bottom: var(--space-8);
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
  cursor: pointer;
  z-index: 2;
}

.scroll-line {
  width: 1px;
  height: 40px;
  background: linear-gradient(180deg, var(--neon-cyan), transparent);
  animation: scroll-pulse 2s ease-in-out infinite;
}

@keyframes scroll-pulse {
  0%, 100% { opacity: 0.3; height: 40px; }
  50% { opacity: 1; height: 50px; }
}

.scroll-text {
  font-family: var(--font-mono);
  font-size: 10px;
  color: var(--text-muted);
  letter-spacing: 0.2em;
}

/* ========== 奶龙数字人弹窗 ========== */
.nailong-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
}

.nailong-container {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-10) var(--space-8);
  background: rgba(15, 14, 24, 0.95);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: var(--radius-xl);
  box-shadow: 0 0 60px rgba(168, 85, 247, 0.15), 0 0 120px rgba(99, 102, 241, 0.08);
  max-width: 420px;
  width: 90vw;
  animation: nailong-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes nailong-pop {
  from { opacity: 0; transform: scale(0.7) translateY(30px); }
  to { opacity: 1; transform: scale(1) translateY(0); }
}

.nailong-close {
  position: absolute;
  top: var(--space-3);
  right: var(--space-3);
  width: 32px;
  height: 32px;
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.08);
  color: var(--text-muted);
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.nailong-close:hover {
  background: rgba(168, 85, 247, 0.2);
  color: var(--text-primary);
  border-color: rgba(168, 85, 247, 0.4);
}

.nailong-bubble {
  background: rgba(168, 85, 247, 0.08);
  border: 1px solid rgba(168, 85, 247, 0.15);
  border-radius: var(--radius-lg);
  padding: var(--space-4) var(--space-6);
  position: relative;
  max-width: 320px;
  text-align: center;
}

.nailong-bubble::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 8px solid rgba(168, 85, 247, 0.15);
}

.bubble-text {
  font-size: var(--text-base);
  color: var(--text-primary);
  line-height: 1.6;
  animation: bubble-typing 0.3s ease;
}

@keyframes bubble-typing {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.nailong-avatar {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.12) 0%, transparent 70%);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: nailong-float 3s ease-in-out infinite;
  position: relative;
}

.nailong-avatar::before {
  content: '';
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(168, 85, 247, 0.15);
  animation: nailong-ring 4s linear infinite;
}

@keyframes nailong-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes nailong-ring {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.nailong-img {
  width: 120px;
  height: 120px;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(168, 85, 247, 0.3));
}

.nailong-actions {
  display: flex;
  gap: var(--space-3);
}

.nailong-btn {
  padding: var(--space-2) var(--space-5);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: var(--radius-lg);
  background: rgba(168, 85, 247, 0.08);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.nailong-btn:hover {
  background: rgba(168, 85, 247, 0.18);
  border-color: rgba(168, 85, 247, 0.4);
  color: var(--text-primary);
  box-shadow: 0 0 16px rgba(168, 85, 247, 0.15);
  transform: translateY(-1px);
}

/* 弹窗过渡动画 */
.nailong-fade-enter-active { transition: opacity 0.3s ease; }
.nailong-fade-leave-active { transition: opacity 0.2s ease; }
.nailong-fade-enter-from,
.nailong-fade-leave-to { opacity: 0; }

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .hero {
    padding: var(--space-16) var(--space-4);
    min-height: auto;
  }

  .hero-content {
    grid-template-columns: 1fr;
    gap: var(--space-10);
  }

  .title-line { font-size: var(--text-3xl); }

  .hero-actions { flex-direction: column; }
  .btn { justify-content: center; }

  .scroll-hint { display: none; }
}
</style>
