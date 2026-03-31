<template>
  <teleport to="body">
    <transition name="modal-fade">
      <div class="login-overlay" v-if="showLoginModal" @click.self="close">
        <div class="login-modal">
          <!-- 关闭按钮 -->
          <button class="modal-close-btn" @click="close">✕</button>

          <!-- 标题区域 -->
          <div class="modal-header">
            <div class="modal-logo">&lt;/&gt;</div>
            <h2 class="modal-title">{{ isLogin ? '欢迎回来' : '加入我们' }}</h2>
            <p class="modal-subtitle">
              {{ isLogin ? '登录后可畅玩所有游戏和工具' : '注册账号，畅玩所有游戏和工具' }}
            </p>
          </div>

          <!-- 表单 -->
          <form class="login-form" @submit.prevent="handleSubmit">
            <!-- 用户名 -->
            <div class="form-group">
              <label class="form-label">用户名</label>
              <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input
                  v-model="form.username"
                  type="text"
                  class="form-input"
                  placeholder="请输入用户名"
                  autocomplete="username"
                  required
                />
              </div>
            </div>

            <!-- 昵称（仅注册） -->
            <div class="form-group" v-if="!isLogin">
              <label class="form-label">昵称</label>
              <div class="input-wrapper">
                <span class="input-icon">✨</span>
                <input
                  v-model="form.nickname"
                  type="text"
                  class="form-input"
                  placeholder="给自己取个昵称"
                  autocomplete="nickname"
                  required
                />
              </div>
            </div>

            <!-- 密码 -->
            <div class="form-group">
              <label class="form-label">密码</label>
              <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input
                  v-model="form.password"
                  :type="showPassword ? 'text' : 'password'"
                  class="form-input"
                  placeholder="请输入密码"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="toggle-pwd" @click="showPassword = !showPassword">
                  {{ showPassword ? '🙈' : '👁️' }}
                </button>
              </div>
            </div>

            <!-- 错误提示 -->
            <div class="form-error" v-if="error">
              <span class="error-icon">⚠️</span> {{ error }}
            </div>

            <!-- 提交按钮 -->
            <button type="submit" class="submit-btn" :disabled="loading">
              <span class="btn-loader" v-if="loading"></span>
              <span v-else>{{ isLogin ? '登 录' : '注 册' }}</span>
            </button>
          </form>

          <!-- 切换登录/注册 -->
          <div class="modal-footer">
            <span class="footer-text">
              {{ isLogin ? '还没有账号？' : '已有账号？' }}
            </span>
            <button class="switch-btn" @click="toggleMode">
              {{ isLogin ? '立即注册' : '去登录' }}
            </button>
          </div>

          <!-- 提示信息 -->
          <div class="modal-tip">
            <span class="tip-icon">🎮</span>
            <span class="tip-text">一个账号，畅玩所有游戏和工具</span>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script>
import { ref, reactive, watch, computed } from 'vue'
import { authStore } from '@/services/auth.store.js'

export default {
  name: 'LoginModal',
  setup() {
    const showLoginModal = computed(() => authStore.state.showLoginModal)
    const isLogin = ref(true)
    const showPassword = ref(false)
    const loading = ref(false)
    const error = ref('')

    const form = reactive({
      username: '',
      password: '',
      nickname: '',
    })

    // 切换模式时清空错误
    const toggleMode = () => {
      isLogin.value = !isLogin.value
      error.value = ''
    }

    const close = () => {
      authStore.closeLoginModal()
      error.value = ''
    }

    const handleSubmit = async () => {
      error.value = ''
      loading.value = true

      try {
        let result
        if (isLogin.value) {
          result = await authStore.login(form.username, form.password)
        } else {
          if (!form.nickname) {
            error.value = '请输入昵称'
            loading.value = false
            return
          }
          result = await authStore.register(form.username, form.password, form.nickname)
        }

        if (result.ok) {
          close()
          // 重置表单
          form.username = ''
          form.password = ''
          form.nickname = ''
        } else {
          error.value = result.data?.error || (isLogin.value ? '登录失败' : '注册失败')
        }
      } catch (err) {
        error.value = '服务暂时不可用，请稍后重试'
      } finally {
        loading.value = false
      }
    }

    // 监听弹窗打开时重置状态
    watch(showLoginModal, (val) => {
      if (val) {
        error.value = ''
        loading.value = false
      }
    })

    return {
      showLoginModal,
      isLogin,
      showPassword,
      loading,
      error,
      form,
      toggleMode,
      close,
      handleSubmit,
    }
  },
}
</script>

<style scoped>
/* 遮罩层 */
.login-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
}

/* 弹窗主体 */
.login-modal {
  position: relative;
  width: 100%;
  max-width: 420px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-2xl);
  padding: var(--space-8);
  box-shadow: var(--shadow-glow-strong);
  animation: modal-slide-up 0.3s ease;
}

@keyframes modal-slide-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 关闭按钮 */
.modal-close-btn {
  position: absolute;
  top: var(--space-4);
  right: var(--space-4);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 107, 157, 0.1);
  border: 1px solid rgba(255, 107, 157, 0.2);
  border-radius: var(--radius-md);
  color: var(--neon-pink);
  font-size: var(--text-sm);
  cursor: pointer;
  transition: all 0.2s ease;
}

.modal-close-btn:hover {
  background: rgba(255, 107, 157, 0.2);
  border-color: var(--neon-pink);
}

/* 标题区域 */
.modal-header {
  text-align: center;
  margin-bottom: var(--space-6);
}

.modal-logo {
  font-family: var(--font-mono);
  font-size: var(--text-2xl);
  font-weight: 700;
  background: var(--gradient-primary);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-3);
}

.modal-title {
  font-size: var(--text-xl);
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.modal-subtitle {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.form-label {
  font-size: var(--text-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: var(--space-3);
  font-size: var(--text-sm);
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: var(--space-3) var(--space-4);
  padding-left: 2.5rem;
  background: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-primary);
  font-size: var(--text-sm);
  font-family: var(--font-sans);
  outline: none;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(168, 85, 247, 0.1);
}

.form-input::placeholder {
  color: var(--text-muted);
}

.toggle-pwd {
  position: absolute;
  right: var(--space-3);
  background: none;
  border: none;
  cursor: pointer;
  font-size: var(--text-sm);
  padding: var(--space-1);
}

/* 错误提示 */
.form-error {
  padding: var(--space-3);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: var(--radius-md);
  color: #EF4444;
  font-size: var(--text-sm);
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.error-icon {
  flex-shrink: 0;
}

/* 提交按钮 */
.submit-btn {
  width: 100%;
  padding: var(--space-3) var(--space-6);
  background: var(--gradient-primary);
  background-size: 200% 200%;
  animation: gradient-shift 4s ease infinite;
  border: none;
  border-radius: var(--radius-lg);
  color: #ffffff;
  font-size: var(--text-base);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 20px rgba(168, 85, 247, 0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 加载动画 */
.btn-loader {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 底部切换 */
.modal-footer {
  text-align: center;
  margin-top: var(--space-5);
}

.footer-text {
  font-size: var(--text-sm);
  color: var(--text-muted);
}

.switch-btn {
  background: none;
  border: none;
  color: var(--color-primary-light);
  font-size: var(--text-sm);
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
}

.switch-btn:hover {
  color: var(--color-primary);
  text-decoration: underline;
}

/* 提示信息 */
.modal-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  margin-top: var(--space-4);
  padding: var(--space-3);
  background: rgba(168, 85, 247, 0.06);
  border: 1px solid rgba(168, 85, 247, 0.1);
  border-radius: var(--radius-lg);
}

.tip-icon {
  font-size: var(--text-base);
}

.tip-text {
  font-size: var(--text-xs);
  color: var(--text-secondary);
  font-family: var(--font-mono);
}

/* 过渡动画 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .login-modal {
    max-width: 100%;
    margin: var(--space-4);
    padding: var(--space-6);
  }
}
</style>
