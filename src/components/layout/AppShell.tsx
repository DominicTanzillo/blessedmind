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
  const { todayItems, showOnFocus, toggleItem } = useStickyNotes()
  const onFocus = pathname === '/'
  const incompleteToday = todayItems.filter(i => !i.completed)

  // Split incomplete items between left and right margins
  const showMargins = onFocus && showOnFocus && incompleteToday.length > 0
  const mid = Math.ceil(incompleteToday.length / 2)
  const leftItems = incompleteToday.slice(0, mid)
  const rightItems = incompleteToday.slice(mid)

  return (
    <div className="min-h-screen bg-sage-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <Header onLogout={onLogout} taskCount={taskCount} waitingCount={waitingCount} overdueWaitingCount={overdueWaitingCount} />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20 sm:pb-6 overflow-visible">
        <Outlet />
      </main>
      <MobileNav onAddClick={onAddClick} overdueWaitingCount={overdueWaitingCount} />

      {/* Sticky notes in margins — desktop only, Focus page only */}
      {showMargins && leftItems.length > 0 && (
        <div className="hidden xl:block fixed top-24" style={{ left: 'max(1rem, calc(50% - 24rem - 13rem))' }}>
          <StickyNoteMargin items={leftItems} side="left" onToggle={toggleItem} colorIndex={0} />
        </div>
      )}
      {showMargins && rightItems.length > 0 && (
        <div className="hidden xl:block fixed top-24" style={{ right: 'max(1rem, calc(50% - 24rem - 13rem))' }}>
          <StickyNoteMargin items={rightItems} side="right" onToggle={toggleItem} colorIndex={1} />
        </div>
      )}
    </div>
  )
}
