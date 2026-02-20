/**
 * Web Audio API sound system for dopaminergic reinforcement.
 *
 * Uses short synthesized tones – no audio files needed.
 * Each sound is designed to create a distinct auditory association
 * (operant conditioning) while staying calm and non-jarring.
 */

let ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

// ── Helpers ────────────────────────────────────────────────

function tone(
  freq: number,
  type: OscillatorType,
  duration: number,
  startTime: number,
  gain: number,
  destination: AudioNode,
) {
  const c = getCtx()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.setValueAtTime(freq, startTime)
  g.gain.setValueAtTime(0, startTime)
  // Fast attack, smooth release – avoids clicks
  g.gain.linearRampToValueAtTime(gain, startTime + 0.012)
  g.gain.exponentialRampToValueAtTime(0.001, startTime + duration)
  osc.connect(g).connect(destination)
  osc.start(startTime)
  osc.stop(startTime + duration)
}

// ── Public API ─────────────────────────────────────────────

/**
 * Task complete – crisp, satisfying two-tone "click-ding".
 * Short (200ms), unmistakable, like a clicker + pleasant ding.
 */
export function playComplete() {
  try {
    const c = getCtx()
    const t = c.currentTime
    // Click transient (white-noise burst 15ms)
    const bufLen = Math.floor(c.sampleRate * 0.015)
    const buf = c.createBuffer(1, bufLen, c.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
    const click = c.createBufferSource()
    click.buffer = buf
    const clickGain = c.createGain()
    clickGain.gain.setValueAtTime(0.12, t)
    // Bandpass to keep it crisp, not harsh
    const bp = c.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3500
    bp.Q.value = 2
    click.connect(bp).connect(clickGain).connect(c.destination)
    click.start(t)

    // Pleasant ding – two harmonics
    tone(880, 'sine', 0.18, t + 0.02, 0.15, c.destination)
    tone(1320, 'sine', 0.14, t + 0.02, 0.06, c.destination) // fifth harmonic for warmth

    haptic(40)
  } catch { /* silent fallback */ }
}

/**
 * Step complete – softer, shorter pop. Lighter reward.
 */
export function playStepComplete() {
  try {
    const c = getCtx()
    const t = c.currentTime
    // Soft pop – sine with quick pitch drop
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(660, t)
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.08)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.12, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.connect(g).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.12)

    haptic(20)
  } catch { /* silent fallback */ }
}

/**
 * Blessed Day – all 3 complete. Ascending major triad chord.
 * The "jackpot" sound. Warmer, longer, deeply satisfying.
 */
export function playBlessedDay() {
  try {
    const c = getCtx()
    const t = c.currentTime

    // C5 – E5 – G5 ascending stagger, each held ~0.5s
    const notes = [523.25, 659.25, 783.99] // C5, E5, G5
    notes.forEach((freq, i) => {
      const start = t + i * 0.12
      tone(freq, 'sine', 0.6, start, 0.10, c.destination)
      // Soft overtone for richness
      tone(freq * 2, 'sine', 0.4, start, 0.025, c.destination)
    })

    // Gentle shimmer on top
    tone(1046.5, 'triangle', 0.8, t + 0.36, 0.03, c.destination)

    haptic(80)
  } catch { /* silent fallback */ }
}

/**
 * Brain dump capture – soft descending "drop" tone.
 * Like dropping a thought into a safe container.
 */
export function playCapture() {
  try {
    const c = getCtx()
    const t = c.currentTime
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(520, t)
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.15)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.10, t + 0.01)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18)
    osc.connect(g).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.18)

    haptic(15)
  } catch { /* silent fallback */ }
}

/**
 * New batch / refresh – bright ascending "whoosh" sweep.
 * Signals fresh start, new possibilities.
 */
export function playRefresh() {
  try {
    const c = getCtx()
    const t = c.currentTime
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(300, t)
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.25)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.08, t + 0.03)
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.3)
    osc.connect(g).connect(c.destination)
    osc.start(t)
    osc.stop(t + 0.3)

    haptic(30)
  } catch { /* silent fallback */ }
}

/**
 * Login welcome – gentle, centering two-note chime.
 * A soft G4 → C5 perfect fourth, warm and brief (~400ms).
 * Feels like a door opening to a calm space.
 */
export function playWelcome() {
  try {
    const c = getCtx()
    const t = c.currentTime

    // Warm pad underneath – very quiet
    tone(261.63, 'sine', 0.6, t, 0.04, c.destination) // C4 pad

    // G4 → C5 perfect fourth, staggered
    tone(392.0, 'sine', 0.35, t + 0.05, 0.09, c.destination)    // G4
    tone(392.0, 'triangle', 0.25, t + 0.05, 0.03, c.destination) // G4 shimmer
    tone(523.25, 'sine', 0.4, t + 0.2, 0.08, c.destination)     // C5
    tone(523.25, 'triangle', 0.3, t + 0.2, 0.025, c.destination) // C5 shimmer

    haptic(30)
  } catch { /* silent fallback */ }
}

/**
 * Grind complete – warm sine tones that layer richer harmonics
 * at milestone streaks (3d, 7d, 14d, 30d).
 */
export function playGrindComplete(streak: number) {
  try {
    const c = getCtx()
    const t = c.currentTime

    // Base: warm ascending fifth (A4 → E5)
    tone(440, 'sine', 0.25, t, 0.10, c.destination)
    tone(659.25, 'sine', 0.3, t + 0.08, 0.08, c.destination)

    // Layer richer harmonics at milestones
    if (streak >= 3) {
      tone(880, 'triangle', 0.2, t + 0.12, 0.04, c.destination)
    }
    if (streak >= 7) {
      tone(1318.5, 'sine', 0.25, t + 0.16, 0.03, c.destination)
    }
    if (streak >= 14) {
      tone(523.25, 'sine', 0.4, t + 0.04, 0.05, c.destination)
      tone(783.99, 'triangle', 0.3, t + 0.2, 0.03, c.destination)
    }
    if (streak >= 30) {
      // Full major triad shimmer
      tone(1046.5, 'triangle', 0.5, t + 0.24, 0.025, c.destination)
      tone(1318.5, 'sine', 0.4, t + 0.28, 0.02, c.destination)
    }

    haptic(streak >= 14 ? 60 : streak >= 7 ? 40 : 25)
  } catch { /* silent fallback */ }
}

// ── Haptic (mobile) ────────────────────────────────────────

export function haptic(ms: number) {
  try {
    navigator?.vibrate?.(ms)
  } catch { /* not supported */ }
}
