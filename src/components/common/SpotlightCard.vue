<!--
  SpotlightCard — 鼠标聚光灯卡片包装组件
  功能：鼠标移动时在卡片上产生柔和光照 + 3D 倾斜效果
  用法：<SpotlightCard><div class="your-card">...</div></SpotlightCard>
-->
<template>
  <div class="spotlight-wrap"
    ref="cardRef"
    @mousemove="onMouseMove"
    @mouseleave="onMouseLeave"
    @mouseenter="onMouseEnter"
    :style="cardStyle">
    <!-- 聚光灯光效层 -->
    <div class="spotlight-layer" :style="spotlightStyle"></div>
    <!-- 边框光效层 -->
    <div class="spotlight-border" :style="borderStyle"></div>
    <slot />
  </div>
</template>

<script>
import { ref, computed } from 'vue'

export default {
  name: 'SpotlightCard',
  props: {
    // 倾斜强度 (度)
    tiltMax: { type: Number, default: 8 },
    // 聚光灯颜色
    glowColor: { type: String, default: 'rgba(168, 85, 247, 0.08)' },
    // 边框光颜色
    borderColor: { type: String, default: 'rgba(168, 85, 247, 0.3)' },
    // 聚光灯半径
    glowRadius: { type: Number, default: 300 },
    // 是否启用倾斜
    tilt: { type: Boolean, default: true }
  },
  setup(props) {
    const cardRef = ref(null)
    const mouseX = ref(0)
    const mouseY = ref(0)
    const isHovering = ref(false)

    const spotlightStyle = computed(() => {
      if (!isHovering.value) return { opacity: 0 }
      return {
        opacity: 1,
        background: `radial-gradient(${props.glowRadius}px circle at ${mouseX.value}px ${mouseY.value}px, ${props.glowColor}, transparent 60%)`
      }
    })

    const borderStyle = computed(() => {
      if (!isHovering.value) return { opacity: 0 }
      return {
        opacity: 1,
        background: `radial-gradient(${props.glowRadius * 0.8}px circle at ${mouseX.value}px ${mouseY.value}px, ${props.borderColor}, transparent 60%)`
      }
    })

    const cardStyle = computed(() => {
      if (!isHovering.value || !props.tilt) {
        return { transform: 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)' }
      }
      const card = cardRef.value
      if (!card) return {}
      const w = card.offsetWidth
      const h = card.offsetHeight
      const rotateY = ((mouseX.value - w / 2) / w) * props.tiltMax
      const rotateX = -((mouseY.value - h / 2) / h) * props.tiltMax
      return {
        transform: `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`
      }
    })

    const onMouseMove = (e) => {
      const rect = cardRef.value?.getBoundingClientRect()
      if (!rect) return
      mouseX.value = e.clientX - rect.left
      mouseY.value = e.clientY - rect.top
    }

    const onMouseEnter = () => {
      isHovering.value = true
    }

    const onMouseLeave = () => {
      isHovering.value = false
    }

    return { cardRef, spotlightStyle, borderStyle, cardStyle, onMouseMove, onMouseLeave, onMouseEnter }
  }
}
</script>

<style scoped>
.spotlight-wrap {
  position: relative;
  overflow: hidden;
  border-radius: inherit;
  transition: transform 0.2s ease-out;
  will-change: transform;
}

.spotlight-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;
  border-radius: inherit;
  transition: opacity 0.3s ease;
}

.spotlight-border {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 2;
  border-radius: inherit;
  transition: opacity 0.3s ease;
  /* 只显示边框部分 */
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: xor;
  -webkit-mask-composite: xor;
  padding: 1px;
}

/* 移动端禁用倾斜 */
@media (pointer: coarse) {
  .spotlight-wrap {
    transform: none !important;
  }
}
</style>
