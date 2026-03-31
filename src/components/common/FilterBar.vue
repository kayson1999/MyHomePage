<!--
  FilterBar — 通用筛选栏组件（可吸顶）
  用法: <FilterBar :items="tabs" v-model="active" :sticky="true" />
-->
<template>
  <section class="filter-section" :class="{ sticky }">
    <div class="container">
      <div class="filter-bar">
        <button
          v-for="item in items"
          :key="item.id || item"
          :class="['filter-chip', { active: modelValue === (item.id || item) }]"
          @click="$emit('update:modelValue', item.id || item)"
        >
          <span class="chip-icon" v-if="item.icon">{{ item.icon }}</span>
          {{ item.label || item }}
        </button>
      </div>
    </div>
  </section>
</template>

<script>
export default {
  name: 'FilterBar',
  props: {
    /** 筛选项数组，可以是字符串数组（如 ['全部','技术']）或对象数组（如 [{id, label, icon}]） */
    items: { type: Array, required: true },
    /** 当前选中值，通过 v-model 双向绑定 */
    modelValue: { type: [String, Number], required: true },
    /** 是否吸顶 */
    sticky: { type: Boolean, default: true }
  },
  emits: ['update:modelValue']
}
</script>

<style scoped>
.filter-section {
  padding: var(--space-6);
}

.filter-section.sticky {
  position: sticky;
  top: 68px;
  z-index: 50;
  background: rgba(10, 10, 26, 0.8);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
}

.container {
  max-width: 1280px;
  margin: 0 auto;
}

.filter-bar {
  display: flex;
  justify-content: center;
  gap: var(--space-3);
  flex-wrap: wrap;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-6);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-chip:hover {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}

.filter-chip.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
box-shadow: 0 4px 15px rgba(0, 255, 136, 0.2);
}

.chip-icon {
  font-size: var(--text-base);
}
</style>
