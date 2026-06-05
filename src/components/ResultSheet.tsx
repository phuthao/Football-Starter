import React from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import { TeamCard } from './TeamCard'
import type { Player, Team } from '../types'

interface Props {
  open: boolean
  teams: Team[]
  players: Player[]
  onClose: () => void
  onReshuffle: () => void
  onFormation: () => void
  onExport: () => void
}

export function ResultSheet({ open, teams, players, onClose, onReshuffle, onFormation, onExport }: Props) {
  const allBalanced = teams.every(t => t.counts.gk > 0)

  return (
    <Sheet open={open} onClose={onClose} fullHeight>
      {/* Status bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-surface)] z-10">
        <div className="flex-1">
          <div className="text-base font-bold text-[var(--fg-1)]">✅ Đã chia đội</div>
          {allBalanced && <div className="text-xs text-[var(--fg-3)]">cân bằng ✓</div>}
        </div>
        <button onClick={onClose} className="w-8 h-8 rounded-full bg-[var(--bg-sunken)] flex items-center justify-center text-[var(--fg-3)] hover:text-[var(--fg-1)] transition-colors">✕</button>
      </div>

      {/* Teams */}
      <div className="p-4 space-y-3 pb-2">
        {teams.map(team => (
          <TeamCard key={team.label} team={team} players={players} />
        ))}
      </div>

      {/* Actions */}
      <div className="p-4 pt-2 space-y-2 sticky bottom-0 bg-[var(--bg-surface)] border-t border-[var(--border-subtle)]">
        <div className="flex gap-2">
          <Button variant="ghost" size="md" onClick={onFormation} className="flex-1">⚽ Sơ đồ sân</Button>
          <Button variant="primary" size="md" onClick={onExport} className="flex-1">📤 Xuất ảnh</Button>
        </div>
        <Button variant="ghost" size="sm" block onClick={onReshuffle}>↻ Chia lại</Button>
      </div>
    </Sheet>
  )
}
