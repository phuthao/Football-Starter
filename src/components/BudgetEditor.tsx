import React, { useState, useEffect } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import type { BudgetEntry, ExpenseItem, HistoryEntry } from '../types'
import { v4 as uuid } from 'uuid'

interface Props {
  open: boolean
  entry: BudgetEntry | null
  history: HistoryEntry[]
  totalBalance: number
  onSave: (e: BudgetEntry) => void
  onDelete: (id: string) => void
  onClose: () => void
}

const INCOME_LABELS: Record<string, string> = {
  fund: 'Tiền quỹ',
  match: 'Tiền trận',
  sponsor: 'Tài trợ',
}

const EXPENSE_LABELS: Record<string, string> = {
  pitch: 'Tiền Sân',
  water: 'Tiền Nước',
}

function fmt(n: number) {
  return n === 0 ? '' : n.toLocaleString('vi-VN')
}

function parse(s: string): number {
  const n = parseInt(s.replace(/\D/g, ''), 10)
  return isNaN(n) ? 0 : n
}

function AmountInput({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [raw, setRaw] = useState(fmt(value))
  useEffect(() => { setRaw(fmt(value)) }, [value])
  return (
    <input
      inputMode="numeric"
      value={raw}
      onChange={e => setRaw(e.target.value)}
      onBlur={() => { const n = parse(raw); onChange(n); setRaw(fmt(n)) }}
      placeholder="0"
      className="w-32 h-9 px-3 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-right text-sm focus:outline-none focus:border-brand-500 transition-colors"
    />
  )
}

export function BudgetEditor({ open, entry, history, totalBalance, onSave, onDelete, onClose }: Props) {
  const [sessionId, setSessionId] = useState<string | undefined>(undefined)
  const [note, setNote] = useState('')
  const [fundAmt, setFundAmt] = useState(0)
  const [matchAmt, setMatchAmt] = useState(0)
  const [sponsorAmt, setSponsorAmt] = useState(0)
  const [pitchAmt, setPitchAmt] = useState(0)
  const [waterAmt, setWaterAmt] = useState(0)
  const [others, setOthers] = useState<{ label: string; amount: number }[]>([])

  useEffect(() => {
    if (entry) {
      setSessionId(entry.sessionId)
      setNote(entry.note ?? '')
      setFundAmt(entry.income.find(i => i.type === 'fund')?.amount ?? 0)
      setMatchAmt(entry.income.find(i => i.type === 'match')?.amount ?? 0)
      setSponsorAmt(entry.income.find(i => i.type === 'sponsor')?.amount ?? 0)
      setPitchAmt(entry.expenses.find(e => e.type === 'pitch')?.amount ?? 0)
      setWaterAmt(entry.expenses.find(e => e.type === 'water')?.amount ?? 0)
      setOthers(entry.expenses.filter(e => e.type === 'other').map(e => ({ label: e.label ?? '', amount: e.amount })))
    } else {
      setSessionId(undefined)
      setNote('')
      setFundAmt(0); setMatchAmt(0); setSponsorAmt(0)
      setPitchAmt(0); setWaterAmt(0); setOthers([])
    }
  }, [entry, open])

  const totalIncome = fundAmt + matchAmt + sponsorAmt
  const totalExpense = pitchAmt + waterAmt + others.reduce((s, o) => s + o.amount, 0)
  const net = totalIncome - totalExpense
  const prevNet = entry
    ? entry.income.reduce((s, i) => s + i.amount, 0) - entry.expenses.reduce((s, e) => s + e.amount, 0)
    : 0
  const balanceAfter = totalBalance - prevNet + net

  const handleSave = () => {
    const expenses: ExpenseItem[] = [
      { type: 'pitch', amount: pitchAmt },
      { type: 'water', amount: waterAmt },
      ...others.map(o => ({ type: 'other' as const, label: o.label || 'Khác', amount: o.amount })),
    ]
    onSave({
      id: entry?.id ?? uuid(),
      createdAt: entry?.createdAt ?? new Date().toISOString(),
      sessionId,
      note: note.trim() || undefined,
      income: [
        { type: 'fund', amount: fundAmt },
        { type: 'match', amount: matchAmt },
        { type: 'sponsor', amount: sponsorAmt },
      ],
      expenses,
    })
  }

  const addOther = () => setOthers(prev => [...prev, { label: '', amount: 0 }])
  const removeOther = (i: number) => setOthers(prev => prev.filter((_, idx) => idx !== i))
  const updateOtherLabel = (i: number, label: string) => setOthers(prev => prev.map((o, idx) => idx === i ? { ...o, label } : o))
  const updateOtherAmt = (i: number, amount: number) => setOthers(prev => prev.map((o, idx) => idx === i ? { ...o, amount } : o))

  return (
    <Sheet open={open} onClose={onClose} title={entry ? 'Sửa khoản' : 'Thêm khoản'}>
      <div className="p-4 space-y-5 pb-8">

        {/* Link to session */}
        <div>
          <label className="block text-xs font-semibold text-[var(--fg-3)] mb-1.5 uppercase tracking-wide">Gắn trận (tuỳ chọn)</label>
          <select
            value={sessionId ?? ''}
            onChange={e => setSessionId(e.target.value || undefined)}
            className="w-full h-10 px-3 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-sm focus:outline-none focus:border-brand-500 transition-colors"
          >
            <option value="">— Không gắn trận —</option>
            {history.map(h => (
              <option key={h.id} value={h.id}>
                {new Date(h.savedAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                {' '}({h.teams.reduce((s, t) => s + t.counts.total, 0)} người)
              </option>
            ))}
          </select>
        </div>

        {/* Note */}
        <div>
          <label className="block text-xs font-semibold text-[var(--fg-3)] mb-1.5 uppercase tracking-wide">Ghi chú</label>
          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="vd: Nạp quỹ đầu mùa"
            className="w-full h-10 px-3 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-sm placeholder:text-[var(--fg-3)] focus:outline-none focus:border-brand-500 transition-colors"
          />
        </div>

        {/* Income */}
        <div>
          <div className="text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wide mb-2">Thu</div>
          <div className="space-y-2">
            {([['fund', fundAmt, setFundAmt], ['match', matchAmt, setMatchAmt], ['sponsor', sponsorAmt, setSponsorAmt]] as [string, number, (n: number) => void][]).map(([type, val, setter]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-[var(--fg-1)]">{INCOME_LABELS[type]}</span>
                <AmountInput value={val} onChange={setter} />
                <span className="text-xs text-[var(--fg-3)] w-4">₫</span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-right text-xs text-brand-500 font-semibold">Tổng thu: {totalIncome.toLocaleString('vi-VN')} ₫</div>
        </div>

        {/* Expenses */}
        <div>
          <div className="text-xs font-semibold text-[var(--fg-3)] uppercase tracking-wide mb-2">Chi</div>
          <div className="space-y-2">
            {([['pitch', pitchAmt, setPitchAmt], ['water', waterAmt, setWaterAmt]] as [string, number, (n: number) => void][]).map(([type, val, setter]) => (
              <div key={type} className="flex items-center gap-2">
                <span className="flex-1 text-sm text-[var(--fg-1)]">{EXPENSE_LABELS[type]}</span>
                <AmountInput value={val} onChange={setter} />
                <span className="text-xs text-[var(--fg-3)] w-4">₫</span>
              </div>
            ))}
            {others.map((o, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={o.label}
                  onChange={e => updateOtherLabel(i, e.target.value)}
                  placeholder="Tên khoản"
                  className="flex-1 h-9 px-3 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-sm placeholder:text-[var(--fg-3)] focus:outline-none focus:border-brand-500 transition-colors"
                />
                <AmountInput value={o.amount} onChange={n => updateOtherAmt(i, n)} />
                <button onClick={() => removeOther(i)} className="text-[var(--fg-3)] hover:text-red-400 transition-colors text-lg leading-none">×</button>
              </div>
            ))}
            <button
              onClick={addOther}
              className="text-xs text-brand-500 font-semibold bg-brand-500/10 px-3 py-1.5 rounded-full border border-brand-500/20 active:scale-95 transition-all"
            >
              + Thêm khoản khác
            </button>
          </div>
          <div className="mt-2 text-right text-xs text-red-400 font-semibold">Tổng chi: {totalExpense.toLocaleString('vi-VN')} ₫</div>
        </div>

        {/* Summary */}
        <div className="bg-[var(--bg-sunken)] rounded-xl p-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--fg-3)]">Kỳ này</span>
            <span className={`font-bold ${net >= 0 ? 'text-brand-500' : 'text-red-400'}`}>
              {net >= 0 ? '+' : ''}{net.toLocaleString('vi-VN')} ₫
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--fg-3)]">Tồn quỹ sau</span>
            <span className="font-bold text-[var(--fg-1)]">{balanceAfter.toLocaleString('vi-VN')} ₫</span>
          </div>
        </div>

        <Button variant="primary" size="lg" block onClick={handleSave}>Lưu khoản</Button>
        {entry && (
          <Button variant="danger" size="md" block onClick={() => onDelete(entry.id)}>Xoá khoản</Button>
        )}
      </div>
    </Sheet>
  )
}
