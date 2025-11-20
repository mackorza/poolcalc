'use server'

import { createClient } from '@/lib/supabase/server'
import { createRandomizedTeams, generateRoundRobinSchedule } from '@/lib/tournament/utils'
import { revalidatePath } from 'next/cache'

export interface CreateTournamentData {
  venueName: string
  venueLocation?: string
  tournamentDate: string
  startTime?: string
  numTables: number
  numRounds: number
  playerNames: string[]
}

export async function createTournament(data: CreateTournamentData) {
  try {
    const supabase = await createClient()

    // Validate player count
    if (data.playerNames.length < 2) {
      return { error: 'At least 2 players are required' }
    }

    if (data.playerNames.length % 2 !== 0) {
      return { error: 'Number of players must be even' }
    }

    // Create tournament
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .insert({
        venue_name: data.venueName,
        venue_location: data.venueLocation,
        tournament_date: data.tournamentDate,
        start_time: data.startTime,
        num_tables: data.numTables,
        num_rounds: data.numRounds,
        status: 'setup',
      })
      .select()
      .single()

    if (tournamentError) {
      console.error('Tournament creation error:', tournamentError)
      return { error: 'Failed to create tournament' }
    }

    // Create randomized teams
    const teamPairs = createRandomizedTeams(data.playerNames)
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .insert(
        teamPairs.map((pair) => ({
          tournament_id: tournament.id,
          player1_name: pair.player1,
          player2_name: pair.player2,
        }))
      )
      .select()

    if (teamsError || !teams) {
      console.error('Teams creation error:', teamsError)
      return { error: 'Failed to create teams' }
    }

    // Generate round-robin schedule
    const teamIds = teams.map((team) => team.id)
    const schedule = generateRoundRobinSchedule(teamIds, data.numTables)

    // Create matches for specified number of rounds
    const matchesToCreate = []
    for (let roundIndex = 0; roundIndex < Math.min(data.numRounds, schedule.length); roundIndex++) {
      const round = schedule[roundIndex]
      for (const match of round) {
        matchesToCreate.push({
          tournament_id: tournament.id,
          round_number: roundIndex + 1,
          table_number: match.tableNumber,
          team1_id: match.team1Id,
          team2_id: match.team2Id,
        })
      }
    }

    const { error: matchesError } = await supabase.from('matches').insert(matchesToCreate)

    if (matchesError) {
      console.error('Matches creation error:', matchesError)
      return { error: 'Failed to create matches' }
    }

    revalidatePath('/admin')
    revalidatePath(`/tournament/${tournament.id}`)

    return { success: true, tournamentId: tournament.id }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateMatchWinner(matchId: string, winnerId: string) {
  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('matches')
      .update({
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', matchId)
      .select()
      .single()

    if (error) {
      console.error('Match update error:', error)
      return { error: 'Failed to update match' }
    }

    revalidatePath(`/tournament/${data.tournament_id}`)
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}

export async function updateTournamentStatus(tournamentId: string, status: 'setup' | 'in_progress' | 'completed') {
  try {
    const supabase = await createClient()

    const { error } = await supabase.from('tournaments').update({ status }).eq('id', tournamentId)

    if (error) {
      console.error('Tournament status update error:', error)
      return { error: 'Failed to update tournament status' }
    }

    revalidatePath(`/tournament/${tournamentId}`)
    revalidatePath('/admin')

    return { success: true }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { error: 'An unexpected error occurred' }
  }
}
