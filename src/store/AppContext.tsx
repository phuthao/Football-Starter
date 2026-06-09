import React, { createContext, useContext, useEffect, useReducer } from 'react'
import type { AppState, BudgetEntry, HistoryEntry, Player, Session, Team } from '../types'
import { loadPlayers, savePlayers, loadSession, saveSession, loadLastSession, saveLastSession, loadHistory, saveHistory, loadBudget, saveBudget } from '../lib/storage'
import { SEED_PLAYERS } from '../lib/seedData'
import { generateTeams, suggestTeamCount } from '../lib/randomizer'
import { getSession } from '../lib/supabase'
import { syncPlayers, syncBudget, syncSessions, pushPlayer, deletePlayer, pushBudgetEntry, deleteBudgetEntry, pushSession, deleteSession } from '../lib/sync'
import { v4 as uuid } from 'uuid'

type Action =
  | { type: 'SET_VIEW'; view: AppState['view'] }
  | { type: 'TOGGLE_PRESENT'; id: string }
  | { type: 'SET_ALL_PRESENT' }
  | { type: 'SET_TEAM_COUNT'; count: 2 | 3 }
  | { type: 'GENERATE' }
  | { type: 'OPEN_RESULT' }
  | { type: 'CLOSE_RESULT' }
  | { type: 'OPEN_FORMATION' }
  | { type: 'CLOSE_FORMATION' }
  | { type: 'OPEN_EXPORT' }
  | { type: 'CLOSE_EXPORT' }
  | { type: 'OPEN_EDITOR'; player?: Player }
  | { type: 'CLOSE_EDITOR' }
  | { type: 'SAVE_PLAYER'; player: Player }
  | { type: 'DELETE_PLAYER'; id: string }
  | { type: 'SELECT_HISTORY'; id: string | null }
  | { type: 'DELETE_HISTORY'; id: string }
  | { type: 'CLEAR_HISTORY' }
  | { type: 'ADD_BUDGET'; entry: BudgetEntry }
  | { type: 'UPDATE_BUDGET'; entry: BudgetEntry }
  | { type: 'DELETE_BUDGET'; id: string }
  | { type: 'OPEN_BUDGET_EDITOR'; entry?: BudgetEntry }
  | { type: 'CLOSE_BUDGET_EDITOR' }
  | { type: 'OPEN_BUDGET_EXPORT'; entry: BudgetEntry }
  | { type: 'CLOSE_BUDGET_EXPORT' }
  | { type: 'SET_LOGGED_IN'; value: boolean; email?: string }
  | { type: 'SET_AUTH_LOADING'; value: boolean }
  | { type: 'SYNC_COMPLETE'; players: Player[]; budget: BudgetEntry[]; history: HistoryEntry[] }

function buildInitialState(): AppState {
  let players = loadPlayers()
  if (players.length === 0) {
    players = SEED_PLAYERS
    savePlayers(players)
  }
  const session = loadSession(players)
  const lastSession = loadLastSession()
  const suggested = suggestTeamCount(session.presentIds.length)
  return {
    players,
    session: { ...session, teamCount: suggested },
    lastTeams: lastSession?.teams ?? null,
    lastTeamsSavedAt: lastSession?.savedAt ?? null,
    history: loadHistory(),
    budget: loadBudget(),
    selectedHistoryId: null,
    view: 'today',
    resultOpen: false,
    formationOpen: false,
    exportOpen: false,
    playerEditorOpen: false,
    editingPlayer: null,
    budgetEditorOpen: false,
    editingBudget: null,
    budgetExportOpen: false,
    exportingBudget: null,
    isLoggedIn: false,
    isAdmin: false,
    authLoading: true,
  }
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, view: action.view, resultOpen: false, formationOpen: false, exportOpen: false, selectedHistoryId: null }

    case 'TOGGLE_PRESENT': {
      const has = state.session.presentIds.includes(action.id)
      const presentIds = has
        ? state.session.presentIds.filter(id => id !== action.id)
        : [...state.session.presentIds, action.id]
      const session: Session = { ...state.session, presentIds, teamCount: suggestTeamCount(presentIds.length) }
      saveSession(session)
      return { ...state, session }
    }

    case 'SET_ALL_PRESENT': {
      const presentIds = state.players.map(p => p.id)
      const session: Session = { ...state.session, presentIds, teamCount: suggestTeamCount(presentIds.length) }
      saveSession(session)
      return { ...state, session }
    }

    case 'SET_TEAM_COUNT': {
      const session: Session = { ...state.session, teamCount: action.count }
      saveSession(session)
      return { ...state, session }
    }

    case 'GENERATE': {
      const present = state.players.filter(p => state.session.presentIds.includes(p.id))
      const teams = generateTeams(present, state.session.teamCount)
      const savedAt = new Date().toISOString()

      const snapshot: HistoryEntry['playerSnapshot'] = {}
      present.forEach(p => { snapshot[p.id] = { name: p.name, isGoalkeeper: p.isGoalkeeper, stars: p.stars } })

      const entry: HistoryEntry = { id: uuid(), savedAt, teams, playerSnapshot: snapshot }
      const history = [entry, ...state.history]
      saveLastSession(teams)
      saveHistory(history)
      if (state.isLoggedIn) pushSession(entry).catch(() => {})
      return { ...state, lastTeams: teams, lastTeamsSavedAt: savedAt, history, resultOpen: true }
    }

    case 'OPEN_RESULT':  return { ...state, resultOpen: true }
    case 'CLOSE_RESULT': return { ...state, resultOpen: false, formationOpen: false, exportOpen: false }
    case 'OPEN_FORMATION':  return { ...state, formationOpen: true }
    case 'CLOSE_FORMATION': return { ...state, formationOpen: false }
    case 'OPEN_EXPORT':  return { ...state, exportOpen: true }
    case 'CLOSE_EXPORT': return { ...state, exportOpen: false }

    case 'OPEN_EDITOR':
      return { ...state, playerEditorOpen: true, editingPlayer: action.player ?? null }
    case 'CLOSE_EDITOR':
      return { ...state, playerEditorOpen: false, editingPlayer: null }

    case 'SAVE_PLAYER': {
      const exists = state.players.find(p => p.id === action.player.id)
      const players = exists
        ? state.players.map(p => p.id === action.player.id ? action.player : p)
        : [...state.players, action.player]
      savePlayers(players)
      const presentIds = exists
        ? state.session.presentIds
        : [...state.session.presentIds, action.player.id]
      const session = { ...state.session, presentIds }
      saveSession(session)
      if (state.isLoggedIn) pushPlayer(action.player).catch(() => {})
      return { ...state, players, session, playerEditorOpen: false, editingPlayer: null }
    }

    case 'DELETE_PLAYER': {
      const players = state.players.filter(p => p.id !== action.id)
      const presentIds = state.session.presentIds.filter(id => id !== action.id)
      const session = { ...state.session, presentIds }
      savePlayers(players)
      saveSession(session)
      if (state.isLoggedIn) deletePlayer(action.id).catch(() => {})
      return { ...state, players, session }
    }

    case 'SELECT_HISTORY':
      return { ...state, selectedHistoryId: action.id }

    case 'DELETE_HISTORY': {
      const history = state.history.filter(e => e.id !== action.id)
      saveHistory(history)
      if (state.isLoggedIn) deleteSession(action.id).catch(() => {})
      const selectedHistoryId = state.selectedHistoryId === action.id ? null : state.selectedHistoryId
      return { ...state, history, selectedHistoryId }
    }

    case 'CLEAR_HISTORY': {
      saveHistory([])
      return { ...state, history: [], selectedHistoryId: null }
    }

    case 'ADD_BUDGET': {
      const budget = [action.entry, ...state.budget]
      saveBudget(budget)
      if (state.isLoggedIn) pushBudgetEntry(action.entry).catch(() => {})
      return { ...state, budget, budgetEditorOpen: false, editingBudget: null }
    }

    case 'UPDATE_BUDGET': {
      const budget = state.budget.map(e => e.id === action.entry.id ? action.entry : e)
      saveBudget(budget)
      if (state.isLoggedIn) pushBudgetEntry(action.entry).catch(() => {})
      return { ...state, budget, budgetEditorOpen: false, editingBudget: null }
    }

    case 'DELETE_BUDGET': {
      const budget = state.budget.filter(e => e.id !== action.id)
      saveBudget(budget)
      if (state.isLoggedIn) deleteBudgetEntry(action.id).catch(() => {})
      return { ...state, budget, budgetEditorOpen: false, editingBudget: null }
    }

    case 'OPEN_BUDGET_EDITOR':
      return { ...state, budgetEditorOpen: true, editingBudget: action.entry ?? null }
    case 'CLOSE_BUDGET_EDITOR':
      return { ...state, budgetEditorOpen: false, editingBudget: null }
    case 'OPEN_BUDGET_EXPORT':
      return { ...state, budgetExportOpen: true, exportingBudget: action.entry }
    case 'CLOSE_BUDGET_EXPORT':
      return { ...state, budgetExportOpen: false, exportingBudget: null }
    case 'SET_LOGGED_IN': {
      const adminEmails = (import.meta.env.VITE_ADMIN_EMAILS ?? '').split(',').map((e: string) => e.trim().toLowerCase())
      const isAdmin = action.value && !!action.email && adminEmails.includes(action.email.toLowerCase())
      return { ...state, isLoggedIn: action.value, isAdmin }
    }
    case 'SET_AUTH_LOADING':
      return { ...state, authLoading: action.value }

    case 'SYNC_COMPLETE': {
      savePlayers(action.players)
      saveBudget(action.budget)
      saveHistory(action.history)
      return { ...state, players: action.players, budget: action.budget, history: action.history }
    }

    default: return state
  }
}

interface Ctx {
  state: AppState
  dispatch: React.Dispatch<Action>
}

const AppCtx = createContext<Ctx>(null!)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitialState)

  useEffect(() => {
    getSession().then(async session => {
      if (session) {
        dispatch({ type: 'SET_LOGGED_IN', value: true, email: session.user.email })
        try {
          const [players, budget, history] = await Promise.all([
            syncPlayers(state.players),
            syncBudget(state.budget),
            syncSessions(state.history),
          ])
          dispatch({ type: 'SYNC_COMPLETE', players, budget, history })
        } catch {}
      }
      dispatch({ type: 'SET_AUTH_LOADING', value: false })
    })
  }, [])

  return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>
}

export function useApp() { return useContext(AppCtx) }
