export type Position = 'ST' | 'MID' | 'DEF' | 'GK'

export interface Player {
  id: string
  name: string
  position: Position
  isGoalkeeper: boolean
  stars: 0 | 1 | 2
}

export interface Team {
  label: 'A' | 'B' | 'C'
  playerIds: string[]
  counts: { total: number; gk: number; stars: number }
}

export const TEAM_NAMES: Record<'A' | 'B' | 'C', string> = {
  A: 'Đỏ',
  B: 'Xanh',
  C: 'Tím',
}

export interface Session {
  presentIds: string[]
  teamCount: 2 | 3
}

export interface HistoryEntry {
  id: string
  savedAt: string  // ISO
  teams: Team[]
  playerSnapshot: Record<string, Pick<Player, 'name' | 'isGoalkeeper' | 'stars'>>
}

export type IncomeType = 'fund' | 'match' | 'sponsor'
export type ExpenseType = 'pitch' | 'water' | 'other'

export interface IncomeItem {
  type: IncomeType
  amount: number
}

export interface ExpenseItem {
  type: ExpenseType
  label?: string
  amount: number
}

export interface BudgetEntry {
  id: string
  createdAt: string
  sessionId?: string
  note?: string
  income: IncomeItem[]
  expenses: ExpenseItem[]
}

export interface AppState {
  players: Player[]
  session: Session
  lastTeams: Team[] | null
  lastTeamsSavedAt: string | null
  history: HistoryEntry[]
  budget: BudgetEntry[]
  selectedHistoryId: string | null
  view: 'today' | 'players' | 'history'
  resultOpen: boolean
  formationOpen: boolean
  exportOpen: boolean
  playerEditorOpen: boolean
  editingPlayer: Player | null
  budgetEditorOpen: boolean
  editingBudget: BudgetEntry | null
  budgetExportOpen: boolean
  exportingBudget: BudgetEntry | null
  isLoggedIn: boolean
  authLoading: boolean
}
