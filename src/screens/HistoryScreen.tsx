import React, { useState } from 'react'
import { useApp } from '../store/AppContext'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import type { HistoryEntry } from '../types'

function formatDate(iso: string) {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    time: d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
  }
}

const TEAM_COLORS: Record<string, string> = {
  A: 'text-brand-500 border-brand-500',
  B: 'text-amber-400 border-amber-500',
  C: 'text-purple-400 border-purple-500',
}
const TEAM_BG: Record<string, string> = {
  A: 'bg-brand-500/10',
  B: 'bg-amber-500/10',
  C: 'bg-purple-500/10',
}

function HistoryCard({ entry, onDelete }: { entry: HistoryEntry; onDelete: () => void }) {
  const [open, setOpen] = useState(false)
  const [confirmDel, setConfirmDel] = useState(false)
  const { date, time } = formatDate(entry.savedAt)
  const total = entry.teams.reduce((s, t) => s + t.counts.total, 0)

  return (
    <div className="bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
      {/* Row header */}
      <button
        className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-[var(--bg-sunken)] transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-9 h-9 rounded-full bg-brand-500/15 flex items-center justify-center text-lg shrink-0">⚽</div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--fg-1)] truncate">{date}</div>
          <div className="text-xs text-[var(--fg-3)]">{time} · {total} cầu thủ · {entry.teams.length} đội</div>
        </div>
        <span className={`text-[var(--fg-3)] text-base transition-transform ${open ? 'rotate-90' : ''}`}>›</span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div className="border-t border-[var(--border-subtle)]">
          {entry.teams.map(team => {
            const colorCls = TEAM_COLORS[team.label] ?? 'text-[var(--fg-2)] border-[var(--border-default)]'
            const bgCls = TEAM_BG[team.label] ?? ''
            return (
              <div key={team.label} className="px-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-display text-lg font-bold ${colorCls.split(' ')[0]}`}>Đội {team.label}</span>
                  <span className="text-xs text-[var(--fg-3)]">{team.counts.total} người · 🧤{team.counts.gk} ⭐{team.counts.key}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {team.playerIds.map(id => {
                    const p = entry.playerSnapshot[id]
                    if (!p) return null
                    return (
                      <span
                        key={id}
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium border ${colorCls} ${bgCls}`}
                      >
                        {p.name}
                        {p.isGoalkeeper && <Badge variant="gk" size="xs" />}
                        {p.isKey && !p.isGoalkeeper && <Badge variant="key" size="xs" />}
                      </span>
                    )
                  })}
                </div>
              </div>
            )
          })}

          {/* Delete row */}
          <div className="px-4 py-3">
            {confirmDel ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-[var(--fg-3)] flex-1">Xoá lần này?</span>
                <button
                  onClick={() => { setConfirmDel(false); onDelete() }}
                  className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
                >Xoá</button>
                <button
                  onClick={() => setConfirmDel(false)}
                  className="text-xs text-[var(--fg-3)] px-2 py-1.5"
                >Huỷ</button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmDel(true)}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors"
              >
                🗑 Xoá lần này
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function HistoryScreen() {
  const { state, dispatch } = useApp()
  const { history } = state
  const [confirmClear, setConfirmClear] = useState(false)

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center gap-3">
        <div className="text-5xl">🕑</div>
        <div>
          <h2 className="font-display text-xl font-bold text-[var(--fg-2)]">Chưa có lịch sử</h2>
          <p className="text-sm text-[var(--fg-3)] mt-1">Mỗi lần chia đội sẽ được lưu tự động tại đây.</p>
        </div>
        <Button variant="primary" size="md" onClick={() => dispatch({ type: 'SET_VIEW', view: 'today' })}>
          ⚽ Chia đội ngay
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border-subtle)] flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-[var(--fg-1)]">Lịch sử</h1>
          <p className="text-xs text-[var(--fg-3)]">{history.length} lần chia đội</p>
        </div>
        {history.length > 0 && (
          confirmClear ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setConfirmClear(false); dispatch({ type: 'CLEAR_HISTORY' }) }}
                className="text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-lg active:scale-95 transition-all"
              >Xoá tất cả</button>
              <button onClick={() => setConfirmClear(false)} className="text-xs text-[var(--fg-3)] px-2 py-1.5">Huỷ</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs text-red-400/60 hover:text-red-400 transition-colors px-2 py-1"
            >
              🗑 Xoá tất cả
            </button>
          )
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {history.map(entry => (
          <HistoryCard
            key={entry.id}
            entry={entry}
            onDelete={() => dispatch({ type: 'DELETE_HISTORY', id: entry.id })}
          />
        ))}
      </div>
    </div>
  )
}
