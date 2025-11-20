/**
 * Utilities for Pool Stage + Knockout Playoff tournaments
 */

export interface PoolGroup {
  name: string // 'A', 'B', 'C', 'D'
  teamIds: string[]
}

export interface PlayoffMatch {
  stage: 'quarterfinal' | 'semifinal' | 'final' | 'third_place'
  bracketPosition: number
  team1Seed?: string // e.g., "Pool A Winner", "QF1 Winner"
  team2Seed?: string
  team1Id?: string // Actual team ID when known
  team2Id?: string
}

/**
 * Divide teams into pools for pool stage
 * Tries to create equal-sized pools
 */
export function createPoolGroups(teamIds: string[], numPools: number = 4): PoolGroup[] {
  const poolNames = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
  const teamsPerPool = Math.ceil(teamIds.length / numPools)

  const pools: PoolGroup[] = []

  for (let i = 0; i < numPools; i++) {
    const start = i * teamsPerPool
    const end = Math.min(start + teamsPerPool, teamIds.length)
    const poolTeams = teamIds.slice(start, end)

    if (poolTeams.length > 0) {
      pools.push({
        name: poolNames[i],
        teamIds: poolTeams
      })
    }
  }

  return pools
}

/**
 * Determine playoff format based on number of teams
 */
export function determinePlayoffFormat(numTeams: number): {
  numPools: number
  teamsPerPool: number
  teamsQualify: number
  playoffStages: string[]
} {
  // 8 teams: 2 pools of 4, top 2 qualify = 4 teams → Semis + Final
  if (numTeams === 8) {
    return {
      numPools: 2,
      teamsPerPool: 4,
      teamsQualify: 2, // Top 2 from each pool
      playoffStages: ['semifinal', 'final', 'third_place']
    }
  }

  // 12 teams: 3 pools of 4, top 2 + 2 best 3rd = 8 teams → Quarters + Semis + Final
  if (numTeams >= 12 && numTeams <= 16) {
    return {
      numPools: 4,
      teamsPerPool: Math.ceil(numTeams / 4),
      teamsQualify: 2, // Top 2 from each pool = 8 teams
      playoffStages: ['quarterfinal', 'semifinal', 'final', 'third_place']
    }
  }

  // 6 teams: 2 pools of 3, top 2 qualify = 4 teams → Semis + Final
  if (numTeams >= 6) {
    return {
      numPools: 2,
      teamsPerPool: Math.ceil(numTeams / 2),
      teamsQualify: 2,
      playoffStages: ['semifinal', 'final', 'third_place']
    }
  }

  // 4 teams: Direct semis
  return {
    numPools: 0,
    teamsPerPool: 0,
    teamsQualify: 4,
    playoffStages: ['semifinal', 'final', 'third_place']
  }
}

/**
 * Generate playoff bracket structure
 */
export function generatePlayoffBracket(playoffStages: string[]): PlayoffMatch[] {
  const matches: PlayoffMatch[] = []

  if (playoffStages.includes('quarterfinal')) {
    // 8 teams → 4 quarterfinals
    matches.push(
      { stage: 'quarterfinal', bracketPosition: 1, team1Seed: 'Pool A 1st', team2Seed: 'Pool D 2nd' },
      { stage: 'quarterfinal', bracketPosition: 2, team1Seed: 'Pool C 1st', team2Seed: 'Pool B 2nd' },
      { stage: 'quarterfinal', bracketPosition: 3, team1Seed: 'Pool B 1st', team2Seed: 'Pool C 2nd' },
      { stage: 'quarterfinal', bracketPosition: 4, team1Seed: 'Pool D 1st', team2Seed: 'Pool A 2nd' }
    )
  }

  if (playoffStages.includes('semifinal')) {
    if (playoffStages.includes('quarterfinal')) {
      // After quarters
      matches.push(
        { stage: 'semifinal', bracketPosition: 1, team1Seed: 'QF1 Winner', team2Seed: 'QF2 Winner' },
        { stage: 'semifinal', bracketPosition: 2, team1Seed: 'QF3 Winner', team2Seed: 'QF4 Winner' }
      )
    } else {
      // Direct from pools
      matches.push(
        { stage: 'semifinal', bracketPosition: 1, team1Seed: 'Pool A 1st', team2Seed: 'Pool B 2nd' },
        { stage: 'semifinal', bracketPosition: 2, team1Seed: 'Pool B 1st', team2Seed: 'Pool A 2nd' }
      )
    }
  }

  if (playoffStages.includes('third_place')) {
    matches.push(
      { stage: 'third_place', bracketPosition: 1, team1Seed: 'SF1 Loser', team2Seed: 'SF2 Loser' }
    )
  }

  if (playoffStages.includes('final')) {
    matches.push(
      { stage: 'final', bracketPosition: 1, team1Seed: 'SF1 Winner', team2Seed: 'SF2 Winner' }
    )
  }

  return matches
}

/**
 * Get display name for playoff stage
 */
export function getStageDisplayName(stage: string): string {
  const names: Record<string, string> = {
    pool: 'Pool Stage',
    quarterfinal: 'Quarter Finals',
    semifinal: 'Semi Finals',
    third_place: '3rd Place Playoff',
    final: 'Final'
  }
  return names[stage] || stage
}
