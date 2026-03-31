
<template>
  <div class="pagination" v-if="totalPages > 1">
    <button class="page-btn prev-btn" :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
      ← 上一页
    </button>
    <div class="page-numbers">
      <button
        v-for="page in displayPages"
        :key="page"
        :class="['page-num', { active: page === currentPage, ellipsis: page === '...' }]"
        :disabled="page === '...'"
        @click="page !== '...' && changePage(page)"
      >
        {{ page }}
      </button>
    </div>
    <button class="page-btn next-btn" :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
      下一页 →
    </button>
  </div>
</template>

<script>
import { computed } from 'vue'

export default {
  name: 'Pagination',
  props: {
    currentPage: { type: Number, default: 1 },
    totalPages: { type: Number, default: 1 }
  },
  emits: ['update:currentPage'],
  setup(props, { emit }) {
    const displayPages = computed(() => {
      const total = props.totalPages
      const current = props.currentPage
      if (total <= 5) {
        return Array.from({ length: total }, (_, i) => i + 1)
      }
      const pages = []
      pages.push(1)
      if (current > 3) pages.push('...')
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)
      for (let i = start; i <= end; i++) pages.push(i)
      if (current < total - 2) pages.push('...')
      pages.push(total)
      return pages
    })

    const changePage = (page) => {
      if (page >= 1 && page <= props.totalPages) {
        emit('update:currentPage', page)
        // 滚动到页面顶部
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    return { displayPages, changePage }
  }
}
</script>

<style scoped>
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  padding: var(--space-8) 0 var(--space-4);
}

.page-btn {
  padding: var(--space-2) var(--space-5);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-secondary);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: var(--font-sans);
}

.page-btn:hover:not(:disabled) {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
  box-shadow: 0 0 12px rgba(0, 255, 136, 0.1);
}

.page-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.page-num {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: transparent;
  color: var(--text-muted);
  font-size: var(--text-sm);
  font-family: var(--font-mono);
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-num:hover:not(:disabled):not(.active) {
  border-color: var(--color-primary);
  color: var(--color-primary-light);
}

.page-num.active {
  background: var(--gradient-primary);
  border-color: transparent;
  color: white;
  box-shadow: 0 2px 10px rgba(0, 255, 136, 0.25);
  cursor: default;
}

.page-num.ellipsis {
  border: none;
  cursor: default;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .pagination {
    gap: var(--space-2);
  }
  .page-btn {
    padding: var(--space-2) var(--space-3);
    font-size: var(--text-xs);
  }
  .page-num {
    width: 32px;
    height: 32px;
    font-size: var(--text-xs);
  }
}
</style>
