<!--
  CursorGlow — 自定义光标组件
  功能：小圆点 + 延迟跟随光环 + 点击涟漪
  用法：在 App.vue 中引入即可全局生效
-->
<template>
  <div class="cursor-system" :class="{ 'is-hidden': !visible }">
    <!-- 内圆点 — 精确跟随 -->
    <div class="cursor-dot" ref="dotRef"></div>
    <!-- 外光环 — 延迟跟随 -->
    <div class="cursor-ring" ref="ringRef" :class="{ 'is-hover': isHover, 'is-click': isClick }"></div>
    <!-- 点击涟漪 -->
    <div v-for="ripple in ripples" :key="ripple.id"
      class="cursor-ripple"
      :style="{ left: ripple.x + 'px', top: ripple.y + 'px' }">
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'

export default {
  name: 'CursorGlow',
  setup() {
    const dotRef = ref(null)
    const ringRef = ref(null)
    const visible = ref(false)
    const isHover = ref(false)
    const isClick = ref(false)
    const ripples = ref([])

    let mouseX = 0, mouseY = 0
    let ringX = 0, ringY = 0
    let rafId = null
    let rippleId = 0

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      visible.value = true

      if (dotRef.value) {
        dotRef.value.style.transform = `translate(${mouseX}px, ${mouseY}px)`
      }
    }

    const onMouseDown = (e) => {
      isClick.value = true
      // 添加涟漪
      const id = ++rippleId
      ripples.value.push({ id, x: e.clientX, y: e.clientY })
      setTimeout(() => {
        ripples.value = ripples.value.filter(r => r.id !== id)
      }, 600)
    }

    const onMouseUp = () => {
      isClick.value = false
    }

    const onMouseOver = (e) => {
      const target = e.target
      const isInteractive = target.closest('a, button, [role="button"], input, textarea, select, .tool-card, .article-card, .track-card, .nav-pill, .dock-item, .btn')
      isHover.value = !!isInteractive
    }

    const onMouseLeave = () => {
      visible.value = false
    }

    const onMouseEnter = () => {
      visible.value = true
    }

    // 光环延迟跟随动画
    const animateRing = () => {
      const ease = 0.15
      ringX += (mouseX - ringX) * ease
      ringY += (mouseY - ringY) * ease

      if (ringRef.value) {
        ringRef.value.style.transform = `translate(${ringX}px, ${ringY}px)`
      }

      rafId = requestAnimationFrame(animateRing)
    }

    onMounted(() => {
      // 仅在非触摸设备上启用
      if (window.matchMedia('(pointer: fine)').matches) {
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mousedown', onMouseDown)
        document.addEventListener('mouseup', onMouseUp)
        document.addEventListener('mouseover', onMouseOver)
        document.documentElement.addEventListener('mouseleave', onMouseLeave)
        document.documentElement.addEventListener('mouseenter', onMouseEnter)
        rafId = requestAnimationFrame(animateRing)
        // 隐藏默认光标
        document.documentElement.classList.add('custom-cursor-active')
      }
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseover', onMouseOver)
      document.documentElement.removeEventListener('mouseleave', onMouseLeave)
      document.documentElement.removeEventListener('mouseenter', onMouseEnter)
      if (rafId) cancelAnimationFrame(rafId)
      document.documentElement.classList.remove('custom-cursor-active')
    })

    return { dotRef, ringRef, visible, isHover, isClick, ripples }
  }
}
</script>

<style>
/* 全局：隐藏默认光标 */
.custom-cursor-active,
.custom-cursor-active * {
  cursor: none !important;
}
</style>

<style scoped>
.cursor-system {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
  transition: opacity 0.3s;
}

.cursor-system.is-hidden {
  opacity: 0;
}

/* 内圆点 */
.cursor-dot {
  position: absolute;
  top: -4px;
  left: -4px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #C084FC;
  box-shadow: 0 0 10px rgba(192, 132, 252, 0.6), 0 0 20px rgba(168, 85, 247, 0.3);
  will-change: transform;
  transition: width 0.2s, height 0.2s, top 0.2s, left 0.2s, background 0.2s;
}

/* 外光环 */
.cursor-ring {
  position: absolute;
  top: -20px;
  left: -20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid rgba(168, 85, 247, 0.4);
  background: radial-gradient(circle, rgba(168, 85, 247, 0.06) 0%, transparent 70%);
  will-change: transform;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              height 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              top 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              left 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.3s,
              background 0.3s;
}

/* 悬停交互元素时光环放大 */
.cursor-ring.is-hover {
  width: 56px;
  height: 56px;
  top: -28px;
  left: -28px;
  border-color: rgba(192, 132, 252, 0.6);
  background: radial-gradient(circle, rgba(168, 85, 247, 0.1) 0%, transparent 70%);
}

/* 点击时光环缩小 */
.cursor-ring.is-click {
  width: 32px;
  height: 32px;
  top: -16px;
  left: -16px;
  border-color: rgba(244, 114, 182, 0.6);
}

/* 点击涟漪 */
.cursor-ripple {
  position: absolute;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(168, 85, 247, 0.3) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  animation: ripple-expand 0.6s ease-out forwards;
}

@keyframes ripple-expand {
  0% {
    width: 0;
    height: 0;
    opacity: 0.6;
  }
  100% {
    width: 80px;
    height: 80px;
    opacity: 0;
  }
}

/* 移动端不显示 */
@media (pointer: coarse) {
  .cursor-system {
    display: none;
  }
}
</style>
