import React from 'react'
import type { Player, Team } from '../types'
import { Badge } from './ui/Badge'

interface Props {
  team: Team
  players: Player[]
  colorClass: string
  labelColor: string
}

const LABEL_COLORS = {
  A: 'text-brand-500',
  B: 'text-amber-400',
  C: 'text-purple-400',
}

const BORDER_COLORS = {
  A: 'border-l-brand-500',
  B: 'border-l-amber-500',
  C: 'border-l-purple-500',
}

export function TeamCard({ team, players }: { team: Team; players: Player[] }) {
  const teamPlayers = team.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]
  const noGk = team.counts.gk === 0
  const labelColor = LABEL_COLORS[team.label]
  const borderColor = BORDER_COLORS[team.label]

  return (
    <div className={`bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] border-l-4 ${borderColor} overflow-hidden`}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-[var(--border-subtle)]">
        <span className={`font-display text-2xl font-bold ${labelColor}`}>Đội {team.label}</span>
        <div className="flex items-center gap-1.5 ml-auto">
          <span className="text-xs text-[var(--fg-3)] font-medium">{team.counts.total} người</span>
          <span className="text-xs text-[var(--fg-3)]">·</span>
          <span className="text-xs">🧤{team.counts.gk}</span>
          <span className="text-xs">⭐{team.counts.key}</span>
        </div>
        {noGk && <Badge variant="warning" size="xs" />}
      </div>
      {/* Players */}
      <div className="px-4 py-2 space-y-0">
        {teamPlayers.map(p => (
          <div key={p.id} className="flex items-center gap-2 py-2 border-b border-[var(--border-subtle)] last:border-0">
            <div className="w-1.5 h-1.5 rounded-full bg-[var(--fg-3)]" />
            <span className="text-sm font-medium flex-1 text-[var(--fg-1)]">{p.name}</span>
            <div className="flex gap-1">
              {p.isGoalkeeper && <Badge variant="gk" size="xs" />}
              {p.isKey && !p.isGoalkeeper && <Badge variant="key" size="xs" />}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
