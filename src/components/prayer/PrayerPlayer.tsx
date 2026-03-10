import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import type { Prayer } from '../../lib/prayers'

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2]
const TIMESTAMPS_KEY = 'prayer-timestamps'

function loadTimestamps(prayerId: string): (number | null)[] {
  try {
    const stored = localStorage.getItem(TIMESTAMPS_KEY)
    if (stored) {
      const all = JSON.parse(stored)
      return all[prayerId] ?? []
    }
  } catch { /* ignore */ }
  return []
}

function saveTimestamps(prayerId: string, timestamps: (number | null)[]) {
  try {
    const stored = localStorage.getItem(TIMESTAMPS_KEY)
    const all = stored ? JSON.parse(stored) : {}
    all[prayerId] = timestamps
    localStorage.setItem(TIMESTAMPS_KEY, JSON.stringify(all))
  } catch { /* ignore */ }
}

interface Props {
  prayer: Prayer
  onBack: () => void
}

export default function PrayerPlayer({ prayer, onBack }: Props) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [activeSection, setActiveSection] = useState(0)
  const [calibrating, setCalibrating] = useState(false)
  const [calibrateIndex, setCalibrateIndex] = useState(0)
  const [timestamps, setTimestamps] = useState<(number | null)[]>(() => loadTimestamps(prayer.id))

  // Merge hardcoded timestamps with localStorage overrides
  const effectiveTimestamps = useMemo(() => {
    return prayer.sections.map((s, i) => timestamps[i] ?? s.audioTimestamp ?? null)
  }, [prayer.sections, timestamps])

  const hasTimestamps = effectiveTimestamps.some(t => t !== null)

  // Auto-sync active section with audio time
  useEffect(() => {
    if (!playing || calibrating || !hasTimestamps) return
    // Find the last section whose timestamp <= currentTime
    let matched = -1
    for (let i = 0; i < effectiveTimestamps.length; i++) {
      const ts = effectiveTimestamps[i]
      if (ts !== null && currentTime >= ts) matched = i
    }
    if (matched >= 0 && matched !== activeSection) {
      setActiveSection(matched)
    }
  }, [currentTime, playing, calibrating, hasTimestamps, effectiveTimestamps, activeSection])

  // Initialize audio
  useEffect(() => {
    if (!prayer.audioFile) return
    const audio = new Audio(`${import.meta.env.BASE_URL}${prayer.audioFile}`)
    audioRef.current = audio

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration)
      audio.currentTime = prayer.audioStartSeconds
      setCurrentTime(prayer.audioStartSeconds)
    })

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime)
    })

    audio.addEventListener('ended', () => {
      setPlaying(false)
    })

    return () => {
      audio.pause()
      audio.src = ''
    }
  }, [prayer.audioFile, prayer.audioStartSeconds])

  // Sync speed
  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = speed
  }, [speed])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (playing) {
      audio.pause()
    } else {
      audio.play()
    }
    setPlaying(!playing)
  }, [playing])

  const seek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const time = Number(e.target.value)
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const skipForward = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(audioRef.current.currentTime + 15, duration)
    }
  }, [duration])

  const skipBack = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(audioRef.current.currentTime - 15, 0)
    }
  }, [])

  const startCalibration = useCallback(() => {
    setCalibrating(true)
    setCalibrateIndex(0)
    setActiveSection(0)
  }, [])

  const markTimestamp = useCallback(() => {
    const time = audioRef.current?.currentTime ?? 0
    setTimestamps(prev => {
      const next = [...prev]
      while (next.length <= calibrateIndex) next.push(null)
      next[calibrateIndex] = Math.round(time)
      saveTimestamps(prayer.id, next)
      return next
    })
    if (calibrateIndex < prayer.sections.length - 1) {
      const nextIdx = calibrateIndex + 1
      setCalibrateIndex(nextIdx)
      setActiveSection(nextIdx)
    } else {
      setCalibrating(false)
    }
  }, [calibrateIndex, prayer.id, prayer.sections.length])

  const skipCalibrationSection = useCallback(() => {
    if (calibrateIndex < prayer.sections.length - 1) {
      const nextIdx = calibrateIndex + 1
      setCalibrateIndex(nextIdx)
      setActiveSection(nextIdx)
    } else {
      setCalibrating(false)
    }
  }, [calibrateIndex, prayer.sections.length])

  const clearTimestamps = useCallback(() => {
    setTimestamps([])
    saveTimestamps(prayer.id, [])
    setCalibrating(false)
  }, [prayer.id])

  function formatTime(s: number): string {
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  const sectionColors = {
    opening: 'border-sage-300 bg-sage-50',
    sorrow: 'border-amber-200 bg-amber-50/50',
    response: 'border-stone-200 bg-stone-50',
    closing: 'border-sage-300 bg-sage-50',
  }

  const sectionIcons = {
    opening: 'text-sage-500',
    sorrow: 'text-amber-600',
    response: 'text-stone-400',
    closing: 'text-sage-500',
  }

  return (
    <div className="space-y-5 py-2 pb-40">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 -ml-2 rounded-lg hover:bg-stone-100 transition text-stone-400 hover:text-stone-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-semibold text-stone-800">{prayer.shortTitle}</h1>
          <p className="text-xs text-stone-400">{prayer.sections.length} sections</p>
        </div>
        {prayer.audioFile && (
          <button
            onClick={calibrating ? () => setCalibrating(false) : startCalibration}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${
              calibrating
                ? 'bg-amber-100 text-amber-700'
                : hasTimestamps
                  ? 'text-stone-400 hover:bg-stone-100'
                  : 'bg-sage-100 text-sage-700 hover:bg-sage-200'
            }`}
          >
            {calibrating ? 'Cancel' : hasTimestamps ? 'Re-sync' : 'Sync to audio'}
          </button>
        )}
      </div>

      {/* Calibration banner */}
      {calibrating && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-2">
          <p className="text-sm text-amber-800 font-medium">
            Syncing: tap "Mark" when you hear this section start
          </p>
          <p className="text-xs text-amber-600">
            Section {calibrateIndex + 1} of {prayer.sections.length}: {prayer.sections[calibrateIndex].title}
          </p>
          <div className="flex gap-2">
            <button
              onClick={markTimestamp}
              className="px-4 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition"
            >
              Mark ({formatTime(currentTime)})
            </button>
            <button
              onClick={skipCalibrationSection}
              className="px-3 py-1.5 rounded-lg text-amber-600 text-sm hover:bg-amber-100 transition"
            >
              Skip
            </button>
            <button
              onClick={clearTimestamps}
              className="px-3 py-1.5 rounded-lg text-amber-400 text-sm hover:bg-amber-100 transition ml-auto"
            >
              Clear all
            </button>
          </div>
        </div>
      )}

      {/* Prayer text sections */}
      <div className="space-y-3">
        {prayer.sections.map((section, i) => {
          const ts = effectiveTimestamps[i]
          return (
            <button
              key={i}
              onClick={() => {
                if (calibrating) return
                if (ts !== null && audioRef.current) {
                  audioRef.current.currentTime = ts
                  setCurrentTime(ts)
                }
                setActiveSection(activeSection === i ? -1 : i)
              }}
              className={`w-full text-left rounded-xl border p-4 transition-all duration-300 ${
                sectionColors[section.type]
              } ${activeSection === i ? 'shadow-sm ring-2 ring-sage-300/50' : ''} ${
                calibrating && i === calibrateIndex ? 'ring-2 ring-amber-400' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 flex-shrink-0 ${sectionIcons[section.type]}`}>
                  {section.type === 'sorrow' ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-stone-700">{section.title}</p>
                    {ts !== null && !calibrating && (
                      <span className="text-[10px] text-stone-300 tabular-nums">{formatTime(ts)}</span>
                    )}
                  </div>
                  {activeSection === i && (
                    <p className="text-sm text-stone-600 mt-2 leading-relaxed whitespace-pre-line animate-fade-up">
                      {section.text}
                    </p>
                  )}
                </div>
                <svg
                  className={`w-4 h-4 text-stone-300 flex-shrink-0 transition-transform duration-200 ${
                    activeSection === i ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          )
        })}
      </div>

      {/* Fixed audio player */}
      {prayer.audioFile && (
        <div className="fixed bottom-14 sm:bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-3 z-40">
          <div className="max-w-2xl mx-auto space-y-2">
            {/* Progress bar */}
            <div className="flex items-center gap-2 text-xs text-stone-400">
              <span className="w-10 text-right tabular-nums">{formatTime(currentTime)}</span>
              <input
                type="range"
                min={0}
                max={duration || 1}
                value={currentTime}
                onChange={seek}
                className="flex-1 h-1 accent-sage-500 cursor-pointer"
              />
              <span className="w-10 tabular-nums">{formatTime(duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-6">
              {/* Speed */}
              <button
                onClick={() => {
                  const idx = SPEED_OPTIONS.indexOf(speed)
                  setSpeed(SPEED_OPTIONS[(idx + 1) % SPEED_OPTIONS.length])
                }}
                className="px-2 py-1 rounded-lg text-xs font-bold text-stone-500 hover:bg-stone-100 transition min-w-[3rem]"
              >
                {speed}x
              </button>

              {/* Skip back */}
              <button onClick={skipBack} className="p-2 text-stone-400 hover:text-stone-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={togglePlay}
                className="w-14 h-14 rounded-full bg-sage-500 text-white flex items-center justify-center hover:bg-sage-600 transition-all duration-200 hover:scale-105 shadow-md"
              >
                {playing ? (
                  <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg className="w-7 h-7 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Skip forward */}
              <button onClick={skipForward} className="p-2 text-stone-400 hover:text-stone-600 transition">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
                </svg>
              </button>

              {/* Spacer for symmetry */}
              <div className="min-w-[3rem]" />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
