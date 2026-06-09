import React from 'react'
import type { Player } from '../types'

interface Props {
  players: Player[]
  presentIds: string[]
  teamCount: 2 | 3
  onTeamCountChange: (n: 2 | 3) => void
}

export function StatHeader({ players, presentIds, teamCount, onTeamCountChange }: Props) {
  const present = players.filter(p => presentIds.includes(p.id))
  const gk = present.filter(p => p.isGoalkeeper).length
  const key = present.filter(p => !p.isGoalkeeper && p.stars > 0).length

  return (
    <div className="bg-brand-500 rounded-xl p-4 flex items-center gap-3">
      <div>
        <div className="font-display text-5xl font-bold text-white leading-none">{present.length}</div>
        <div className="text-brand-100 text-xs mt-0.5">cầu thủ có mặt</div>
      </div>
      <div className="flex-1">
        <div className="text-white/80 text-xs leading-relaxed">
          🧤 {gk} thủ môn &nbsp;·&nbsp; ⭐ {key} chủ lực
        </div>
        <div className="text-white font-semibold text-sm mt-0.5">
          Gợi ý: {teamCount} đội
        </div>
      </div>
      {/* Team count toggle */}
      <div className="flex bg-white/10 rounded-lg p-0.5 gap-0.5">
        {([2, 3] as const).map(n => (
          <button
            key={n}
            onClick={() => onTeamCountChange(n)}
            className={`w-8 h-8 rounded-md text-sm font-bold transition-all ${
              teamCount === n ? 'bg-white text-brand-500 shadow-sm' : 'text-white/70'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}
