import React from 'react'
import { useApp } from '../store/AppContext'
import type { BudgetEntry } from '../types'

function vnd(n: number) { return n.toLocaleString('vi-VN') + ' ₫' }

function BudgetCard({ entry, onEdit }: { entry: BudgetEntry; onEdit: () => void }) {
  const totalIncome = entry.income.reduce((s, i) => s + i.amount, 0)
  const totalExpense = entry.expenses.reduce((s, e) => s + e.amount, 0)
  const net = totalIncome - totalExpense
  const dateStr = new Date(entry.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })

  return (
    <button
      onClick={onEdit}
      className="w-full bg-[var(--bg-overlay)] rounded-xl border border-[var(--border-subtle)] px-4 py-3 text-left active:bg-[var(--bg-sunken)] transition-colors"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-[var(--fg-1)]">{dateStr}</div>
          {entry.note && <div className="text-xs text-[var(--fg-3)] truncate mt-0.5">{entry.note}</div>}
        </div>
        <div className="text-right shrink-0">
          <div className={`text-sm font-bold ${net >= 0 ? 'text-brand-500' : 'text-red-400'}`}>
            {net >= 0 ? '+' : ''}{vnd(net)}
          </div>
          <div className="text-[10px] text-[var(--fg-3)] mt-0.5">
            Thu {vnd(totalIncome)} · Chi {vnd(totalExpense)}
          </div>
        </div>
      </div>
    </button>
  )
}

export function BudgetScreen() {
  const { state, dispatch } = useApp()
  const { budget } = state

  const totalBalance = budget.reduce((sum, e) => {
    const inc = e.income.reduce((s, i) => s + i.amount, 0)
    const exp = e.expenses.reduce((s, ex) => s + ex.amount, 0)
    return sum + inc - exp
  }, 0)

  const totalIncome = budget.reduce((s, e) => s + e.income.reduce((si, i) => si + i.amount, 0), 0)
  const totalExpense = budget.reduce((s, e) => s + e.expenses.reduce((se, ex) => se + ex.amount, 0), 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-[var(--border-subtle)]">
        <h1 className="font-display text-2xl font-bold text-[var(--fg-1)]">Ngân sách</h1>
        <p className="text-xs text-[var(--fg-3)]">{budget.length} khoản</p>
      </div>

      {/* Balance card */}
      <div className="px-4 pt-4">
        <div className="bg-gradient-to-br from-brand-500/20 to-brand-500/5 border border-brand-500/30 rounded-2xl p-4 space-y-3">
          <div className="text-xs font-semibold text-brand-500 uppercase tracking-wide">Tồn quỹ</div>
          <div className="text-3xl font-bold text-[var(--fg-1)]">{vnd(totalBalance)}</div>
          <div className="flex gap-4 pt-1">
            <div>
              <div className="text-[10px] text-[var(--fg-3)]">Tổng thu</div>
              <div className="text-sm font-semibold text-brand-500">{vnd(totalIncome)}</div>
            </div>
            <div>
              <div className="text-[10px] text-[var(--fg-3)]">Tổng chi</div>
              <div className="text-sm font-semibold text-red-400">{vnd(totalExpense)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Entry list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {budget.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <div className="text-5xl">💰</div>
            <div>
              <div className="font-display text-lg font-bold text-[var(--fg-2)]">Chưa có khoản nào</div>
              <div className="text-sm text-[var(--fg-3)] mt-1">Nhấn + để thêm khoản thu chi.</div>
            </div>
          </div>
        ) : (
          budget.map(entry => (
            <BudgetCard
              key={entry.id}
              entry={entry}
              onEdit={() => dispatch({ type: 'OPEN_BUDGET_EDITOR', entry })}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <div className="px-4 pb-4">
        <button
          onClick={() => dispatch({ type: 'OPEN_BUDGET_EDITOR' })}
          className="w-full h-12 rounded-xl bg-brand-500 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-brand-500/30"
        >
          <span className="text-lg leading-none">+</span>
          Thêm khoản
        </button>
      </div>
    </div>
  )
}
