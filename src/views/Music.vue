<template>
  <div class="music">
    <!-- 页面头部 -->
    <PageHero :tag="pageConfig.tag" :title="pageConfig.title" :gradient="pageConfig.titleGradient"
      :desc="pageConfig.desc" orb-color="rgba(168, 85, 247, 0.06)" />

    <!-- 音乐列表 -->
    <section class="music-section">
      <div class="container">
        <!-- 加载中 -->
        <div v-if="loading" class="loading-state">
          <span class="loading-icon">⏳</span>
          <span class="loading-text">加载中...</span>
        </div>

        <div v-else class="music-list">
          <SpotlightCard v-for="track in tracks" :key="track.id" :tilt-max="5" :glow-color="'rgba(168, 85, 247, 0.08)'">
          <div
            class="track-card glass-card"
            :class="{ 'is-playing': currentAudio?.id === track.id && audioPlaying }">
            <!-- 封面 -->
            <div class="track-cover" @click="toggleAudio(track)">
              <span class="track-cover-icon">{{ track.cover || '🎵' }}</span>
              <div class="track-play-overlay">
                <span class="track-play-btn">
                  {{ currentAudio?.id === track.id && audioPlaying ? '⏸' : '▶' }}
                </span>
              </div>
              <!-- 播放中动画 -->
              <div v-if="currentAudio?.id === track.id && audioPlaying" class="equalizer">
                <span></span><span></span><span></span><span></span>
              </div>
            </div>
            <!-- 信息 -->
            <div class="track-body">
              <div class="track-header">
                <span class="track-badge">{{ track.category }}</span>
                <span class="track-date font-mono">{{ track.date }}</span>
              </div>
              <h3 class="track-title" @click="toggleAudio(track)">{{ track.title }}</h3>
              <p class="track-artist font-mono">{{ track.artist || 'Unknown' }} · {{ track.duration || '--:--' }}</p>
              <p class="track-desc">{{ track.excerpt }}</p>
              <!-- 内嵌进度条 -->
              <div v-if="currentAudio?.id === track.id" class="track-progress">
                <span class="progress-time font-mono">{{ formatTime(audioCurrentTime) }}</span>
                <div class="progress-bar" @click="audioSeek($event)">
                  <div class="progress-track">
                    <div class="progress-fill" :style="{ width: audioProgressPercent + '%' }"></div>
                  </div>
                </div>
                <span class="progress-time font-mono">{{ formatTime(audioDuration) }}</span>
              </div>
              <div class="track-tags">
                <span class="track-tag font-mono" v-for="tag in track.tags" :key="tag">#{{ tag }}</span>
              </div>
            </div>
          </div>
          </SpotlightCard>
        </div>

        <!-- 空状态 -->
        <EmptyState v-if="!loading && tracks.length === 0" icon="🎵" text="暂无音乐" />
      </div>
    </section>

    <!-- 底部音频播放器栏（全局固定） -->
    <Transition name="player-slide">
      <div v-if="currentAudio" class="player-bar">
        <div class="player-container">
          <div class="player-info">
            <span class="player-icon">{{ currentAudio.cover || '🎵' }}</span>
            <div class="player-text">
              <span class="player-title">{{ currentAudio.title }}</span>
              <span class="player-artist font-mono">{{ currentAudio.artist || 'Unknown' }}</span>
            </div>
          </div>
          <div class="player-controls">
            <button class="ctrl-btn" @click.stop="audioSkip(-10)" title="后退 10s">⏪</button>
            <button class="ctrl-btn ctrl-play" @click.stop="toggleAudio(currentAudio)">
              {{ audioPlaying ? '⏸' : '▶' }}
            </button>
            <button class="ctrl-btn" @click.stop="audioSkip(10)" title="前进 10s">⏩</button>
          </div>
          <div class="player-progress">
            <span class="progress-time font-mono">{{ formatTime(audioCurrentTime) }}</span>
            <div class="progress-bar" @click="audioSeek($event)">
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: audioProgressPercent + '%' }"></div>
              </div>
            </div>
            <span class="progress-time font-mono">{{ formatTime(audioDuration) }}</span>
          </div>
          <div class="player-actions">
            <div class="volume-control">
              <button class="ctrl-btn" @click.stop="toggleMute">{{ audioMuted ? '🔇' : '🔊' }}</button>
              <input type="range" min="0" max="1" step="0.01" :value="audioVolume" class="volume-slider"
                @input="changeVolume" />
            </div>
            <button class="ctrl-btn ctrl-close" @click.stop="closeAudio" title="关闭播放器">✕</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 隐藏的音频元素 -->
    <audio ref="audioRef" :src="audioSrc"
      @timeupdate="onAudioTimeUpdate" @loadedmetadata="onAudioLoaded"
      @play="audioPlaying = true" @pause="audioPlaying = false"
      @ended="onAudioEnded"></audio>
  </div>
</template>

<script>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { musicPageConfig } from '@/config/site.config.js'
import { getMusicTracks } from '@/services/data.service.js'
import { PageHero, EmptyState, SpotlightCard } from '@/components/common'

export default {
  name: 'Music',
  components: { PageHero, EmptyState, SpotlightCard },
  setup() {
    const pageConfig = musicPageConfig

    // 异步加载音乐列表
    const tracks = ref([])
    const loading = ref(true)

    onMounted(async () => {
      try {
        tracks.value = await getMusicTracks()
      } catch (e) {
        console.error('加载音乐数据失败:', e)
      } finally {
        loading.value = false
      }
    })

    // ==================== 音频播放器 ====================
    const audioRef = ref(null)
    const currentAudio = ref(null)
    const audioSrc = ref('')
    const audioPlaying = ref(false)
    const audioCurrentTime = ref(0)
    const audioDuration = ref(0)
    const audioVolume = ref(0.8)
    const audioMuted = ref(false)

    const audioProgressPercent = computed(() => {
      if (audioDuration.value === 0) return 0
      return (audioCurrentTime.value / audioDuration.value) * 100
    })

    const toggleAudio = (track) => {
      if (currentAudio.value?.id === track.id) {
        if (audioPlaying.value) {
          audioRef.value?.pause()
        } else {
          audioRef.value?.play().catch(e => console.warn('播放失败:', e))
        }
        return
      }
      currentAudio.value = track
      audioCurrentTime.value = 0
      audioDuration.value = 0
      audioSrc.value = track.src
      setTimeout(() => {
        if (audioRef.value) {
          audioRef.value.volume = audioVolume.value
          audioRef.value.muted = audioMuted.value
          audioRef.value.play().catch(e => console.warn('自动播放被阻止:', e))
        }
      }, 100)
    }

    const audioSkip = (seconds) => {
      if (audioRef.value) {
        audioRef.value.currentTime = Math.max(0, Math.min(audioRef.value.duration || 0, audioRef.value.currentTime + seconds))
      }
    }

    const audioSeek = (e) => {
      if (!audioRef.value || !audioDuration.value) return
      const rect = e.currentTarget.getBoundingClientRect()
      const percent = (e.clientX - rect.left) / rect.width
      audioRef.value.currentTime = percent * audioDuration.value
    }

    const changeVolume = (e) => {
      audioVolume.value = parseFloat(e.target.value)
      if (audioRef.value) {
        audioRef.value.volume = audioVolume.value
        audioMuted.value = audioVolume.value === 0
      }
    }

    const toggleMute = () => {
      audioMuted.value = !audioMuted.value
      if (audioRef.value) audioRef.value.muted = audioMuted.value
    }

    const closeAudio = () => {
      if (audioRef.value) audioRef.value.pause()
      currentAudio.value = null
      audioSrc.value = ''
      audioPlaying.value = false
    }

    const onAudioTimeUpdate = (e) => { audioCurrentTime.value = e.target.currentTime }
    const onAudioLoaded = (e) => { audioDuration.value = e.target.duration }
    const onAudioEnded = () => { audioPlaying.value = false; audioCurrentTime.value = 0 }

    const formatTime = (seconds) => {
      if (!seconds || isNaN(seconds)) return '0:00'
      const m = Math.floor(seconds / 60)
      const s = Math.floor(seconds % 60)
      return `${m}:${s.toString().padStart(2, '0')}`
    }

    onBeforeUnmount(() => {
      if (audioRef.value) audioRef.value.pause()
    })

    return {
      pageConfig, tracks, loading,
      audioRef, currentAudio, audioSrc, audioPlaying, audioCurrentTime, audioDuration,
      audioVolume, audioMuted, audioProgressPercent,
      toggleAudio, audioSkip, audioSeek, changeVolume, toggleMute, closeAudio,
      onAudioTimeUpdate, onAudioLoaded, onAudioEnded, formatTime
    }
  }
}
</script>

<style scoped>
.font-mono { font-family: var(--font-mono); }
.container { max-width: 900px; margin: 0 auto; }

/* ========== 加载状态 ========== */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-20) 0;
  gap: var(--space-4);
}

.loading-icon {
  font-size: 2.5rem;
  animation: spin 1.5s linear infinite;
}

.loading-text {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  color: var(--text-muted);
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* ========== 音乐列表 ========== */
.music-section {
  padding: var(--space-16) var(--space-6);
  padding-bottom: 120px;
}

.music-list {
  display: grid;
  gap: var(--space-6);
}

/* ========== 音乐卡片 ========== */
.track-card {
  display: flex;
  gap: var(--space-5);
  padding: var(--space-5);
  cursor: default;
  transition: all 0.3s ease;
  overflow: hidden;
}

.track-card:hover {
  transform: translateY(-3px);
  border-color: rgba(168, 85, 247, 0.4);
  box-shadow: 0 8px 30px rgba(168, 85, 247, 0.12);
}

.track-card.is-playing {
  border-color: rgba(168, 85, 247, 0.5);
  box-shadow: 0 0 20px rgba(168, 85, 247, 0.15);
}

.track-cover {
  width: 110px;
  height: 110px;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(99, 102, 241, 0.2));
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
  cursor: pointer;
  overflow: hidden;
  transition: transform 0.3s;
}

.track-cover:hover { transform: scale(1.05); }

.track-cover-icon {
  font-size: 2.5rem;
  transition: opacity 0.3s;
}

.track-play-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  opacity: 0;
  transition: opacity 0.3s;
}

.track-cover:hover .track-play-overlay,
.is-playing .track-play-overlay {
  opacity: 1;
}

.track-play-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(168, 85, 247, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 4px 12px rgba(168, 85, 247, 0.4);
}

/* 均衡器动画 */
.equalizer {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;
}

.equalizer span {
  width: 3px;
  background: #c084fc;
  border-radius: 1px;
  animation: eq-bar 0.8s ease-in-out infinite;
}

.equalizer span:nth-child(1) { animation-delay: 0s; height: 60%; }
.equalizer span:nth-child(2) { animation-delay: 0.2s; height: 100%; }
.equalizer span:nth-child(3) { animation-delay: 0.4s; height: 40%; }
.equalizer span:nth-child(4) { animation-delay: 0.1s; height: 80%; }

@keyframes eq-bar {
  0%, 100% { height: 30%; }
  50% { height: 100%; }
}

.track-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.track-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.track-badge {
  padding: 3px var(--space-3);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: 600;
  letter-spacing: 0.03em;
  background: rgba(168, 85, 247, 0.12);
  color: #c084fc;
  border: 1px solid rgba(168, 85, 247, 0.25);
}

.track-date {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.track-title {
  font-size: var(--text-lg);
  font-weight: 600;
  color: var(--text-primary);
  cursor: pointer;
  transition: color 0.3s;
  line-height: 1.4;
}

.track-title:hover { color: #c084fc; }

.track-artist {
  font-size: var(--text-xs);
  color: var(--text-muted);
}

.track-desc {
  font-size: var(--text-xs);
  color: var(--text-muted);
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.track-tags {
  display: flex;
  gap: var(--space-2);
  margin-top: var(--space-1);
}

.track-tag {
  font-size: var(--text-xs);
  color: #a78bfa;
  transition: color 0.2s;
}

.track-tag:hover { color: #c084fc; }

/* 内嵌进度条 */
.track-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-top: var(--space-2);
}

.progress-time {
  font-size: 10px;
  color: var(--text-muted);
  min-width: 32px;
  text-align: center;
}

.progress-bar {
  flex: 1;
  cursor: pointer;
  padding: 4px 0;
}

.progress-track {
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #a855f7, #6366f1);
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-bar:hover .progress-track {
  height: 6px;
}

/* ========== 底部播放器栏 ========== */
.player-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(168, 85, 247, 0.2);
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.3);
}

.player-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--space-3) var(--space-6);
  display: flex;
  align-items: center;
  gap: var(--space-4);
}

.player-info {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  min-width: 160px;
  flex-shrink: 0;
}

.player-icon { font-size: 1.5rem; }

.player-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow: hidden;
}

.player-title {
  font-size: var(--text-sm);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-artist {
  font-size: 10px;
  color: var(--text-muted);
}

.player-controls {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.ctrl-btn {
  width: 36px;
  height: 36px;
  border-radius: var(--radius-full);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.ctrl-btn:hover {
  border-color: rgba(168, 85, 247, 0.5);
  color: #c084fc;
  background: rgba(168, 85, 247, 0.1);
}

.ctrl-play {
  width: 42px;
  height: 42px;
  font-size: 1.1rem;
  border-color: rgba(168, 85, 247, 0.4);
  color: #c084fc;
}

.ctrl-play:hover {
  background: rgba(168, 85, 247, 0.2);
  box-shadow: 0 0 15px rgba(168, 85, 247, 0.3);
}

.ctrl-close:hover {
  border-color: rgba(255, 95, 86, 0.4);
  color: #FF5F56;
  background: rgba(255, 95, 86, 0.1);
}

.player-progress {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex: 1;
  min-width: 0;
}

.player-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-shrink: 0;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.volume-slider {
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #a855f7;
  cursor: pointer;
  box-shadow: 0 0 6px rgba(168, 85, 247, 0.4);
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #a855f7;
  cursor: pointer;
  border: none;
}

/* ========== 动画 ========== */
.player-slide-enter-active,
.player-slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.player-slide-enter-from,
.player-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .music-section { padding: var(--space-12) var(--space-4); padding-bottom: 140px; }

  .track-card { flex-direction: column; gap: var(--space-3); }
  .track-cover { width: 100%; height: 80px; }

  .player-container {
    flex-wrap: wrap;
    gap: var(--space-2);
    padding: var(--space-2) var(--space-4);
  }
  .player-info { min-width: auto; flex: 1; }
  .player-progress { order: 3; width: 100%; flex-basis: 100%; }
  .volume-control { display: none; }
}
</style>
