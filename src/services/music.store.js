/**
 * 全局音乐播放器状态管理
 *
 * 将音频播放状态提升为全局单例，支持：
 *  - 跨页面后台播放（切换路由不中断）
 *  - 迷你播放器控制条（全局显示）
 *  - 完整播放器弹窗（从任意页面展开）
 */
import { reactive, ref } from 'vue'
import { getMusicAudioUrl, getMusicLyrics } from '@/services/data.service.js'

// ==================== 响应式状态 ====================
const state = reactive({
  /** 当前播放的音乐条目（来自 blog/index.json 中 type=music 的条目） */
  currentMusic: null,
  /** 是否正在播放 */
  isPlaying: false,
  /** 当前播放时间（秒） */
  currentTime: 0,
  /** 总时长（秒） */
  duration: 0,
  /** 播放进度百分比 0-100 */
  progressPercent: 0,
  /** 音量 0-1 */
  volume: 0.8,
  /** 是否静音 */
  isMuted: false,
  /** 歌词文本 */
  lyricsText: '',
  /** 歌词加载中 */
  lyricsLoading: false,
  /** 是否显示完整播放器弹窗 */
  showFullPlayer: false,
  /** 是否显示迷你播放器（有歌曲加载后即显示） */
  showMiniPlayer: false,
})

/** audio 元素引用，由 App.vue 绑定 */
const audioRef = ref(null)

// ==================== 播放控制 ====================

/**
 * 打开音乐播放器并加载歌曲
 * @param {Object} post - 音乐条目对象
 */
async function play(post) {
  // 如果是同一首歌，直接展开播放器
  if (state.currentMusic && state.currentMusic.id === post.id) {
    state.showFullPlayer = true
    if (!state.isPlaying && audioRef.value) {
      audioRef.value.play()
    }
    return
  }

  state.currentMusic = { ...post }
  state.lyricsText = ''
  state.showFullPlayer = true
  state.showMiniPlayer = true

  // 设置音频源
  if (post.audioFile && audioRef.value) {
    audioRef.value.src = getMusicAudioUrl(post.audioFile)
    audioRef.value.volume = state.volume
    audioRef.value.load()
    // 自动播放
    try {
      await audioRef.value.play()
    } catch (e) {
      console.warn('自动播放被阻止:', e.message)
    }
  }

  // 加载歌词
  if (post.lyricsFile) {
    state.lyricsLoading = true
    try {
      state.lyricsText = await getMusicLyrics(post.lyricsFile)
    } catch (e) {
      console.error('加载歌词失败:', e)
      state.lyricsText = '歌词加载失败，请稍后重试'
    } finally {
      state.lyricsLoading = false
    }
  }
}

/** 播放/暂停切换 */
function togglePlay() {
  if (!audioRef.value) return
  if (state.isPlaying) {
    audioRef.value.pause()
  } else {
    audioRef.value.play()
  }
}

/** 跳转到指定进度 */
function seekTo(event) {
  if (!audioRef.value || !state.duration) return
  const bar = event.currentTarget
  const rect = bar.getBoundingClientRect()
  const percent = (event.clientX - rect.left) / rect.width
  audioRef.value.currentTime = percent * state.duration
}

/** 后退 10 秒 */
function rewind() {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
}

/** 前进 10 秒 */
function forward() {
  if (!audioRef.value) return
  audioRef.value.currentTime = Math.min(state.duration, audioRef.value.currentTime + 10)
}

/** 设置音量 */
function setVolume(event) {
  const val = parseFloat(event.target.value)
  state.volume = val
  if (audioRef.value) {
    audioRef.value.volume = val
    state.isMuted = val === 0
  }
}

/** 静音切换 */
function toggleMute() {
  if (!audioRef.value) return
  state.isMuted = !state.isMuted
  audioRef.value.muted = state.isMuted
}

/** 格式化时间 */
function formatTime(seconds) {
  if (!seconds || isNaN(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ==================== audio 事件处理 ====================

function onTimeUpdate() {
  if (!audioRef.value) return
  state.currentTime = audioRef.value.currentTime
  if (state.duration > 0) {
    state.progressPercent = (state.currentTime / state.duration) * 100
  }
}

function onLoadedMetadata() {
  if (!audioRef.value) return
  state.duration = audioRef.value.duration
}

function onEnded() {
  state.isPlaying = false
  state.progressPercent = 0
  state.currentTime = 0
}

function onPlay() {
  state.isPlaying = true
}

function onPause() {
  state.isPlaying = false
}

// ==================== 弹窗控制 ====================

/** 展开完整播放器 */
function openFullPlayer() {
  state.showFullPlayer = true
}

/** 关闭完整播放器（不停止播放） */
function closeFullPlayer() {
  state.showFullPlayer = false
}

/** 完全停止并关闭 */
function stopAndClose() {
  if (audioRef.value) {
    audioRef.value.pause()
    audioRef.value.currentTime = 0
    audioRef.value.src = ''
  }
  state.isPlaying = false
  state.currentMusic = null
  state.showFullPlayer = false
  state.showMiniPlayer = false
  state.progressPercent = 0
  state.currentTime = 0
  state.duration = 0
  state.lyricsText = ''
}

// ==================== 导出 ====================
export const musicStore = {
  state,
  audioRef,
  // 播放控制
  play,
  togglePlay,
  seekTo,
  rewind,
  forward,
  setVolume,
  toggleMute,
  formatTime,
  // audio 事件
  onTimeUpdate,
  onLoadedMetadata,
  onEnded,
  onPlay,
  onPause,
  // 弹窗控制
  openFullPlayer,
  closeFullPlayer,
  stopAndClose,
}
