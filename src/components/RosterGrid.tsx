import React from 'react'
import type { Player } from '../types'
import { Badge } from './ui/Badge'

interface Props {
  players: Player[]
  presentIds: string[]
  onToggle: (id: string) => void
  onResetAll: () => void
}

export function RosterGrid({ players, presentIds, onToggle, onResetAll }: Props) {
  const absentCount = players.length - presentIds.length

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-[var(--fg-3)] font-medium">
          Đội hình — chạm để loại
        </span>
        {absentCount > 0 && (
          <button
            onClick={onResetAll}
            className="text-xs text-brand-500 font-semibold bg-brand-500/10 px-2.5 py-1 rounded-full border border-brand-500/20 active:scale-95 transition-all"
          >
            Đủ quân ↺
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {players.map(p => {
          const present = presentIds.includes(p.id)
          return (
            <button
              key={p.id}
              onClick={() => onToggle(p.id)}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all active:scale-95 min-h-[72px] justify-center ${
                present
                  ? 'bg-[var(--bg-overlay)] border-[var(--border-default)] text-[var(--fg-1)]'
                  : 'bg-[var(--bg-sunken)] border-[var(--border-subtle)] opacity-40'
              }`}
            >
              {/* Avatar */}
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                present ? 'bg-brand-500 text-white' : 'bg-[var(--border-default)] text-[var(--fg-3)]'
              }`}>
                {p.name.charAt(0)}
              </div>
              <div className="text-xs font-semibold leading-tight text-center">
                {present ? p.name : `${p.name} ✕`}
              </div>
              <div className="flex gap-1">
                {p.isGoalkeeper && <Badge variant="gk" size="xs" />}
                {!p.isGoalkeeper && p.stars > 0 && <span className="text-[10px] leading-none">{('⭐').repeat(p.stars)}</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
