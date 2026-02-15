import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router'
import BreathingDot from '../ui/BreathingDot'

function useShowInstall() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent)
    const isStandalone = ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
      || window.matchMedia('(display-mode: standalone)').matches
    setShow(isIOS && !isStandalone)
  }, [])
  return show
}

interface Props {
  onLogout: () => void
  taskCount: number
}

export default function Header({ onLogout, taskCount }: Props) {
  const { pathname } = useLocation()
  const showInstall = useShowInstall()

  const linkClass = (path: string) =>
    `px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
      pathname === path
        ? 'bg-sage-200 text-sage-800'
        : 'text-stone-400 hover:text-stone-700 hover:bg-stone-100'
    }`

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-stone-100">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <BreathingDot />
          <span className="font-semibold text-stone-800 group-hover:text-sage-600 transition">
            BlessedMind
          </span>
        </Link>

        <nav className="hidden sm:flex items-center gap-1">
          <Link to="/" className={linkClass('/')}>Focus</Link>
          <Link to="/inbox" className={linkClass('/inbox')}>
            Mind
            {pathname === '/inbox' && taskCount > 0 && (
              <span className="ml-1.5 text-xs text-stone-400">{taskCount}</span>
            )}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          {showInstall && pathname === '/inbox' && (
            <span className="text-xs text-sage-400">
              Share → Add to Home Screen
            </span>
          )}
          <button
            onClick={onLogout}
            className="text-xs text-stone-300 hover:text-stone-500 transition"
          >
            Lock
          </button>
        </div>
      </div>
    </header>
  )
}
