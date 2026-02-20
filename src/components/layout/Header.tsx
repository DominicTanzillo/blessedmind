import { Link, useLocation } from 'react-router'
import BreathingDot from '../ui/BreathingDot'

interface Props {
  onLogout: () => void
  taskCount: number
  waitingCount: number
}

export default function Header({ onLogout, taskCount, waitingCount }: Props) {
  const { pathname } = useLocation()

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
          <Link to="/grind" className={linkClass('/grind')}>Garden</Link>
          <Link to="/inbox" className={linkClass('/inbox')}>
            Mind
            {pathname === '/inbox' && taskCount > 0 && (
              <span className="ml-1.5 text-xs text-stone-400">{taskCount}</span>
            )}
          </Link>
          <Link to="/waiting" className={linkClass('/waiting')}>
            Waiting
            {waitingCount > 0 && (
              <span className="ml-1.5 text-xs text-stone-400">{waitingCount}</span>
            )}
          </Link>
        </nav>

        <button
          onClick={onLogout}
          className="text-xs text-stone-300 hover:text-stone-500 transition"
        >
          Lock
        </button>
      </div>
    </header>
  )
}
