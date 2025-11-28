/**
 * Shuffle an array using Fisher-Yates algorithm
 */
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Create randomized teams from a list of players
 */
export function createRandomizedTeams(playerNames: string[]): Array<{ player1: string; player2: string }> {
  if (playerNames.length < 2) {
    throw new Error('At least 2 players are required');
  }

  if (playerNames.length % 2 !== 0) {
    throw new Error('Number of players must be even to create pairs');
  }

  const shuffled = shuffleArray(playerNames);
  const teams: Array<{ player1: string; player2: string }> = [];

  for (let i = 0; i < shuffled.length; i += 2) {
    teams.push({
      player1: shuffled[i],
      player2: shuffled[i + 1],
    });
  }

  return teams;
}

/**
 * Generate round-robin schedule for teams
 * Each round fills up to numTables matches, ensuring no team plays more than once per round
 * Returns array of rounds, where each round contains matches for available tables
 */
export function generateRoundRobinSchedule(
  teamIds: string[],
  numTables: number
): Array<Array<{ team1Id: string; team2Id: string; tableNumber: number }>> {
  const numTeams = teamIds.length;

  if (numTeams < 2) {
    throw new Error('At least 2 teams are required');
  }

  // Generate all possible matches (full round-robin)
  const allMatches: Array<{ team1Id: string; team2Id: string }> = [];
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      allMatches.push({
        team1Id: teamIds[i],
        team2Id: teamIds[j],
      });
    }
  }

  // Shuffle matches to randomize the order
  const remainingMatches = shuffleArray(allMatches);

  // Distribute matches into rounds, ensuring no team plays more than once per round
  const rounds: Array<Array<{ team1Id: string; team2Id: string; tableNumber: number }>> = [];

  while (remainingMatches.length > 0) {
    const roundMatches: Array<{ team1Id: string; team2Id: string; tableNumber: number }> = [];
    const teamsPlayingThisRound = new Set<string>();
    const matchesUsedIndices: number[] = [];

    // Try to fill tables for this round
    for (let i = 0; i < remainingMatches.length && roundMatches.length < numTables; i++) {
      const match = remainingMatches[i];

      // Check if either team is already playing in this round
      if (!teamsPlayingThisRound.has(match.team1Id) && !teamsPlayingThisRound.has(match.team2Id)) {
        // Add match to this round
        roundMatches.push({
          ...match,
          tableNumber: roundMatches.length + 1,
        });
        teamsPlayingThisRound.add(match.team1Id);
        teamsPlayingThisRound.add(match.team2Id);
        matchesUsedIndices.push(i);
      }
    }

    // Remove used matches from remaining (in reverse order to preserve indices)
    for (let i = matchesUsedIndices.length - 1; i >= 0; i--) {
      remainingMatches.splice(matchesUsedIndices[i], 1);
    }

    if (roundMatches.length > 0) {
      rounds.push(roundMatches);
    }
  }

  return rounds;
}

/**
 * Calculate total number of matches in a round-robin tournament
 */
export function calculateTotalMatches(numTeams: number): number {
  return (numTeams * (numTeams - 1)) / 2;
}

/**
 * Calculate number of rounds needed for full round-robin
 */
export function calculateTotalRounds(numTeams: number): number {
  return numTeams % 2 === 0 ? numTeams - 1 : numTeams;
}

/**
 * Get recommended number of rounds based on players and tables
 * Rounds are calculated based on filling all tables each round
 */
export function getRecommendedRounds(numPlayers: number, numTables: number): {
  recommended: number
  min: number
  max: number
  explanation: string
} {
  const numTeams = Math.floor(numPlayers / 2)
  const totalMatches = calculateTotalMatches(numTeams)

  // Calculate rounds needed to complete all matches with given tables
  const roundsNeeded = Math.ceil(totalMatches / numTables)

  // Recommended: Full round-robin (all teams play each other once)
  const recommended = roundsNeeded

  // Minimum: At least enough rounds to have meaningful results
  const min = Math.max(2, Math.ceil(roundsNeeded / 2))

  // Maximum: Full round-robin
  const max = roundsNeeded

  let explanation = `With ${numTeams} teams and ${numTables} table${numTables > 1 ? 's' : ''}: `
  explanation += `${totalMatches} total matches across ${roundsNeeded} rounds. `
  explanation += `Each round uses all ${numTables} table${numTables > 1 ? 's' : ''}.`

  return {
    recommended,
    min,
    max,
    explanation
  }
}
