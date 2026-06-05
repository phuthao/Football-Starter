export type Position = 'ST' | 'MID' | 'DEF' | 'GK'

export interface Player {
  id: string
  name: string
  position: Position
  isGoalkeeper: boolean
  isKey: boolean
}

export interface Team {
  label: 'A' | 'B' | 'C'
  playerIds: string[]
  counts: { total: number; gk: number; key: number }
}

export interface Session {
  presentIds: string[]
  teamCount: 2 | 3
}

export interface HistoryEntry {
  id: string
  savedAt: string  // ISO
  teams: Team[]
  playerSnapshot: Record<string, Pick<Player, 'name' | 'isGoalkeeper' | 'isKey'>>
}

export interface AppState {
  players: Player[]
  session: Session
  lastTeams: Team[] | null
  lastTeamsSavedAt: string | null
  history: HistoryEntry[]
  selectedHistoryId: string | null
  view: 'today' | 'players' | 'history'
  resultOpen: boolean
  formationOpen: boolean
  exportOpen: boolean
  playerEditorOpen: boolean
  editingPlayer: Player | null
}
