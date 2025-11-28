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
 * Generate round-robin schedule for teams using the circle method
 * This ensures optimal distribution where each team plays exactly once per round
 * and all available tables are used when possible
 */
export function generateRoundRobinSchedule(
  teamIds: string[],
  numTables: number
): Array<Array<{ team1Id: string; team2Id: string; tableNumber: number }>> {
  const numTeams = teamIds.length;

  if (numTeams < 2) {
    throw new Error('At least 2 teams are required');
  }

  // Shuffle teams first for randomization
  const shuffledTeams = shuffleArray([...teamIds]);

  // Use circle method for round-robin scheduling
  // This guarantees each team plays exactly once per round
  const teams = [...shuffledTeams];

  // If odd number of teams, add a "bye" placeholder
  const hasBye = teams.length % 2 !== 0;
  if (hasBye) {
    teams.push('BYE');
  }

  const n = teams.length;
  const totalRounds = n - 1; // Each team plays n-1 rounds in full round-robin
  const matchesPerRound = Math.floor(n / 2); // n/2 matches per round

  // Generate all rounds using circle method
  const allRounds: Array<Array<{ team1Id: string; team2Id: string }>> = [];

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches: Array<{ team1Id: string; team2Id: string }> = [];

    for (let i = 0; i < matchesPerRound; i++) {
      const home = (round + i) % (n - 1);
      let away = (n - 1 - i + round) % (n - 1);

      // Last team stays fixed, others rotate
      if (i === 0) {
        away = n - 1;
      }

      const team1 = teams[home];
      const team2 = teams[away];

      // Skip bye matches
      if (team1 !== 'BYE' && team2 !== 'BYE') {
        roundMatches.push({ team1Id: team1, team2Id: team2 });
      }
    }

    if (roundMatches.length > 0) {
      allRounds.push(roundMatches);
    }
  }

  // Now distribute matches across tables, respecting numTables limit
  // If we have fewer tables than matches per round, we need to split rounds
  const finalRounds: Array<Array<{ team1Id: string; team2Id: string; tableNumber: number }>> = [];

  for (const roundMatches of allRounds) {
    // If all matches fit on available tables, keep as one round
    if (roundMatches.length <= numTables) {
      finalRounds.push(
        roundMatches.map((match, idx) => ({
          ...match,
          tableNumber: idx + 1,
        }))
      );
    } else {
      // Split into multiple sub-rounds based on table capacity
      for (let i = 0; i < roundMatches.length; i += numTables) {
        const subRoundMatches = roundMatches.slice(i, i + numTables);
        finalRounds.push(
          subRoundMatches.map((match, idx) => ({
            ...match,
            tableNumber: idx + 1,
          }))
        );
      }
    }
  }

  return finalRounds;
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
