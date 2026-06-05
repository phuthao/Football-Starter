import React, { useState } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import { SegmentControl } from './ui/SegmentControl'
import type { Player, Team } from '../types'
import { Badge } from './ui/Badge'

const POSITIONS = [
  { key: 'ST',  label: 'ST',  top: '10%',  left: '50%' },
  { key: 'LM',  label: 'LM',  top: '28%',  left: '22%' },
  { key: 'RM',  label: 'RM',  top: '28%',  left: '78%' },
  { key: 'CM',  label: 'CM',  top: '46%',  left: '50%' },
  { key: 'LB',  label: 'LB',  top: '64%',  left: '24%' },
  { key: 'RB',  label: 'RB',  top: '64%',  left: '76%' },
  { key: 'GK',  label: 'GK',  top: '84%',  left: '50%' },
]

interface Props {
  open: boolean
  teams: Team[]
  players: Player[]
  onClose: () => void
  onExport: () => void
}

export function FormationSheet({ open, teams, players, onClose, onExport }: Props) {
  const [teamIdx, setTeamIdx] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [assignment, setAssignment] = useState<Record<string, string>>({})

  const team = teams[teamIdx]
  if (!team) return null

  const teamPlayers = team.playerIds.map(id => players.find(p => p.id === id)).filter(Boolean) as Player[]

  // Auto-assign: GK to GK slot, rest to other positions
  const getAutoAssignment = () => {
    const result: Record<string, string> = {}
    const gks = teamPlayers.filter(p => p.isGoalkeeper)
    const rest = teamPlayers.filter(p => !p.isGoalkeeper)
    if (gks[0]) result['GK'] = gks[0].id
    const otherPos = POSITIONS.filter(p => p.key !== 'GK')
    rest.slice(0, otherPos.length).forEach((p, i) => { result[otherPos[i].key] = p.id })
    return result
  }

  const assign = Object.keys(assignment).length > 0 ? assignment : getAutoAssignment()

  const handlePosClick = (posKey: string) => {
    if (!selected) {
      setSelected(posKey)
      return
    }
    if (selected === posKey) {
      setSelected(null)
      return
    }
    // Swap
    const newAssign = { ...assign }
    const tmp = newAssign[selected]
    newAssign[selected] = newAssign[posKey]
    newAssign[posKey] = tmp
    setAssignment(newAssign)
    setSelected(null)
  }

  const teamOpts = teams.map((t, i) => ({ value: i, label: `Đội ${t.label}` }))

  return (
    <Sheet open={open} onClose={onClose} title="Sơ đồ sân" fullHeight>
      <div className="p-4 space-y-4">
        <SegmentControl options={teamOpts} value={teamIdx} onChange={(v) => { setTeamIdx(v as number); setAssignment({}) }} />

        {/* Pitch */}
        <div className="pitch-bg rounded-xl relative" style={{ aspectRatio: '2/3', width: '100%' }}>
          {/* Centre circle */}
          <div className="absolute border border-white/20 rounded-full" style={{ width: '30%', aspectRatio: '1/1', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          {/* Halfway line */}
          <div className="absolute bg-white/15" style={{ height: '1px', width: '100%', top: '50%' }} />

          {POSITIONS.map(pos => {
            const playerId = assign[pos.key]
            const player = playerId ? players.find(p => p.id === playerId) : null
            const isSelected = selected === pos.key
            return (
              <button
                key={pos.key}
                onClick={() => handlePosClick(pos.key)}
                className={`absolute flex flex-col items-center transition-all active:scale-90`}
                style={{
                  top: pos.top,
                  left: pos.left,
                  transform: 'translate(-50%, -50%)',
                  animation: 'popIn 0.3s ease both',
                }}
              >
                <div className={`rounded-full border-2 flex items-center justify-center font-bold text-xs transition-all ${
                  isSelected ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' : ''
                } ${
                  player
                    ? 'w-10 h-10 bg-brand-500 border-lime-400 text-white shadow-md'
                    : 'w-8 h-8 bg-white/10 border-white/30 text-white/50'
                }`}>
                  {player ? player.name.charAt(0) : pos.label}
                </div>
                {player && (
                  <div className="mt-0.5 text-white text-[10px] font-semibold bg-black/40 px-1.5 py-0 rounded-sm leading-5 max-w-[52px] truncate">
                    {player.name}
                  </div>
                )}
              </button>
            )
          })}
        </div>

        {selected && (
          <div className="text-center text-xs text-[var(--fg-3)]">
            Chọn vị trí thứ hai để đổi chỗ
          </div>
        )}

        <Button variant="primary" size="lg" block onClick={onExport}>📤 Tạo ảnh chia sẻ</Button>
      </div>
    </Sheet>
  )
}
