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
