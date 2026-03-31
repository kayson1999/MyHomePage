<!-- 
  PageHero — 页面头部通用组件
  用法: <PageHero :tag="tag" :title="title" :gradient="gradient" :desc="desc" />
-->
<template>
  <section class="page-hero">
    <div class="hero-grid-bg"></div>
    <div class="hero-orb" :style="{ background: orbColor }"></div>
    <!-- 极光装饰 -->
    <div class="hero-aurora" :style="{ background: `conic-gradient(from 180deg at 50% 50%, ${orbColor}00 0deg, ${orbColor} 60deg, rgba(99,102,241,0.06) 120deg, ${orbColor}00 180deg)` }"></div>
    <div class="container">
      <span class="page-tag font-mono">{{ tag }}</span>
      <h1 class="page-title">
        {{ title }}
        <span class="gradient-text" v-if="gradient">{{ gradient }}</span>
      </h1>
      <p class="page-desc" v-if="desc">{{ desc }}</p>
    </div>
  </section>
</template>

<script>
export default {
  name: 'PageHero',
  props: {
    tag: { type: String, required: true },
    title: { type: String, required: true },
    gradient: { type: String, default: '' },
    desc: { type: String, default: '' },
    orbColor: { type: String, default: 'rgba(177, 78, 255, 0.1)' }
  }
}
</script>

<style scoped>
.page-hero {
  position: relative;
  text-align: center;
  padding: var(--space-24) var(--space-6) var(--space-12);
  overflow: hidden;
}

.hero-grid-bg {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(0, 255, 136, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 255, 136, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

.hero-orb {
  position: absolute;
  width: 400px;
  height: 400px;
  border-radius: 50%;
  filter: blur(80px);
  top: -100px;
  right: -50px;
  pointer-events: none;
}

.hero-aurora {
  position: absolute;
  width: 500px;
  height: 250px;
  border-radius: 50%;
  filter: blur(100px);
  bottom: -50px;
  left: 10%;
  pointer-events: none;
  opacity: 0.5;
  animation: aurora-drift 18s ease-in-out infinite;
}

@keyframes aurora-drift {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.4; }
  25% { transform: translate(30px, -20px) scale(1.05); opacity: 0.6; }
  50% { transform: translate(-20px, 15px) scale(0.95); opacity: 0.35; }
  75% { transform: translate(15px, 25px) scale(1.02); opacity: 0.55; }
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.font-mono {
  font-family: var(--font-mono);
}

.page-tag {
  font-size: var(--text-sm);
  color: var(--neon-cyan);
  display: block;
  margin-bottom: var(--space-4);
  position: relative;
  z-index: 1;
}

.page-title {
  font-size: var(--text-5xl);
  font-weight: 800;
  color: var(--text-primary);
  letter-spacing: -0.03em;
  margin-bottom: var(--space-4);
  position: relative;
  z-index: 1;
}

.page-desc {
  font-size: var(--text-lg);
  color: var(--text-muted);
  position: relative;
  z-index: 1;
}

@media (max-width: 768px) {
  .page-hero {
    padding: var(--space-16) var(--space-4) var(--space-8);
  }
  .page-title {
    font-size: var(--text-3xl);
  }
}
</style>
