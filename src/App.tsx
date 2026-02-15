import { useState, useCallback, useEffect } from 'react'
import { HashRouter, Routes, Route } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { useTasks } from './hooks/useTasks'
import { useActiveBatch } from './hooks/useActiveBatch'
import PasswordGate from './components/auth/PasswordGate'
import AppShell from './components/layout/AppShell'
import DashboardView from './components/dashboard/DashboardView'
import InboxView from './components/inbox/InboxView'
import AddTaskForm from './components/inbox/AddTaskForm'
import Modal from './components/ui/Modal'

export default function App() {
  const { authenticated, login, logout, error } = useAuth()
  const { tasks, loading: tasksLoading, addTask, updateTask, completeTask, uncompleteTask, deleteTask, completeStep, starTask, unstarTask } = useTasks()
  const {
    batchTasks,
    completedInBatch,
    allCompleted,
    generateNewBatch,
    loading: batchLoading,
  } = useActiveBatch(tasks)

  const [addModalOpen, setAddModalOpen] = useState(false)

  const handleAddClick = useCallback(() => setAddModalOpen(true), [])
  const handleAddClose = useCallback(() => setAddModalOpen(false), [])

  const handleEdit = useCallback((id: string, updates: Partial<typeof tasks[0]>) => {
    updateTask(id, updates)
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

  const totalIncomplete = tasks.filter(t => !t.completed).length

  const dashboardEl = (
    <DashboardView
      batchTasks={batchTasks}
      completedInBatch={completedInBatch}
      allCompleted={allCompleted}
      onComplete={completeTask}
      onUncomplete={uncompleteTask}
      onCompleteStep={completeStep}
      onNextBatch={generateNewBatch}
      loading={tasksLoading || batchLoading}
      totalIncomplete={totalIncomplete}
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
      onAddClick={handleAddClick}
    />
  )

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell onLogout={logout} onAddClick={handleAddClick} taskCount={totalIncomplete} />}>
          <Route index element={dashboardEl} />
          <Route path="inbox" element={inboxEl} />
        </Route>
      </Routes>

      <Modal open={addModalOpen} onClose={handleAddClose} title="Brain Dump">
        <AddTaskForm onAdd={addTask} onClose={handleAddClose} taskCount={tasks.length} />
      </Modal>
    </HashRouter>
  )
}
