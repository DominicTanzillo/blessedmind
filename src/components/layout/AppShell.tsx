import { Outlet, useLocation } from 'react-router'
import Header from './Header'
import MobileNav from './MobileNav'
import StickyNoteMargin from '../stickynotes/StickyNoteMargin'
import { useStickyNotes } from '../../hooks/useStickyNotes'

interface Props {
  onLogout: () => void
  onAddClick: () => void
  taskCount: number
  waitingCount: number
  overdueWaitingCount?: number
}

export default function AppShell({ onLogout, onAddClick, taskCount, waitingCount, overdueWaitingCount = 0 }: Props) {
  const { pathname } = useLocation()
  const { activeNote1, activeNote2, showOnFocus, toggleItem } = useStickyNotes()
  const onFocus = pathname === '/'
  const showMargins = onFocus && showOnFocus && (activeNote1 !== null || activeNote2 !== null)

  return (
    <div className="min-h-screen bg-sage-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <Header onLogout={onLogout} taskCount={taskCount} waitingCount={waitingCount} overdueWaitingCount={overdueWaitingCount} />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20 sm:pb-6 overflow-visible">
        <Outlet />
      </main>
      <MobileNav onAddClick={onAddClick} overdueWaitingCount={overdueWaitingCount} />

      {/* Sticky notes in margins — desktop only, Focus page only */}
      {showMargins && activeNote1 && (
        <div className="hidden xl:block fixed top-24" style={{ left: 'max(1rem, calc(50% - 24rem - 13rem))' }}>
          <StickyNoteMargin items={activeNote1.items} side="left" onToggle={toggleItem} colorIndex={0} />
        </div>
      )}
      {showMargins && activeNote2 && (
        <div className="hidden xl:block fixed top-24" style={{ right: 'max(1rem, calc(50% - 24rem - 13rem))' }}>
          <StickyNoteMargin items={activeNote2.items} side="right" onToggle={toggleItem} colorIndex={1} />
        </div>
      )}
    </div>
  )
}
