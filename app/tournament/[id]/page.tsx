import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import TournamentView from '@/components/TournamentView'
import { Database } from '@/lib/types/database'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch tournament
  const { data: tournament, error: tournamentError } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (tournamentError || !tournament) {
    notFound()
  }

  // Fetch teams
  const { data: teams } = await supabase
    .from('teams')
    .select('*')
    .eq('tournament_id', id)
    .order('points', { ascending: false })

  // Fetch matches with team details
  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:team1_id(*),
      team2:team2_id(*),
      winner:winner_id(*)
    `)
    .eq('tournament_id', id)
    .order('round_number', { ascending: true })
    .order('table_number', { ascending: true })

  const matches = (matchesData as any[])?.map((match) => ({
    id: match.id,
    tournament_id: match.tournament_id,
    round_number: match.round_number,
    table_number: match.table_number,
    team1_id: match.team1_id,
    team2_id: match.team2_id,
    winner_id: match.winner_id,
    completed_at: match.completed_at,
    created_at: match.created_at,
    team1: match.team1,
    team2: match.team2,
    winner: match.winner,
  })) || []

  return (
    <TournamentView
      tournament={tournament}
      teams={teams || []}
      matches={matches}
    />
  )
}
