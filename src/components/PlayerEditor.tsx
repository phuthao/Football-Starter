import React, { useState, useEffect } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import { SegmentControl } from './ui/SegmentControl'
import type { Player, Position } from '../types'
import { v4 as uuid } from 'uuid'

interface Props {
  open: boolean
  player: Player | null
  onSave: (p: Player) => void
  onClose: () => void
  onDelete?: (id: string) => void
}

const POSITIONS: { value: Position; label: string }[] = [
  { value: 'ST', label: 'ST' },
  { value: 'MID', label: 'TTV' },
  { value: 'DEF', label: 'HV' },
  { value: 'GK', label: 'TM' },
]

export function PlayerEditor({ open, player, onSave, onClose, onDelete }: Props) {
  const [name, setName] = useState('')
  const [position, setPosition] = useState<Position>('MID')
  const [isGoalkeeper, setIsGoalkeeper] = useState(false)
  const [isKey, setIsKey] = useState(false)

  useEffect(() => {
    if (player) {
      setName(player.name)
      setPosition(player.position)
      setIsGoalkeeper(player.isGoalkeeper)
      setIsKey(player.isKey)
    } else {
      setName('')
      setPosition('MID')
      setIsGoalkeeper(false)
      setIsKey(false)
    }
  }, [player, open])

  const handlePositionChange = (pos: Position) => {
    setPosition(pos)
    if (pos === 'GK') setIsGoalkeeper(true)
    else setIsGoalkeeper(false)
  }

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      id: player?.id ?? uuid(),
      name: name.trim(),
      position,
      isGoalkeeper,
      isKey,
    })
  }

  return (
    <Sheet open={open} onClose={onClose} title={player ? 'Sửa cầu thủ' : 'Thêm cầu thủ'}>
      <div className="p-4 space-y-5 pb-8">
        {/* Name */}
        <div>
          <label className="block text-xs font-semibold text-[var(--fg-3)] mb-1.5 uppercase tracking-wide">Tên</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Nhập tên cầu thủ"
            className="w-full h-12 px-4 rounded-lg bg-[var(--bg-sunken)] border border-[var(--border-default)] text-[var(--fg-1)] text-base placeholder:text-[var(--fg-3)] focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-colors"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-xs font-semibold text-[var(--fg-3)] mb-1.5 uppercase tracking-wide">Vị trí</label>
          <SegmentControl options={POSITIONS} value={position} onChange={handlePositionChange} />
        </div>

        {/* Toggles */}
        <div className="space-y-3">
          <Toggle
            label="🧤 Thủ môn"
            sub="Xếp vào nhóm GK khi chia đội"
            checked={isGoalkeeper}
            onChange={v => { setIsGoalkeeper(v); if (v) setPosition('GK') }}
          />
          <Toggle
            label="⭐ Chủ lực"
            sub="Chia đều giữa các đội"
            checked={isKey}
            onChange={setIsKey}
            disabled={isGoalkeeper}
          />
        </div>

        <Button variant="primary" size="lg" block onClick={handleSave} disabled={!name.trim()}>
          Lưu cầu thủ
        </Button>

        {player && onDelete && (
          <Button variant="danger" size="md" block onClick={() => onDelete(player.id)}>
            Xoá cầu thủ
          </Button>
        )}
      </div>
    </Sheet>
  )
}

function Toggle({ label, sub, checked, onChange, disabled }: {
  label: string; sub: string; checked: boolean; onChange: (v: boolean) => void; disabled?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
        checked ? 'bg-brand-500/10 border-brand-500/30' : 'bg-[var(--bg-sunken)] border-[var(--border-subtle)]'
      } ${disabled ? 'opacity-40' : ''}`}
    >
      <div className="flex-1">
        <div className="text-sm font-semibold text-[var(--fg-1)]">{label}</div>
        <div className="text-xs text-[var(--fg-3)]">{sub}</div>
      </div>
      <button
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`w-11 h-6 rounded-full transition-all relative ${checked ? 'bg-brand-500' : 'bg-[var(--border-default)]'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-5.5' : 'left-0.5'}`}
          style={{ left: checked ? '22px' : '2px' }}
        />
      </button>
    </div>
  )
}
