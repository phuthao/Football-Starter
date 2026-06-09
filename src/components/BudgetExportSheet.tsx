import React, { useRef, useEffect } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import type { BudgetEntry } from '../types'

interface Props {
  open: boolean
  entry: BudgetEntry | null
  totalBalance: number
  onClose: () => void
}

const INCOME_LABELS: Record<string, string> = { fund: 'Tiền quỹ', match: 'Tiền trận', sponsor: 'Tài trợ' }
const EXPENSE_LABELS: Record<string, string> = { pitch: 'Tiền Sân', water: 'Tiền Nước' }

function vnd(n: number) { return n.toLocaleString('vi-VN') + ' ₫' }

export function BudgetExportSheet({ open, entry, totalBalance, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const totalIncome  = entry ? entry.income.reduce((s, i) => s + i.amount, 0) : 0
  const totalExpense = entry ? entry.expenses.reduce((s, e) => s + e.amount, 0) : 0
  const net = totalIncome - totalExpense

  useEffect(() => {
    if (!open || !entry || !canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')!
    const W = 600

    const incomeRows = entry.income.filter(i => i.amount > 0)
    const expenseRows = entry.expenses.filter(e => e.amount > 0)
    const rowH = 44
    const H = 160 + (incomeRows.length + expenseRows.length) * rowH + 200
    canvas.width = W
    canvas.height = H

    ctx.fillStyle = '#13151f'
    ctx.fillRect(0, 0, W, H)

    // Header
    ctx.fillStyle = '#0d9488'
    ctx.fillRect(0, 0, W, 110)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px sans-serif'
    ctx.textAlign = 'center'
    const dateStr = new Date(entry.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    ctx.fillText('⚽ BILL TRẬN ' + dateStr, W / 2, 52)
    if (entry.note) {
      ctx.font = '18px sans-serif'
      ctx.fillStyle = 'rgba(255,255,255,0.8)'
      ctx.fillText(entry.note, W / 2, 82)
    }

    let y = 130
    const drawSection = (label: string, rows: { label: string; amount: number }[], color: string) => {
      ctx.fillStyle = color
      ctx.font = 'bold 15px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label.toUpperCase(), 40, y)
      y += 8
      ctx.strokeStyle = color + '50'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke()
      y += 12
      rows.forEach(row => {
        ctx.fillStyle = '#cccccc'
        ctx.font = '19px sans-serif'
        ctx.textAlign = 'left'
        ctx.fillText(row.label, 56, y + 13)
        ctx.fillStyle = '#ffffff'
        ctx.font = '600 19px sans-serif'
        ctx.textAlign = 'right'
        ctx.fillText(vnd(row.amount), W - 40, y + 13)
        y += rowH
      })
      y += 10
    }

    drawSection('Thu', incomeRows.map(i => ({ label: INCOME_LABELS[i.type] ?? i.type, amount: i.amount })), '#2dd4bf')
    drawSection('Chi', expenseRows.map(e => ({
      label: e.type === 'other' ? (e.label ?? 'Khác') : (EXPENSE_LABELS[e.type] ?? e.type),
      amount: e.amount,
    })), '#f87171')

    ctx.strokeStyle = '#ffffff20'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(W - 40, y); ctx.stroke()
    y += 24

    const drawRow = (label: string, value: string, color: string, large: boolean) => {
      ctx.fillStyle = '#999999'
      ctx.font = (large ? 'bold 20px' : '17px') + ' sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(label, 40, y)
      ctx.fillStyle = color
      ctx.font = (large ? 'bold 24px' : 'bold 19px') + ' sans-serif'
      ctx.textAlign = 'right'
      ctx.fillText(value, W - 40, y)
      y += large ? 40 : 32
    }

    drawRow('Kỳ này:', (net >= 0 ? '+' : '') + vnd(net), net >= 0 ? '#2dd4bf' : '#f87171', false)
    drawRow('Tồn quỹ:', vnd(totalBalance), '#ffffff', true)
  }, [open, entry, totalBalance])

  const handleExportPNG = async () => {
    if (!canvasRef.current) return
    const blob = await new Promise<Blob>(res => canvasRef.current!.toBlob(b => res(b!), 'image/png'))
    const file = new File([blob], 'bill.png', { type: 'image/png' })
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Bill trận' })
    } else {
      const a = document.createElement('a')
      a.href = URL.createObjectURL(blob)
      a.download = 'bill.png'
      a.click()
    }
  }

  const handleCopyText = () => {
    if (!entry) return
    const dateStr = new Date(entry.createdAt).toLocaleDateString('vi-VN')
    const lines: string[] = [`⚽ Bill trận ${dateStr}`]
    if (entry.note) lines.push(entry.note)
    lines.push('─────────────────')
    lines.push('THU')
    entry.income.filter(i => i.amount > 0).forEach(i => {
      lines.push(`  ${INCOME_LABELS[i.type] ?? i.type}: ${vnd(i.amount)}`)
    })
    lines.push('CHI')
    entry.expenses.filter(e => e.amount > 0).forEach(e => {
      const label = e.type === 'other' ? (e.label ?? 'Khác') : (EXPENSE_LABELS[e.type] ?? e.type)
      lines.push(`  ${label}: ${vnd(e.amount)}`)
    })
    lines.push('─────────────────')
    lines.push(`Kỳ này:   ${net >= 0 ? '+' : ''}${vnd(net)}`)
    lines.push(`Tồn quỹ:  ${vnd(totalBalance)}`)
    navigator.clipboard.writeText(lines.join('\n'))
  }

  return (
    <Sheet open={open} onClose={onClose} title="Chia sẻ bill">
      <div className="p-4 space-y-4 pb-8">
        <canvas ref={canvasRef} className="w-full rounded-xl border border-[var(--border-subtle)]" />
        <div className="flex gap-2">
          <Button variant="ghost" size="md" onClick={handleCopyText} className="flex-1">📋 Copy text</Button>
          <Button variant="primary" size="md" onClick={handleExportPNG} className="flex-1">📤 Xuất ảnh</Button>
        </div>
      </div>
    </Sheet>
  )
}
