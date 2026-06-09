import type { BudgetEntry, HistoryEntry, Player, Session, Team } from '../types'

const K = {
  players:  'ftr.players',
  session:  'ftr.session',
  lastTeams:'ftr.lastTeams',
  history:  'ftr.history',
}

function get<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

function set(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function loadPlayers(): Player[] {
  return get<Player[]>(K.players) ?? []
}

export function savePlayers(players: Player[]) {
  set(K.players, players)
}

export function loadSession(players: Player[]): Session {
  const saved = get<Session>(K.session)
  if (saved) {
    const validIds = new Set(players.map(p => p.id))
    const presentIds = saved.presentIds.filter(id => validIds.has(id))
    // Add newly added players as present
    const newIds = players.filter(p => !saved.presentIds.includes(p.id)).map(p => p.id)
    return { ...saved, presentIds: [...presentIds, ...newIds] }
  }
  return { presentIds: players.map(p => p.id), teamCount: 2 }
}

export function saveSession(session: Session) {
  set(K.session, session)
}

export interface LastSession {
  teams: Team[]
  savedAt: string  // ISO string
}

export function loadLastSession(): LastSession | null {
  return get<LastSession>(K.lastTeams)
}

export function saveLastSession(teams: Team[]) {
  set(K.lastTeams, { teams, savedAt: new Date().toISOString() })
}

// Compat shim — old format was Team[] directly
export function loadLastTeams(): Team[] | null {
  const raw = get<LastSession | Team[]>(K.lastTeams)
  if (!raw) return null
  return Array.isArray(raw) ? raw : raw.teams
}

export function loadHistory(): HistoryEntry[] {
  return get<HistoryEntry[]>(K.history) ?? []
}

export function saveHistory(history: HistoryEntry[]) {
  set(K.history, history)
}

export function loadBudget(): BudgetEntry[] {
  return get<BudgetEntry[]>('ftr.budget') ?? []
}

export function saveBudget(budget: BudgetEntry[]) {
  set('ftr.budget', budget)
}
