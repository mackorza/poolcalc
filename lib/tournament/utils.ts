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
 * Returns array of rounds, where each round contains matches
 */
export function generateRoundRobinSchedule(
  teamIds: string[],
  numTables: number
): Array<Array<{ team1Id: string; team2Id: string; tableNumber: number }>> {
  const numTeams = teamIds.length;

  if (numTeams < 2) {
    throw new Error('At least 2 teams are required');
  }

  const rounds: Array<Array<{ team1Id: string; team2Id: string; tableNumber: number }>> = [];
  const teams = [...teamIds];

  // If odd number of teams, add a "bye" team
  if (teams.length % 2 !== 0) {
    teams.push('BYE');
  }

  const n = teams.length;
  const totalRounds = n - 1;
  const matchesPerRound = n / 2;

  for (let round = 0; round < totalRounds; round++) {
    const roundMatches: Array<{ team1Id: string; team2Id: string; tableNumber: number }> = [];
    let tableNumber = 1;

    for (let match = 0; match < matchesPerRound; match++) {
      const home = (round + match) % (n - 1);
      const away = (n - 1 - match + round) % (n - 1);

      // Last team stays in place, others rotate
      const team1 = match === 0 ? teams[n - 1] : teams[home];
      const team2 = teams[away];

      // Skip matches with BYE team
      if (team1 !== 'BYE' && team2 !== 'BYE') {
        roundMatches.push({
          team1Id: team1,
          team2Id: team2,
          tableNumber: ((tableNumber - 1) % numTables) + 1,
        });
        tableNumber++;
      }
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
 * Returns recommendation for getting a clear winner
 */
export function getRecommendedRounds(numPlayers: number, numTables: number): {
  recommended: number
  min: number
  max: number
  explanation: string
} {
  const numTeams = Math.floor(numPlayers / 2)
  const fullRoundRobin = calculateTotalRounds(numTeams)
  const totalMatches = calculateTotalMatches(numTeams)

  // Calculate how many matches can be played per round with available tables
  const matchesPerRound = Math.min(Math.floor(numTeams / 2), numTables)

  // For a clear winner, we want every team to play every other team
  // This is a full round-robin tournament
  const recommended = fullRoundRobin

  // Minimum: At least half of full round-robin to get meaningful results
  const min = Math.max(3, Math.ceil(fullRoundRobin / 2))

  // Maximum: Full round-robin
  const max = fullRoundRobin

  let explanation = `Full round-robin: ${fullRoundRobin} rounds (${totalMatches} total matches). `
  explanation += `Each team plays every other team once, ensuring a fair winner. `

  if (matchesPerRound < Math.floor(numTeams / 2)) {
    const roundsNeeded = Math.ceil(totalMatches / matchesPerRound)
    explanation += `With ${numTables} table${numTables > 1 ? 's' : ''}, this will take approximately ${roundsNeeded} rounds to complete all matches.`
  }

  return {
    recommended,
    min,
    max,
    explanation
  }
}
