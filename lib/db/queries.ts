import { db } from '@/lib/db'
import { tournaments, teams, matches } from './schema'
import { eq, desc, asc } from 'drizzle-orm'

export async function getAllTournaments() {
  return db.query.tournaments.findMany({
    orderBy: [desc(tournaments.tournament_date)],
  })
}

export async function getTournamentById(id: string) {
  return db.query.tournaments.findFirst({
    where: eq(tournaments.id, id),
  })
}

export async function getTeamsByTournamentId(tournamentId: string) {
  return db.query.teams.findMany({
    where: eq(teams.tournament_id, tournamentId),
    orderBy: [desc(teams.points)],
  })
}

export async function getMatchesByTournamentId(tournamentId: string) {
  return db.query.matches.findMany({
    where: eq(matches.tournament_id, tournamentId),
    orderBy: [asc(matches.round_number), asc(matches.table_number)],
    with: {
      team1: true,
      team2: true,
      winner: true,
    },
  })
}
