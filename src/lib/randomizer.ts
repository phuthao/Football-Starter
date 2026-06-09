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
  const G    = shuffle(present.filter(p => p.isGoalkeeper))
  const K2   = shuffle(present.filter(p => !p.isGoalkeeper && p.stars === 2))
  // 1-star and 0-star are pooled together and distributed randomly
  const rest = shuffle(present.filter(p => !p.isGoalkeeper && p.stars < 2))

  const buckets: string[][] = Array.from({ length: T }, () => [])

  // Round-robin GKs
  G.forEach((p, i) => buckets[i % T].push(p.id))

  // 2-star: strict 1-per-team round-robin (guaranteed separate teams when K2.length <= T)
  const offset = G.length
  K2.forEach((p, i) => buckets[(offset + i) % T].push(p.id))

  // Rest (stars < 2): random fill onto smallest team
  for (const p of rest) buckets[smallestTeamIdx(buckets)].push(p.id)

  const labels = ['A', 'B', 'C'] as const
  return buckets.map((ids, i) => {
    const players = ids.map(id => present.find(p => p.id === id)!)
    return {
      label: labels[i],
      playerIds: ids,
      counts: {
        total: ids.length,
        gk: players.filter(p => p?.isGoalkeeper).length,
        stars: players.reduce((sum, p) => sum + (p?.isGoalkeeper ? 0 : (p?.stars ?? 0)), 0),
      }
    }
  })
}

export function suggestTeamCount(n: number): 2 | 3 {
  return n >= 17 ? 3 : 2
}
