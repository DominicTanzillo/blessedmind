import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import Header from './Header'
import MobileNav from './MobileNav'
import StickyNoteMargin from '../stickynotes/StickyNoteMargin'
import { useStickyNotes, type NoteGroup } from '../../hooks/useStickyNotes'

interface Props {
  onLogout: () => void
  onAddClick: () => void
  taskCount: number
  waitingCount: number
  overdueWaitingCount?: number
}

export default function AppShell({ onLogout, onAddClick, taskCount, waitingCount, overdueWaitingCount = 0 }: Props) {
  const { pathname } = useLocation()
  const { activeNote1, activeNote2, showOnFocus, toggleShowOnFocus, toggleItem } = useStickyNotes()
  const onFocus = pathname === '/'

  // Keep a reference to recently-completed notes so the drift animation
  // has time to play before unmounting. When activeNote becomes null
  // (all items checked), we hold the last value for 2s.
  const [shownNote1, setShownNote1] = useState<NoteGroup | null>(activeNote1)
  const [shownNote2, setShownNote2] = useState<NoteGroup | null>(activeNote2)

  useEffect(() => {
    if (activeNote1) { setShownNote1(activeNote1) }
    else if (shownNote1) {
      const t = setTimeout(() => setShownNote1(null), 2000)
      return () => clearTimeout(t)
    }
  }, [activeNote1]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (activeNote2) { setShownNote2(activeNote2) }
    else if (shownNote2) {
      const t = setTimeout(() => setShownNote2(null), 2000)
      return () => clearTimeout(t)
    }
  }, [activeNote2]) // eslint-disable-line react-hooks/exhaustive-deps

  const showMargins = onFocus && showOnFocus && (shownNote1 !== null || shownNote2 !== null)

  return (
    <div className="min-h-screen bg-sage-50" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
      <Header onLogout={onLogout} taskCount={taskCount} waitingCount={waitingCount} overdueWaitingCount={overdueWaitingCount} />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20 sm:pb-6 overflow-visible relative">
        <Outlet context={{ showOnFocus, toggleShowOnFocus }} />

        {/* Sticky notes in margins — absolute inside relative main, scrolls with content */}
        {showMargins && shownNote1 && (
          <div className="hidden xl:block absolute" style={{ top: '12rem', right: 'calc(100% + 1.5rem)' }}>
            <StickyNoteMargin items={shownNote1.items} noteId={shownNote1.id} side="left" onToggle={toggleItem} />
          </div>
        )}
        {showMargins && shownNote2 && (
          <div className="hidden xl:block absolute" style={{ top: '12rem', left: 'calc(100% + 1.5rem)' }}>
            <StickyNoteMargin items={shownNote2.items} noteId={shownNote2.id} side="right" onToggle={toggleItem} />
          </div>
        )}
      </main>
      <MobileNav onAddClick={onAddClick} overdueWaitingCount={overdueWaitingCount} />
    </div>
  )
}
