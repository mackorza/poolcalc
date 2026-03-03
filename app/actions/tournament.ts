'use server'

import { db } from '@/lib/db'
import { tournaments, teams, matches } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { createRandomizedTeams, generateRoundRobinSchedule } from '@/lib/tournament/utils'
import { createPoolGroups, determinePlayoffFormat, generatePlayoffBracket } from '@/lib/tournament/playoff-utils'
import { revalidatePath } from 'next/cache'
import { emitTournamentEvent } from '@/lib/sse/emitter'
import { getSession } from '@/lib/auth'
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js'
import type * as schema from '@/lib/db/schema'

type DbOrTx = PostgresJsDatabase<typeof schema>

// Shared helper: generates teams and matches for a tournament
async function generateTeamsAndMatches(
  tx: DbOrTx,
  tournamentId: string,
  playerNames: string[],
  numTables: number,
  tournamentFormat: 'round_robin' | 'pool_playoff'
): Promise<{ numRounds: number }> {
  const teamPairs = createRandomizedTeams(playerNames)
  const numTeams = teamPairs.length

  if (tournamentFormat === 'pool_playoff') {
    const playoffFormat = determinePlayoffFormat(numTeams)

    const poolIndices = Array.from({ length: numTeams }, (_, i) => i)
    const pools = createPoolGroups(poolIndices.map(String), playoffFormat.numPools)

    const teamsToInsert = teamPairs.map((pair, index) => {
      const poolIndex = Math.floor(index / playoffFormat.teamsPerPool)
      return {
        tournament_id: tournamentId,
        player1_name: pair.player1,
        player2_name: pair.player2,
        pool_group: pools[poolIndex]?.name || null,
      }
    })

    const insertedTeams = await tx.insert(teams).values(teamsToInsert).returning()

    const matchesToCreate: Array<{
      tournament_id: string
      round_number: number
      table_number: number
      team1_id: string
      team2_id: string
      stage: 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place' | 'tiebreaker'
      bracket_position: number | null
    }> = []

    let maxRound = 0
    for (const pool of pools) {
      const poolTeamIds = insertedTeams
        .filter(t => t.pool_group === pool.name)
        .map(t => t.id)

      if (poolTeamIds.length > 1) {
        const poolSchedule = generateRoundRobinSchedule(poolTeamIds, numTables)

        for (let roundIndex = 0; roundIndex < poolSchedule.length; roundIndex++) {
          if (roundIndex + 1 > maxRound) maxRound = roundIndex + 1
          for (const match of poolSchedule[roundIndex]) {
            matchesToCreate.push({
              tournament_id: tournamentId,
              round_number: roundIndex + 1,
              table_number: match.tableNumber,
              team1_id: match.team1Id,
              team2_id: match.team2Id,
              stage: 'pool',
              bracket_position: null,
            })
          }
        }
      }
    }

    const playoffBracket = generatePlayoffBracket(playoffFormat.playoffStages)
    for (const playoffMatch of playoffBracket) {
      matchesToCreate.push({
        tournament_id: tournamentId,
        round_number: 999,
        table_number: 1,
        team1_id: insertedTeams[0].id,
        team2_id: insertedTeams[1].id,
        stage: playoffMatch.stage,
        bracket_position: playoffMatch.bracketPosition,
      })
    }

    await tx.insert(matches).values(matchesToCreate)
    return { numRounds: maxRound }

  } else {
    const insertedTeams = await tx.insert(teams).values(
      teamPairs.map((pair) => ({
        tournament_id: tournamentId,
        player1_name: pair.player1,
        player2_name: pair.player2,
        pool_group: null,
      }))
    ).returning()

    const teamIds = insertedTeams.map((team) => team.id)
    const schedule = generateRoundRobinSchedule(teamIds, numTables)

    const matchesToCreate: Array<{
      tournament_id: string
      round_number: number
      table_number: number
      team1_id: string
      team2_id: string
      stage: 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place' | 'tiebreaker'
      bracket_position: number | null
    }> = []

    for (let roundIndex = 0; roundIndex < schedule.length; roundIndex++) {
      const round = schedule[roundIndex]
      for (const match of round) {
        matchesToCreate.push({
          tournament_id: tournamentId,
          round_number: roundIndex + 1,
          table_number: match.tableNumber,
          team1_id: match.team1Id,
          team2_id: match.team2Id,
          stage: 'pool',
          bracket_position: null,
        })
      }
    }

    await tx.insert(matches).values(matchesToCreate)
    return { numRounds: schedule.length }
  }
}

export interface CreateTournamentData {
  venueName: string
  venueLocation?: string
  tournamentDate: string
  startTime?: string
  numTables: number
  numRounds: number
  playerNames: string[]
  tournamentFormat: 'round_robin' | 'pool_playoff'
}

export async function createTournament(data: CreateTournamentData) {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    if (data.playerNames.length < 2) {
      return { error: 'At least 2 players are required' }
    }

    if (data.playerNames.length % 2 !== 0) {
      return { error: 'Number of players must be even' }
    }

    const [tournament] = await db.insert(tournaments).values({
      venue_name: data.venueName,
      venue_location: data.venueLocation,
      tournament_date: data.tournamentDate,
      start_time: data.startTime,
      num_tables: data.numTables,
      num_rounds: data.numRounds,
      num_players: data.playerNames.length,
      status: 'setup',
      tournament_format: data.tournamentFormat,
    }).returning()

    if (!tournament) {
      return { error: 'Failed to create tournament' }
    }

    const { numRounds } = await generateTeamsAndMatches(
      db, tournament.id, data.playerNames, data.numTables, data.tournamentFormat
    )

    // Update num_rounds to match actual schedule length
    if (numRounds !== data.numRounds) {
      await db.update(tournaments)
        .set({ num_rounds: numRounds })
        .where(eq(tournaments.id, tournament.id))
    }

    revalidatePath('/admin')
    revalidatePath('/tournaments')
    revalidatePath(`/tournament/${tournament.id}`)
    emitTournamentEvent(tournament.id, 'tournament_created')

    return { success: true, tournamentId: tournament.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export interface UpdateTournamentData {
  tournamentId: string
  venueName: string
  venueLocation?: string
  tournamentDate: string
  startTime?: string
  numTables: number
  numRounds: number
  playerNames: string[]
  tournamentFormat: 'round_robin' | 'pool_playoff'
}

export async function updateTournament(data: UpdateTournamentData) {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    if (data.playerNames.length < 2) {
      return { error: 'At least 2 players are required' }
    }

    if (data.playerNames.length % 2 !== 0) {
      return { error: 'Number of players must be even' }
    }

    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, data.tournamentId),
    })

    if (!tournament) {
      return { error: 'Tournament not found' }
    }

    if (tournament.status !== 'setup') {
      return { error: 'Tournament can only be edited during setup' }
    }

    // Fetch current teams to compare
    const currentTeams = await db.query.teams.findMany({
      where: eq(teams.tournament_id, data.tournamentId),
      orderBy: (teams, { asc }) => [asc(teams.created_at)],
    })
    const currentPlayerCount = currentTeams.length * 2

    const playerCountChanged = data.playerNames.length !== currentPlayerCount
    const formatChanged = data.tournamentFormat !== tournament.tournament_format
    const tablesChanged = data.numTables !== tournament.num_tables
    const needsMatchRegeneration = playerCountChanged || formatChanged || tablesChanged

    // Update tournament metadata
    await db.update(tournaments)
      .set({
        venue_name: data.venueName,
        venue_location: data.venueLocation,
        tournament_date: data.tournamentDate,
        start_time: data.startTime,
        num_tables: data.numTables,
        num_players: data.playerNames.length,
        tournament_format: data.tournamentFormat,
        updated_at: new Date(),
      })
      .where(eq(tournaments.id, data.tournamentId))

    if (needsMatchRegeneration) {
      // Full rebuild: delete matches and teams, re-create
      await db.transaction(async (tx) => {
        await tx.delete(matches).where(eq(matches.tournament_id, data.tournamentId))
        await tx.delete(teams).where(eq(teams.tournament_id, data.tournamentId))

        const { numRounds } = await generateTeamsAndMatches(
          tx, data.tournamentId, data.playerNames, data.numTables, data.tournamentFormat
        )

        await tx.update(tournaments)
          .set({ num_rounds: numRounds })
          .where(eq(tournaments.id, data.tournamentId))
      })
    } else {
      // Name-only update: update team records in place
      for (let i = 0; i < currentTeams.length; i++) {
        const player1 = data.playerNames[i * 2]
        const player2 = data.playerNames[i * 2 + 1]

        if (currentTeams[i].player1_name !== player1 || currentTeams[i].player2_name !== player2) {
          await db.update(teams)
            .set({ player1_name: player1, player2_name: player2 })
            .where(eq(teams.id, currentTeams[i].id))
        }
      }
    }

    revalidatePath(`/tournament/${data.tournamentId}`)
    revalidatePath(`/tournament/${data.tournamentId}/admin`)
    revalidatePath(`/tournament/${data.tournamentId}/edit`)
    revalidatePath('/tournaments')
    emitTournamentEvent(data.tournamentId, 'tournament_updated')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateMatchWinner(matchId: string, winnerId: string) {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    const existingMatch = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
    })

    if (!existingMatch) {
      return { error: 'Failed to fetch match' }
    }

    await db.transaction(async (tx) => {
      await tx.update(matches)
        .set({ winner_id: winnerId, completed_at: new Date() })
        .where(eq(matches.id, matchId))

      const loserId = existingMatch.team1_id === winnerId
        ? existingMatch.team2_id
        : existingMatch.team1_id

      if (existingMatch.winner_id) {
        const oldLoserId = existingMatch.team1_id === existingMatch.winner_id
          ? existingMatch.team2_id
          : existingMatch.team1_id

        await tx.update(teams)
          .set({
            points: sql`${teams.points} - 2`,
            wins: sql`${teams.wins} - 1`,
          })
          .where(eq(teams.id, existingMatch.winner_id))

        await tx.update(teams)
          .set({
            losses: sql`${teams.losses} - 1`,
          })
          .where(eq(teams.id, oldLoserId))
      }

      await tx.update(teams)
        .set({
          points: sql`${teams.points} + 2`,
          wins: sql`${teams.wins} + 1`,
        })
        .where(eq(teams.id, winnerId))

      await tx.update(teams)
        .set({
          losses: sql`${teams.losses} + 1`,
        })
        .where(eq(teams.id, loserId))
    })

    revalidatePath(`/tournament/${existingMatch.tournament_id}`)
    revalidatePath(`/tournament/${existingMatch.tournament_id}/admin`)
    emitTournamentEvent(existingMatch.tournament_id, 'match_updated')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function clearMatchWinner(matchId: string) {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    const existingMatch = await db.query.matches.findFirst({
      where: eq(matches.id, matchId),
    })

    if (!existingMatch) {
      return { error: 'Match not found' }
    }

    if (!existingMatch.winner_id) {
      return { error: 'Match has no winner to clear' }
    }

    const loserId = existingMatch.team1_id === existingMatch.winner_id
      ? existingMatch.team2_id
      : existingMatch.team1_id

    await db.transaction(async (tx) => {
      await tx.update(teams)
        .set({
          points: sql`${teams.points} - 2`,
          wins: sql`${teams.wins} - 1`,
        })
        .where(eq(teams.id, existingMatch.winner_id!))

      await tx.update(teams)
        .set({
          losses: sql`${teams.losses} - 1`,
        })
        .where(eq(teams.id, loserId))

      await tx.update(matches)
        .set({ winner_id: null, completed_at: null })
        .where(eq(matches.id, matchId))
    })

    revalidatePath(`/tournament/${existingMatch.tournament_id}`)
    revalidatePath(`/tournament/${existingMatch.tournament_id}/admin`)
    emitTournamentEvent(existingMatch.tournament_id, 'match_updated')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateTournamentStatus(tournamentId: string, status: 'setup' | 'in_progress' | 'completed') {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    await db.update(tournaments)
      .set({ status, updated_at: new Date() })
      .where(eq(tournaments.id, tournamentId))

    revalidatePath(`/tournament/${tournamentId}`)
    revalidatePath('/admin')
    emitTournamentEvent(tournamentId, 'tournament_updated')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function addTiebreakerMatch(
  tournamentId: string,
  team1Id: string,
  team2Id: string,
  tableNumber: number
) {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    const maxRoundResult = await db
      .select({ maxRound: sql<number>`MAX(${matches.round_number})` })
      .from(matches)
      .where(eq(matches.tournament_id, tournamentId))

    const nextRound = (maxRoundResult[0]?.maxRound || 0) + 1

    const [match] = await db.insert(matches).values({
      tournament_id: tournamentId,
      round_number: nextRound,
      table_number: tableNumber,
      team1_id: team1Id,
      team2_id: team2Id,
      stage: 'tiebreaker',
      bracket_position: null,
    }).returning()

    if (!match) {
      return { error: 'Failed to create match' }
    }

    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, tournamentId),
      columns: { num_rounds: true },
    })

    if (tournament && nextRound > tournament.num_rounds) {
      await db.update(tournaments)
        .set({ num_rounds: nextRound, updated_at: new Date() })
        .where(eq(tournaments.id, tournamentId))
    }

    revalidatePath(`/tournament/${tournamentId}`)
    revalidatePath(`/tournament/${tournamentId}/admin`)
    emitTournamentEvent(tournamentId, 'match_created')

    return { success: true, matchId: match.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function deleteTournament(tournamentId: string) {
  try {
    if (!(await getSession())) return { error: 'Unauthorized' }

    const tournament = await db.query.tournaments.findFirst({
      where: eq(tournaments.id, tournamentId),
    })

    if (!tournament) {
      return { error: 'Tournament not found' }
    }

    // CASCADE in schema handles teams and matches deletion
    await db.delete(tournaments).where(eq(tournaments.id, tournamentId))

    revalidatePath('/admin')
    revalidatePath('/tournaments')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
