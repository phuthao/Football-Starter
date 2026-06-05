import React, { createContext, useContext, useReducer } from 'react'
import type { AppState, HistoryEntry, Player, Session, Team } from '../types'
import { loadPlayers, savePlayers, loadSession, saveSession, loadLastSession, saveLastSession, loadHistory, saveHistory } from '../lib/storage'
import { SEED_PLAYERS } from '../lib/seedData'
import { generateTeams, suggestTeamCount } from '../lib/randomizer'
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
    selectedHistoryId: null,
    view: 'today',
    resultOpen: false,
    formationOpen: false,
    exportOpen: false,
    playerEditorOpen: false,
    editingPlayer: null,
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

      // Build player snapshot for this session (names may change later)
      const snapshot: HistoryEntry['playerSnapshot'] = {}
      present.forEach(p => { snapshot[p.id] = { name: p.name, isGoalkeeper: p.isGoalkeeper, isKey: p.isKey } })

      const entry: HistoryEntry = { id: uuid(), savedAt, teams, playerSnapshot: snapshot }
      const history = [entry, ...state.history]
      saveLastSession(teams)
      saveHistory(history)
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
      return { ...state, players, session, playerEditorOpen: false, editingPlayer: null }
    }

    case 'DELETE_PLAYER': {
      const players = state.players.filter(p => p.id !== action.id)
      const presentIds = state.session.presentIds.filter(id => id !== action.id)
      const session = { ...state.session, presentIds }
      savePlayers(players)
      saveSession(session)
      return { ...state, players, session }
    }

    case 'SELECT_HISTORY':
      return { ...state, selectedHistoryId: action.id }

    case 'DELETE_HISTORY': {
      const history = state.history.filter(e => e.id !== action.id)
      saveHistory(history)
      const selectedHistoryId = state.selectedHistoryId === action.id ? null : state.selectedHistoryId
      return { ...state, history, selectedHistoryId }
    }

    case 'CLEAR_HISTORY': {
      saveHistory([])
      return { ...state, history: [], selectedHistoryId: null }
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
  return <AppCtx.Provider value={{ state, dispatch }}>{children}</AppCtx.Provider>
}

export function useApp() { return useContext(AppCtx) }
