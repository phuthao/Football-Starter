import { supabase } from './supabase'
import type { BudgetEntry, HistoryEntry, Player } from '../types'

type Table = 'players' | 'budget' | 'sessions'

async function getUserId(): Promise<string> {
  const { data } = await supabase.auth.getSession()
  return data.session!.user.id
}

async function upsertRows(table: Table, rows: { id: string; data: unknown }[]) {
  const userId = await getUserId()
  if (!rows.length) return
  await supabase.from(table).upsert(
    rows.map(r => ({ id: r.id, user_id: userId, data: r.data })),
    { onConflict: 'id' }
  )
}

async function fetchRows<T extends { id: string }>(table: Table): Promise<T[]> {
  const { data, error } = await supabase.from(table).select('data')
  if (error || !data) return []
  return data.map((r: { data: T }) => r.data)
}

export async function syncPlayers(local: Player[]): Promise<Player[]> {
  const remote = await fetchRows<Player>('players')
  const remoteMap = new Map(remote.map(p => [p.id, p]))
  const localOnly = local.filter(p => !remoteMap.has(p.id))
  if (localOnly.length) await upsertRows('players', localOnly.map(p => ({ id: p.id, data: p })))
  const merged = [...remote, ...localOnly]
  return merged.length ? merged : local
}

export async function syncBudget(local: BudgetEntry[]): Promise<BudgetEntry[]> {
  const remote = await fetchRows<BudgetEntry>('budget')
  const remoteMap = new Map(remote.map(e => [e.id, e]))
  const localOnly = local.filter(e => !remoteMap.has(e.id))
  if (localOnly.length) await upsertRows('budget', localOnly.map(e => ({ id: e.id, data: e })))
  const merged = [...remote, ...localOnly]
  return merged.length ? merged : local
}

export async function syncSessions(local: HistoryEntry[]): Promise<HistoryEntry[]> {
  const remote = await fetchRows<HistoryEntry>('sessions')
  const remoteMap = new Map(remote.map(e => [e.id, e]))
  const localOnly = local.filter(e => !remoteMap.has(e.id))
  if (localOnly.length) await upsertRows('sessions', localOnly.map(e => ({ id: e.id, data: e })))
  const merged = [...remote, ...localOnly]
  return merged.length ? merged : local
}

export async function pushPlayer(player: Player) {
  const userId = await getUserId()
  await supabase.from('players').upsert({ id: player.id, user_id: userId, data: player }, { onConflict: 'id' })
}

export async function deletePlayer(id: string) {
  await supabase.from('players').delete().eq('id', id)
}

export async function pushBudgetEntry(entry: BudgetEntry) {
  const userId = await getUserId()
  await supabase.from('budget').upsert({ id: entry.id, user_id: userId, data: entry }, { onConflict: 'id' })
}

export async function deleteBudgetEntry(id: string) {
  await supabase.from('budget').delete().eq('id', id)
}

export async function pushSession(entry: HistoryEntry) {
  const userId = await getUserId()
  await supabase.from('sessions').upsert({ id: entry.id, user_id: userId, data: entry }, { onConflict: 'id' })
}

export async function deleteSession(id: string) {
  await supabase.from('sessions').delete().eq('id', id)
}
