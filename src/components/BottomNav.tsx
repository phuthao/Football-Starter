import React from 'react'
import type { AppState } from '../types'

interface Props {
  view: AppState['view']
  onChange: (v: AppState['view']) => void
}

const TABS: { id: AppState['view']; icon: string; label: string }[] = [
  { id: 'today', icon: '⚽', label: 'Chia đội' },
  { id: 'players', icon: '👥', label: 'Cầu thủ' },
  { id: 'history', icon: '🕑', label: 'Lịch sử' },
]

export function BottomNav({ view, onChange }: Props) {
  return (
    <nav className="flex border-t border-[var(--border-subtle)] bg-[var(--bg-surface)] pb-safe-or-1 shrink-0">
      {TABS.map(tab => {
        const active = view === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 transition-colors ${
              active ? 'text-brand-500' : 'text-[var(--fg-3)]'
            }`}
          >
            <span className="text-xl leading-none">{tab.icon}</span>
            <span className={`text-[10px] font-semibold ${active ? 'text-brand-500' : 'text-[var(--fg-3)]'}`}>
              {tab.label}
            </span>
            {active && <div className="absolute -bottom-0 h-0.5 w-8 bg-brand-500 rounded-full" />}
          </button>
        )
      })}
    </nav>
  )
}
