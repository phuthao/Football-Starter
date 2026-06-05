import React from 'react'
import { useApp } from './store/AppContext'
import { TodayScreen } from './screens/TodayScreen'
import { PlayersScreen } from './screens/PlayersScreen'
import { HistoryScreen } from './screens/HistoryScreen'
import { BottomNav } from './components/BottomNav'
import { ResultSheet } from './components/ResultSheet'
import { FormationSheet } from './components/FormationSheet'
import { ExportSheet } from './components/ExportSheet'
import { PlayerEditor } from './components/PlayerEditor'

export function App() {
  const { state, dispatch } = useApp()
  const { view, players, session, lastTeams, resultOpen, formationOpen, exportOpen, playerEditorOpen, editingPlayer } = state

  return (
    <div className="flex flex-col h-dvh max-w-md mx-auto bg-[var(--bg-page)] overflow-hidden select-none">
      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {view === 'today' && <TodayScreen />}
        {view === 'players' && <PlayersScreen />}
        {view === 'history' && <HistoryScreen />}
      </div>

      {/* Bottom nav */}
      <BottomNav view={view} onChange={v => dispatch({ type: 'SET_VIEW', view: v })} />

      {/* Sheets */}
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
    </div>
  )
}
