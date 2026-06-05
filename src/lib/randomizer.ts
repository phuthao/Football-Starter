import type { Player, Team } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function smallestTeamIdx(teams: string[][]): number {
  let idx = 0
  for (let i = 1; i < teams.length; i++) {
    if (teams[i].length < teams[idx].length) idx = i
  }
  return idx
}

export function generateTeams(present: Player[], T: 2 | 3): Team[] {
  const G = shuffle(present.filter(p => p.isGoalkeeper))
  const K = shuffle(present.filter(p => p.isKey && !p.isGoalkeeper))
  const O = shuffle(present.filter(p => !p.isGoalkeeper && !p.isKey))

  const buckets: string[][] = Array.from({ length: T }, () => [])

  // Round-robin GKs
  G.forEach((p, i) => buckets[i % T].push(p.id))
  // Round-robin key players (continuing rotation index)
  K.forEach((p, i) => buckets[(G.length + i) % T].push(p.id))
  // Fill onto smallest team
  for (const p of O) buckets[smallestTeamIdx(buckets)].push(p.id)

  const labels = ['A', 'B', 'C'] as const
  return buckets.map((ids, i) => {
    const players = ids.map(id => present.find(p => p.id === id)!)
    return {
      label: labels[i],
      playerIds: ids,
      counts: {
        total: ids.length,
        gk: players.filter(p => p?.isGoalkeeper).length,
        key: players.filter(p => p?.isKey && !p?.isGoalkeeper).length,
      }
    }
  })
}

export function suggestTeamCount(n: number): 2 | 3 {
  return n >= 17 ? 3 : 2
}
