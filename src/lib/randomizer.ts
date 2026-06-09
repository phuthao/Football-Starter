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

// Pick team with lowest total stars; break ties by smallest size
function lowestStarTeamIdx(teams: string[][], starCounts: number[]): number {
  let idx = 0
  for (let i = 1; i < teams.length; i++) {
    if (
      starCounts[i] < starCounts[idx] ||
      (starCounts[i] === starCounts[idx] && teams[i].length < teams[idx].length)
    ) idx = i
  }
  return idx
}

export function generateTeams(present: Player[], T: 2 | 3): Team[] {
  const G  = shuffle(present.filter(p => p.isGoalkeeper))
  const K2 = shuffle(present.filter(p => !p.isGoalkeeper && p.stars === 2))
  const K1 = shuffle(present.filter(p => !p.isGoalkeeper && p.stars === 1))
  const O  = shuffle(present.filter(p => !p.isGoalkeeper && p.stars === 0))

  const buckets: string[][] = Array.from({ length: T }, () => [])

  // Round-robin GKs
  G.forEach((p, i) => buckets[i % T].push(p.id))

  // 2-star: round-robin from a random start — even split when possible,
  // random assignment of the extra slot when count is odd
  const k2Start = Math.floor(Math.random() * T)
  K2.forEach((p, i) => buckets[(k2Start + i) % T].push(p.id))

  // Track star totals per bucket (GKs don't count)
  const starCounts = buckets.map(ids =>
    ids.reduce((sum, id) => {
      const p = present.find(pl => pl.id === id)!
      return sum + (p?.isGoalkeeper ? 0 : (p?.stars ?? 0))
    }, 0)
  )

  // 1-star: assign to team with lowest star total to compensate for any K2 imbalance
  for (const p of K1) {
    const idx = lowestStarTeamIdx(buckets, starCounts)
    buckets[idx].push(p.id)
    starCounts[idx] += 1
  }

  // 0-star: just fill smallest team (no star contribution either way)
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
        stars: players.reduce((sum, p) => sum + (p?.isGoalkeeper ? 0 : (p?.stars ?? 0)), 0),
      }
    }
  })
}

export function suggestTeamCount(n: number): 2 | 3 {
  return n >= 17 ? 3 : 2
}
