import { Outlet } from 'react-router'
import Header from './Header'
import MobileNav from './MobileNav'

interface Props {
  onLogout: () => void
  onAddClick: () => void
  taskCount: number
  waitingCount: number
  overdueWaitingCount?: number
}

export default function AppShell({ onLogout, onAddClick, taskCount, waitingCount, overdueWaitingCount = 0 }: Props) {
  return (
    <div className="min-h-screen bg-sage-50">
      <Header onLogout={onLogout} taskCount={taskCount} waitingCount={waitingCount} overdueWaitingCount={overdueWaitingCount} />
      <main className="max-w-2xl mx-auto px-4 py-6 pb-20 sm:pb-6">
        <Outlet />
      </main>
      <MobileNav onAddClick={onAddClick} overdueWaitingCount={overdueWaitingCount} />
    </div>
  )
}
