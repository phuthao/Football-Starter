import React from 'react'
import { useApp } from '../store/AppContext'
import { StatHeader } from '../components/StatHeader'
import { RosterGrid } from '../components/RosterGrid'
import { Button } from '../components/ui/Button'

export function TodayScreen() {
  const { state, dispatch } = useApp()
  const { players, session } = state
  const n = session.presentIds.length
  const canGenerate = n >= 4

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-safe-or-4 pt-4 pb-2 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-[var(--fg-1)]">⚽ Hôm nay</h1>
            <p className="text-xs text-[var(--fg-3)]">
              {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
        <StatHeader
          players={players}
          presentIds={session.presentIds}
          teamCount={session.teamCount}
          onTeamCountChange={count => dispatch({ type: 'SET_TEAM_COUNT', count })}
        />
      </div>

      {/* Roster */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        <RosterGrid
          players={players}
          presentIds={session.presentIds}
          onToggle={id => dispatch({ type: 'TOGGLE_PRESENT', id })}
          onResetAll={() => dispatch({ type: 'SET_ALL_PRESENT' })}
        />
      </div>

      {/* Generate CTA */}
      <div className="px-4 pb-safe-or-4 pb-4 pt-2 border-t border-[var(--border-subtle)] bg-[var(--bg-page)]">
        {!canGenerate && (
          <p className="text-center text-xs text-[var(--fg-3)] mb-2">Cần tối thiểu 4 cầu thủ</p>
        )}
        <Button
          variant="primary"
          size="lg"
          block
          disabled={!canGenerate}
          onClick={() => dispatch({ type: 'GENERATE' })}
          className="font-display text-xl tracking-wide"
        >
          🎲 Chia đội — {session.teamCount} đội
        </Button>
      </div>
    </div>
  )
}
