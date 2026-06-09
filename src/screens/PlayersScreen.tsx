import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import type { Player } from '../types'

export function PlayersScreen() {
  const { state, dispatch } = useApp()
  const [search, setSearch] = useState('')

  const filtered = state.players.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const posLabel: Record<string, string> = { ST: 'Tiền đạo', MID: 'Tiền vệ', DEF: 'Hậu vệ', GK: 'Thủ môn' }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 space-y-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-2xl font-bold text-[var(--fg-1)]">Cầu thủ</h1>
          <Button
            variant="primary"
            size="sm"
            onClick={() => dispatch({ type: 'OPEN_EDITOR' })}
          >
            + Thêm
          </Button>
        </div>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Tìm cầu thủ…"
          className="w-full h-11 px-4 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-sm placeholder:text-[var(--fg-3)] focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 && (
          <div className="text-center text-[var(--fg-3)] text-sm py-12">Không tìm thấy cầu thủ</div>
        )}
        {filtered.map(p => (
          <button
            key={p.id}
            onClick={() => dispatch({ type: 'OPEN_EDITOR', player: p })}
            className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] active:bg-[var(--bg-sunken)] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-full bg-brand-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {p.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-[var(--fg-1)]">{p.name}</span>
                {p.isGoalkeeper && <Badge variant="gk" size="xs" />}
                {!p.isGoalkeeper && p.stars > 0 && <span className="text-[10px] leading-none">{('⭐').repeat(p.stars)}</span>}
              </div>
              <div className="text-xs text-[var(--fg-3)]">{posLabel[p.position] ?? p.position}</div>
            </div>
            <span className="text-[var(--fg-3)] text-lg">›</span>
          </button>
        ))}
      </div>
    </div>
  )
}
