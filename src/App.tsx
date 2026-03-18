import { useCallback, useEffect, useState } from 'react'
import { HashRouter, Routes, Route } from 'react-router'
import { useAuth } from './hooks/useAuth'
import { useItems } from './hooks/useItems'
import { useFocusBatch } from './hooks/useFocusBatch'
import { useHabitTemplates } from './hooks/useHabitTemplates'
import { usePomodoro } from './hooks/usePomodoro'
import { usePrayers } from './hooks/usePrayers'
import { useTimeAudit } from './hooks/useTimeAudit'
import PasswordGate from './components/auth/PasswordGate'
import AppShell from './components/layout/AppShell'
import DashboardView from './components/dashboard/DashboardView'
import InboxView from './components/inbox/InboxView'
import WaitingView from './components/waiting/WaitingView'
import GrindView from './components/grind/GrindView'
import PrayerView from './components/prayer/PrayerView'
import MissedDaysDialog from './components/grind/MissedDaysDialog'
import AddTaskForm from './components/inbox/AddTaskForm'
import PomodoroOverlay from './components/pomodoro/PomodoroOverlay'
import Modal from './components/ui/Modal'
import WaitingDatePrompt from './components/waiting/WaitingDatePrompt'

export default function App() {
  const { authenticated, login, logout, error } = useAuth()
  const { tasks, loading: tasksLoading, addTask, updateTask, completeTask, uncompleteTask, deleteTask, completeStep, completeSpecificStep, starTask, unstarTask, convertToWaiting, reactivateTask } = useItems()
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
    uncompleteGrind,
    reconcileMissedDay,
    addGrind,
    deleteGrind,
    updateGrind,
    retireGrind,
    reactivateGrind,
  } = useHabitTemplates()
  const {
    batchTasks,
    completedInBatch,
    allCompleted,
    generateNewBatch,
    refreshBatch,
    loading: batchLoading,
  } = useFocusBatch(tasks)
  const {
    pomodoros,
    timerActive,
    timerTaskTitle,
    timerDuration,
    timerColorVariant,
    remainingSeconds,
    startTimer,
    cancelTimer,
  } = usePomodoro()

  const { prayerCount, recordPrayer } = usePrayers()
  const {
    audits: completedAudits,
    activeAudit,
    currentBlock,
    remainingSeconds: auditRemainingSeconds,
    startAudit,
    recordEntry,
    completeAudit,
    cancelAudit,
  } = useTimeAudit(recordPrayer)

  const completedHydras = tasks.filter(t => t.completed && t.steps && t.steps.length > 1)

  const [addModalOpen, setAddModalOpen] = useState(false)
  const [waitingPromptTaskId, setWaitingPromptTaskId] = useState<string | null>(null)
  const waitingPromptTask = waitingPromptTaskId ? tasks.find(t => t.id === waitingPromptTaskId) : null

  const handleAddClick = useCallback(() => setAddModalOpen(true), [])
  const handleAddClose = useCallback(() => setAddModalOpen(false), [])

  const handleEdit = useCallback(async (id: string, updates: Partial<typeof tasks[0]>) => {
    await updateTask(id, updates)
    // Refresh the focus batch — completed tasks stay, incomplete re-rank
    refreshBatch()
  }, [updateTask, refreshBatch])

  const handleConvertToWaiting = useCallback((id: string) => {
    setWaitingPromptTaskId(id)
  }, [])

  const handleWaitingConfirm = useCallback(async (date: string) => {
    if (waitingPromptTaskId) {
      await convertToWaiting(waitingPromptTaskId, date)
      setWaitingPromptTaskId(null)
      refreshBatch()
    }
  }, [waitingPromptTaskId, convertToWaiting, refreshBatch])

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
  const today = new Date().toLocaleDateString('en-CA')
  const overdueWaitingCount = tasks.filter(t => t.waiting && t.waiting_reminder_date && t.waiting_reminder_date <= today).length

  const dashboardEl = (
    <DashboardView
      batchTasks={batchTasks}
      completedInBatch={completedInBatch}
      allCompleted={allCompleted}
      onComplete={completeTask}
      onUncomplete={uncompleteTask}
      onCompleteStep={completeStep}
      onConvertToWaiting={handleConvertToWaiting}
      onEdit={handleEdit}
      onNextBatch={generateNewBatch}
      loading={tasksLoading || batchLoading || grindsLoading}
      totalIncomplete={totalIncomplete}
      activeGrinds={activeGrinds}
      enabledGrindCount={enabledGrindCount}
      completedGrindCount={completedGrindCount}
      onCompleteGrind={completeGrind}
      healthMap={healthMap}
      onStartPomodoro={startTimer}
      pomodoroActive={timerActive}
      onCompleteSpecificStep={completeSpecificStep}
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
      onConvertToWaiting={handleConvertToWaiting}
      onAddClick={handleAddClick}
      onCompleteSpecificStep={completeSpecificStep}
    />
  )

  const waitingEl = (
    <WaitingView
      tasks={tasks}
      onReactivate={reactivateTask}
      onComplete={completeWaitingTask}
      onDelete={deleteTask}
      onEdit={handleEdit}
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
      onUncomplete={uncompleteGrind}
      pomodoros={pomodoros}
      prayerCount={prayerCount}
      completedHydras={completedHydras}
      completedAudits={completedAudits}
    />
  )

  return (
    <HashRouter>
      <Routes>
        <Route element={<AppShell onLogout={logout} onAddClick={handleAddClick} taskCount={totalIncomplete} waitingCount={waitingCount} overdueWaitingCount={overdueWaitingCount} />}>
          <Route index element={dashboardEl} />
          <Route path="inbox" element={inboxEl} />
          <Route path="waiting" element={waitingEl} />
          <Route path="grind" element={grindEl} />
          <Route path="pray" element={
            <PrayerView
              onPrayerComplete={recordPrayer}
              activeAudit={activeAudit}
              currentBlock={currentBlock}
              remainingSeconds={auditRemainingSeconds}
              onStartAudit={startAudit}
              onRecordEntry={recordEntry}
              onCompleteAudit={completeAudit}
              onCancelAudit={cancelAudit}
            />
          } />
        </Route>
      </Routes>

      {timerActive && (
        <PomodoroOverlay
          taskTitle={timerTaskTitle}
          remainingSeconds={remainingSeconds}
          durationMinutes={timerDuration}
          colorVariant={timerColorVariant}
          onCancel={cancelTimer}
        />
      )}

      <Modal open={addModalOpen} onClose={handleAddClose} title="Brain Dump">
        <AddTaskForm onAdd={addTask} onClose={handleAddClose} taskCount={tasks.length} />
      </Modal>

      {waitingPromptTask && (
        <WaitingDatePrompt
          taskTitle={waitingPromptTask.title}
          onConfirm={handleWaitingConfirm}
          onCancel={() => setWaitingPromptTaskId(null)}
        />
      )}

      {missedDays.length > 0 && (
        <MissedDaysDialog missedDays={missedDays} onReconcile={reconcileMissedDay} />
      )}
    </HashRouter>
  )
}
