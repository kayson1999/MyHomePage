<!--
  EmptyState — 通用空状态组件
  用法: <EmptyState icon="🔍" text="暂无内容" />
-->
<template>
  <div class="empty-state">
    <span class="empty-icon">{{ icon }}</span>
    <p class="empty-text">{{ text }}</p>
  </div>
</template>

<script>
export default {
  name: 'EmptyState',
  props: {
    icon: { type: String, default: '📭' },
    text: { type: String, default: '暂无内容' }
  }
}
</script>

<style scoped>
.empty-state {
  text-align: center;
  padding: var(--space-20) 0;
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: var(--space-4);
}

.empty-text {
  color: var(--text-muted);
}
</style>
