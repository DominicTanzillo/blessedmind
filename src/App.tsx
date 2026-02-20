import { useState, useCallback, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useActiveBatch } from './hooks/useActiveBatch'
import { useGrinds } from './hooks/useGrinds'
import PasswordGate from './components/auth/PasswordGate'
import AppShell from './components/layout/AppShell'
import DashboardView from './components/dashboard/DashboardView'
import InboxView from './components/inbox/InboxView'
import WaitingView from './components/waiting/WaitingView'
import GrindView from './components/grind/GrindView'
import MissedDaysDialog from './components/grind/MissedDaysDialog'
import AddTaskForm from './components/inbox/AddTaskForm'
import Modal from './components/ui/Modal'

export default function App() {
  const { authenticated, login, logout, error } = useAuth()
  const { tasks, loading: tasksLoading, addTask, updateTask, completeTask, uncompleteTask, deleteTask, completeStep, starTask, unstarTask, convertToWaiting, reactivateTask } = useTasks()
  const {
    grinds,
    retiredGrinds,
    activeGrinds,
    enabledGrindCount,
    completedGrindCount,
    missedDays,
    healthMap,
    loading: grindsLoading,
    completeGrind,
    reconcileMissedDay,
    addGrind,
    deleteGrind,
    updateGrind,
    retireGrind,
    reactivateGrind,
  } = useGrinds()
  const {
    batchTasks,
    completedInBatch,
    allCompleted,
    generateNewBatch,
    loading: batchLoading,
  } = useActiveBatch(tasks, enabledGrindCount)

  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleAddClick = useCallback(() => setAddModalOpen(true), [])
  const handleAddClose = useCallback(() => setAddModalOpen(false), [])

  const handleEdit = useCallback((id: string, updates: Partial<typeof tasks[0]>) => {
    updateTask(id, updates)
  }, [updateTask])

  const completeWaitingTask = useCallback(async (id: string) => {
    await updateTask(id, { waiting: false, completed: true, completed_at: new Date().toISOString() })
  }, [updateTask])

  useEffect(() => {
    if (authenticated && 'serviceWorker' in navigator) {
      import('virtual:pwa-register').then(({ registerSW }) => {
        registerSW({ immediate: true })
      })
    }
  }, [authenticated])

  if (!authenticated) {
    return <PasswordGate onLogin={login} error={error} />
  }

  const totalIncomplete = tasks.filter(t => !t.completed && !t.waiting).length
  const waitingCount = tasks.filter(t => t.waiting).length

  const dashboardEl = (
    <DashboardView
      batchTasks={batchTasks}
      completedInBatch={completedInBatch}
      allCompleted={allCompleted}
      onComplete={completeTask}
      onUncomplete={uncompleteTask}
      onCompleteStep={completeStep}
      onConvertToWaiting={convertToWaiting}
      onNextBatch={generateNewBatch}
      loading={tasksLoading || batchLoading || grindsLoading}
      totalIncomplete={totalIncomplete}
      activeGrinds={activeGrinds}
      enabledGrindCount={enabledGrindCount}
      completedGrindCount={completedGrindCount}
      onCompleteGrind={completeGrind}
      healthMap={healthMap}
    />
  )

  const inboxEl = (
    <InboxView
      tasks={tasks}
      onComplete={completeTask}
      onUncomplete={uncompleteTask}
      onDelete={deleteTask}
      onEdit={handleEdit}
      onStar={starTask}
      onUnstar={unstarTask}
      onConvertToWaiting={convertToWaiting}
      onAddClick={handleAddClick}
    />
  )

  const waitingEl = (
    <WaitingView
      tasks={tasks}
      onReactivate={reactivateTask}
      onComplete={completeWaitingTask}
      onDelete={deleteTask}
    />
  )

  const grindEl = (
    <GrindView
      grinds={grinds}
      retiredGrinds={retiredGrinds}
      healthMap={healthMap}
      onAdd={addGrind}
      onDelete={deleteGrind}
      onUpdate={updateGrind}
      onRetire={retireGrind}
      onReactivate={reactivateGrind}
    />
  )

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell onLogout={logout} onAddClick={handleAddClick} taskCount={totalIncomplete} waitingCount={waitingCount} />}>
          <Route index element={dashboardEl} />
          <Route path="inbox" element={inboxEl} />
          <Route path="waiting" element={waitingEl} />
          <Route path="grind" element={grindEl} />
        </Route>
      </Routes>

      <Modal open={addModalOpen} onClose={handleAddClose} title="Brain Dump">
        <AddTaskForm onAdd={addTask} onClose={handleAddClose} taskCount={tasks.length} />
      </Modal>

      {missedDays.length > 0 && (
        <MissedDaysDialog missedDays={missedDays} onReconcile={reconcileMissedDay} />
      )}
    </HashRouter>
  )
}
