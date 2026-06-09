import React, { useRef, useEffect } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import type { Player, Team } from '../types'
import { TEAM_NAMES } from '../types'

interface Props {
  open: boolean
  teams: Team[]
  players: Player[]
  onClose: () => void
}

function drawExportCanvas(canvas: HTMLCanvasElement, teams: Team[], players: Player[]) {
  const SIZE = 1080
  canvas.width = SIZE
  canvas.height = SIZE
  const ctx = canvas.getContext('2d')!

  // Background
  ctx.fillStyle = '#0e1018'
  ctx.fillRect(0, 0, SIZE, SIZE)

  // Header stripe
  ctx.fillStyle = '#01645a'
  ctx.fillRect(0, 0, SIZE, 140)

  // Title
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 52px "Barlow Condensed", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('⚽ Chia Đội Bóng', SIZE / 2, 72)

  ctx.font = '500 28px "Be Vietnam Pro", sans-serif'
  ctx.fillStyle = 'rgba(255,255,255,.7)'
  const today = new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: 'numeric', month: 'numeric' })
  ctx.fillText(`${teams.reduce((s, t) => s + t.counts.total, 0)} cầu thủ · ${today}`, SIZE / 2, 118)

  // Team columns
  const cols = teams.length
  const colW = SIZE / cols
  const colors = ['#ef4444', '#22c55e', '#eab308']

  teams.forEach((team, ti) => {
    const x = ti * colW
    const teamPlayers = team.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]

    // Column header
    ctx.fillStyle = colors[ti]
    ctx.fillRect(x + 16, 160, colW - 32, 60)
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 42px "Barlow Condensed", sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(`ĐỘI ${(TEAM_NAMES[team.label as 'A'|'B'|'C'] ?? team.label).toUpperCase()}`, x + colW / 2, 203)

    // Sub-counts
    ctx.font = '500 22px "Be Vietnam Pro", sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,.75)'
    ctx.fillText(`${team.counts.total} người · 🧤${team.counts.gk} ⭐${team.counts.stars ?? (team.counts as any).key ?? 0}`, x + colW / 2, 240)

    // Players
    teamPlayers.forEach((p, pi) => {
      const y = 280 + pi * 64
      // Row bg
      ctx.fillStyle = pi % 2 === 0 ? '#181a22' : '#1e2028'
      ctx.fillRect(x + 16, y, colW - 32, 58)

      // Name
      ctx.fillStyle = '#f0f1f5'
      ctx.font = '600 26px "Be Vietnam Pro", sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(p.name, x + 32, y + 36)

      // Badges
      const badges = []
      if (p.isGoalkeeper) badges.push('🧤')
      if (!p.isGoalkeeper && p.stars > 0) badges.push('⭐'.repeat(p.stars))
      if (badges.length) {
        ctx.font = '22px serif'
        ctx.textAlign = 'right'
        ctx.fillText(badges.join(' '), x + colW - 32, y + 36)
      }
    })
  })

  // Footer
  ctx.fillStyle = '#01645a'
  ctx.fillRect(0, SIZE - 64, SIZE, 64)
  ctx.fillStyle = 'rgba(255,255,255,.6)'
  ctx.font = '500 22px "Be Vietnam Pro", sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('Football Team Randomizer', SIZE / 2, SIZE - 24)
}

export function ExportSheet({ open, teams, players, onClose }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const previewRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!open || !canvasRef.current) return
    drawExportCanvas(canvasRef.current, teams, players)
    // Scale to preview
    if (previewRef.current && canvasRef.current) {
      const pCtx = previewRef.current.getContext('2d')!
      previewRef.current.width = 360
      previewRef.current.height = 360
      pCtx.drawImage(canvasRef.current, 0, 0, 360, 360)
    }
  }, [open, teams, players])

  const handleSave = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'chiadoi.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const handleShare = async () => {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      canvas.toBlob(async (blob) => {
        if (!blob) return
        if (navigator.share) {
          await navigator.share({ files: [new File([blob], 'chiadoi.png', { type: 'image/png' })], title: 'Chia Đội Bóng' })
        } else {
          handleSave()
        }
      })
    } catch {
      handleSave()
    }
  }

  return (
    <Sheet open={open} onClose={onClose} title="Xuất ảnh">
      <div className="p-4 space-y-4">
        <div className="text-xs text-[var(--fg-3)] mb-2">Xem trước · tỉ lệ 1:1</div>
        <canvas ref={previewRef} className="w-full rounded-xl border border-[var(--border-default)]" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="flex gap-2">
          <Button variant="primary" size="md" className="flex-1" onClick={handleShare}>📱 Gửi Zalo</Button>
          <Button variant="ghost" size="md" className="flex-1" onClick={handleSave}>💾 Lưu ảnh</Button>
        </div>
      </div>
    </Sheet>
  )
}
