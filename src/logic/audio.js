import { useSettingsStore } from '../store/settingsStore'

// Simple synthesized Web Audio API sound effects (no external assets needed)
let audioCtx = null

const getAudioContext = () => {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

export const playTradeSound = (type = 'sell') => {
  try {
    const { soundEnabled, soundVolume = 0.7 } = useSettingsStore.getState()
    if (!soundEnabled) return

    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    if (type === 'sell') {
      // Pleasant double chime: C5 (523Hz) -> G5 (784Hz)
      const osc1 = ctx.createOscillator()
      const osc2 = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc1.type = 'triangle'
      osc2.type = 'sine'

      osc1.frequency.setValueAtTime(523.25, now)
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.12)

      osc2.frequency.setValueAtTime(783.99, now + 0.08)
      osc2.frequency.exponentialRampToValueAtTime(1046.5, now + 0.22)

      const volume = Math.min(1, Math.max(0, soundVolume * 0.25))
      gainNode.gain.setValueAtTime(volume, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3)

      osc1.connect(gainNode)
      osc2.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc1.start(now)
      osc2.start(now + 0.06)
      osc1.stop(now + 0.2)
      osc2.stop(now + 0.3)
    } else {
      // Soft purchase pop/click: 440Hz -> 260Hz
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(220, now + 0.15)

      const volume = Math.min(1, Math.max(0, soundVolume * 0.22))
      gainNode.gain.setValueAtTime(volume, now)
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      osc.start(now)
      osc.stop(now + 0.18)
    }
  } catch (e) {
    // Graceful fallback if audio is not permitted or fails
  }
}

export const playGameStartSound = () => {
  try {
    const { soundEnabled, soundVolume = 0.7 } = useSettingsStore.getState()
    if (!soundEnabled) return

    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime

    // Triumphant ascending fanfare: C4 (261.63Hz) -> E4 (329.63Hz) -> G4 (392.00Hz) -> C5 (523.25Hz)
    const notes = [261.63, 329.63, 392.00, 523.25]
    const noteDuration = 0.11

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + idx * noteDuration)

      const volume = Math.min(1, Math.max(0, soundVolume * 0.28))
      const startTime = now + idx * noteDuration
      const endTime = startTime + (idx === notes.length - 1 ? 0.4 : noteDuration * 0.95)

      gain.gain.setValueAtTime(0.001, startTime)
      gain.gain.linearRampToValueAtTime(volume, startTime + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, endTime)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(startTime)
      osc.stop(endTime)
    })
  } catch (e) {
    // Graceful fallback
  }
}

