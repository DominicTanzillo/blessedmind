import { Link, useLocation } from 'react-router'

interface Props {
  onAddClick: () => void
}

export default function MobileNav({ onAddClick }: Props) {
  const { pathname } = useLocation()

  const linkClass = (path: string) =>
    `flex flex-col items-center gap-0.5 text-xs font-medium transition-all duration-200 ${
      pathname === path ? 'text-sage-600' : 'text-stone-400'
    }`

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-stone-100 pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-14">
        <Link to="/" className={linkClass('/')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Focus
        </Link>

        <Link to="/grind" className={linkClass('/grind')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19V6m0 0c-2-3-6-3-6 0 0 4 6 4 6 0zm0 0c2-3 6-3 6 0 0 4-6 4-6 0z" />
          </svg>
          Grind
        </Link>

        <button onClick={onAddClick} className="flex flex-col items-center gap-0.5 text-xs font-medium text-sage-500">
          <div className="w-11 h-11 rounded-full bg-sage-500 text-white flex items-center justify-center text-2xl -mt-5 shadow-md hover:shadow-lg hover:bg-sage-600 transition-all duration-200 hover:scale-105">
            +
          </div>
          Capture
        </button>

        <Link to="/inbox" className={linkClass('/inbox')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-2.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          Mind
        </Link>

        <Link to="/waiting" className={linkClass('/waiting')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Waiting
        </Link>
      </div>
    </nav>
  )
}
