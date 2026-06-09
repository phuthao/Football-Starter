import React from 'react'
import { useApp } from './store/AppContext'
import { TodayScreen } from './screens/TodayScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { LoginScreen } from './screens/LoginScreen'
import { BottomNav } from './components/BottomNav'
import { ResultSheet } from './components/ResultSheet'
import { FormationSheet } from './components/FormationSheet'
import { ExportSheet } from './components/ExportSheet'
import { PlayerEditor } from './components/PlayerEditor'
import { BudgetEditor } from './components/BudgetEditor'
import { BudgetExportSheet } from './components/BudgetExportSheet'

export function App() {
  const { state, dispatch } = useApp()
  const {
    view, players, lastTeams,
    resultOpen, formationOpen, exportOpen,
    playerEditorOpen, editingPlayer,
    budgetEditorOpen, editingBudget,
    budgetExportOpen, exportingBudget,
    budget, history,
    isLoggedIn, isAdmin, authLoading,
  } = state

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-dvh bg-[var(--bg-page)]">
        <div className="text-4xl animate-pulse">⚽</div>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-dvh max-w-md mx-auto bg-[var(--bg-page)]">
        <LoginScreen />
      </div>
    )
  }

  const totalBalance = budget.reduce((sum, e) => {
    const inc = e.income.reduce((s, i) => s + i.amount, 0)
    const exp = e.expenses.reduce((s, ex) => s + ex.amount, 0)
    return sum + inc - exp
  }, 0)

  const handleBudgetSave = (entry: typeof editingBudget) => {
    if (!entry) return
    const exists = budget.find(b => b.id === entry.id)
    dispatch(exists ? { type: 'UPDATE_BUDGET', entry } : { type: 'ADD_BUDGET', entry })
  }

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-[var(--bg-page)] overflow-hidden select-none">
      <div className="flex-1 overflow-hidden">
        {view === 'today' && <TodayScreen />}
        {view === 'players' && <PlayersScreen />}
        {view === 'history' && <HistoryScreen />}
      </div>

      <BottomNav view={view} onChange={v => dispatch({ type: 'SET_VIEW', view: v })} />

      {lastTeams && (
        <ResultSheet
          open={resultOpen}
          teams={lastTeams}
          players={players}
          onClose={() => dispatch({ type: 'CLOSE_RESULT' })}
          onReshuffle={() => dispatch({ type: 'GENERATE' })}
          onFormation={() => dispatch({ type: 'OPEN_FORMATION' })}
          onExport={() => dispatch({ type: 'OPEN_EXPORT' })}
        />
      )}

      {lastTeams && (
        <FormationSheet
          open={formationOpen}
          teams={lastTeams}
          players={players}
          onClose={() => dispatch({ type: 'CLOSE_FORMATION' })}
          onExport={() => { dispatch({ type: 'CLOSE_FORMATION' }); dispatch({ type: 'OPEN_EXPORT' }) }}
        />
      )}

      {lastTeams && (
        <ExportSheet
          open={exportOpen}
          teams={lastTeams}
          players={players}
          onClose={() => dispatch({ type: 'CLOSE_EXPORT' })}
        />
      )}

      <PlayerEditor
        open={playerEditorOpen}
        player={editingPlayer}
        onSave={p => dispatch({ type: 'SAVE_PLAYER', player: p })}
        onClose={() => dispatch({ type: 'CLOSE_EDITOR' })}
        onDelete={id => { dispatch({ type: 'DELETE_PLAYER', id }); dispatch({ type: 'CLOSE_EDITOR' }) }}
      />

      {isAdmin && (
        <BudgetEditor
          open={budgetEditorOpen}
          entry={editingBudget}
          history={history}
          totalBalance={totalBalance}
          onSave={handleBudgetSave}
          onDelete={id => dispatch({ type: 'DELETE_BUDGET', id })}
          onClose={() => dispatch({ type: 'CLOSE_BUDGET_EDITOR' })}
        />
      )}

      {isAdmin && exportingBudget && (
        <BudgetExportSheet
          open={budgetExportOpen}
          entry={exportingBudget}
          totalBalance={totalBalance}
          onClose={() => dispatch({ type: 'CLOSE_BUDGET_EXPORT' })}
        />
      )}
    </div>
  )
}
