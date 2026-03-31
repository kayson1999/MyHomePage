<template>
  <div class="user-menu">
    <!-- 未登录：显示登录按钮 -->
    <button v-if="!user" class="login-btn" @click="openLogin" title="登录 / 注册">
      <span class="login-icon">👤</span>
      <span class="login-text">登录</span>
    </button>

    <!-- 已登录：显示用户头像和下拉菜单 -->
    <div v-else class="user-avatar-wrap" @click="toggleMenu" ref="avatarRef">
      <div class="user-avatar" :title="user.nickname || user.username">
        {{ avatarText }}
      </div>
      <!-- 下拉菜单 -->
      <transition name="dropdown-fade">
        <div class="dropdown-menu" v-if="menuOpen" @click.stop>
          <div class="dropdown-header">
            <div class="dropdown-avatar">{{ avatarText }}</div>
            <div class="dropdown-info">
              <span class="dropdown-name">{{ user.nickname || user.username }}</span>
              <span class="dropdown-id">@{{ user.username }}</span>
            </div>
          </div>
          <div class="dropdown-divider"></div>
          <div class="dropdown-tip">
            <span class="tip-badge">🎮</span>
            <span>可畅玩所有游戏和工具</span>
          </div>
          <div class="dropdown-divider"></div>
          <button class="dropdown-item logout-item" @click="handleLogout">
            <span class="item-icon">🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </transition>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { authStore } from '@/services/auth.store.js'

export default {
  name: 'UserMenu',
  setup() {
    const menuOpen = ref(false)
    const avatarRef = ref(null)

    const user = computed(() => authStore.state.user)

    const avatarText = computed(() => {
      if (!user.value) return ''
      const name = user.value.nickname || user.value.username || ''
      return name.charAt(0).toUpperCase()
    })

    const openLogin = () => {
      authStore.openLoginModal()
    }

    const toggleMenu = () => {
      menuOpen.value = !menuOpen.value
    }

    const handleLogout = async () => {
      menuOpen.value = false
      await authStore.logout()
    }

    // 点击外部关闭菜单
    const handleClickOutside = (e) => {
      if (avatarRef.value && !avatarRef.value.contains(e.target)) {
        menuOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return { user, avatarText, menuOpen, avatarRef, openLogin, toggleMenu, handleLogout }
  },
}
</script>

<style scoped>
.user-menu {
  position: relative;
}

/* 登录按钮 */
.login-btn {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-4);
  background: rgba(168, 85, 247, 0.1);
  border: 1px solid rgba(168, 85, 247, 0.2);
  border-radius: var(--radius-lg);
  color: var(--color-primary-light);
  font-size: var(--text-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.login-btn:hover {
  background: rgba(168, 85, 247, 0.2);
  border-color: var(--color-primary);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.15);
}

.login-icon {
  font-size: var(--text-sm);
}

.login-text {
  font-family: var(--font-sans);
}

/* 用户头像 */
.user-avatar-wrap {
  position: relative;
  cursor: pointer;
}

.user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: var(--text-sm);
  border: 2px solid rgba(168, 85, 247, 0.3);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  border-color: var(--color-primary-light);
  box-shadow: 0 0 12px rgba(168, 85, 247, 0.3);
}

/* 下拉菜单 */
.dropdown-menu {
  position: absolute;
  top: calc(100% + var(--space-2));
  right: 0;
  width: 240px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-3);
  box-shadow: var(--shadow-glow-strong);
  z-index: 1001;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3);
}

.dropdown-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--gradient-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: var(--text-base);
  flex-shrink: 0;
}

.dropdown-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.dropdown-name {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-id {
  font-size: var(--text-xs);
  color: var(--text-muted);
  font-family: var(--font-mono);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-2) 0;
}

.dropdown-tip {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-2) var(--space-3);
  font-size: var(--text-xs);
  color: var(--text-secondary);
}

.tip-badge {
  font-size: var(--text-sm);
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  width: 100%;
  padding: var(--space-2) var(--space-3);
  background: none;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: rgba(168, 85, 247, 0.08);
  color: var(--text-primary);
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #EF4444;
}

.item-icon {
  font-size: var(--text-sm);
}

/* 下拉动画 */
.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: all 0.2s ease;
}

.dropdown-fade-enter-from,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* 响应式 */
@media (max-width: 768px) {
  .login-text {
    display: none;
  }

  .login-btn {
    padding: var(--space-2);
  }

  .dropdown-menu {
    right: -var(--space-4);
    width: 220px;
  }
}
</style>
