import { useState } from 'react'
import PrayerPlayer from './PrayerPlayer'
import { PRAYERS } from '../../lib/prayers'
import type { Prayer } from '../../lib/prayers'

export default function PrayerView() {
  const [activePrayer, setActivePrayer] = useState<Prayer | null>(null)

  // Starred prayers first
  const sorted = [...PRAYERS].sort((a, b) => {
    if (a.starred === b.starred) return 0
    return a.starred ? -1 : 1
  })

  if (activePrayer) {
    return <PrayerPlayer prayer={activePrayer} onBack={() => setActivePrayer(null)} />
  }

  return (
    <div className="space-y-6 py-2">
      <div className="text-center space-y-2">
        <h1 className="text-xl font-semibold text-stone-800">Devotions</h1>
        <p className="text-stone-400 text-sm">Be still and pray.</p>
      </div>

      <div className="space-y-3">
        {sorted.map(prayer => (
          <button
            key={prayer.id}
            onClick={() => setActivePrayer(prayer)}
            className="w-full text-left rounded-2xl border border-sage-200 bg-gradient-to-r from-sage-50 to-white p-5 hover:shadow-md hover:border-sage-300 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-sage-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-stone-800">{prayer.shortTitle}</p>
                  {prayer.starred && (
                    <svg className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  )}
                </div>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-2">{prayer.description}</p>
                {prayer.audioFile && (
                  <div className="flex items-center gap-1 mt-1.5">
                    <svg className="w-3 h-3 text-sage-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z" />
                    </svg>
                    <span className="text-xs text-sage-500 font-medium">Audio guided</span>
                  </div>
                )}
              </div>
              <svg className="w-5 h-5 text-stone-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
