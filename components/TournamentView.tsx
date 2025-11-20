'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import Leaderboard from './Leaderboard'
import MatchSchedule from './MatchSchedule'
import AdminPanel from './AdminPanel'
import PoolStageView from './PoolStageView'
import PlayoffBracketView from './PlayoffBracketView'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface TournamentViewProps {
  tournament: Tournament
  teams: Team[]
  matches: Match[]
}

export default function TournamentView({ tournament: initialTournament, teams: initialTeams, matches: initialMatches }: TournamentViewProps) {
  const [tournament, setTournament] = useState(initialTournament)
  const [teams, setTeams] = useState(initialTeams)
  const [matches, setMatches] = useState(initialMatches)
  const [showAdmin, setShowAdmin] = useState(false)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'pool' | 'playoffs'>('leaderboard')

  const isPoolPlayoff = tournament.tournament_format === 'pool_playoff'
  const poolMatches = matches.filter(m => m.stage === 'pool')
  const playoffMatches = matches.filter(m => m.stage !== 'pool')

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to tournament changes
    const tournamentChannel = supabase
      .channel(`tournament-${tournament.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tournaments',
          filter: `id=eq.${tournament.id}`,
        },
        (payload) => {
          if (payload.new) {
            setTournament(payload.new as Tournament)
          }
        }
      )
      .subscribe()

    // Subscribe to teams changes
    const teamsChannel = supabase
      .channel(`teams-${tournament.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `tournament_id=eq.${tournament.id}`,
        },
        async () => {
          // Refetch teams when any team changes
          const { data } = await supabase
            .from('teams')
            .select('*')
            .eq('tournament_id', tournament.id)
            .order('points', { ascending: false })

          if (data) {
            setTeams(data)
          }
        }
      )
      .subscribe()

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel(`matches-${tournament.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournament.id}`,
        },
        async () => {
          // Refetch matches with team details
          const { data: matchesData } = await supabase
            .from('matches')
            .select(`
              *,
              team1:team1_id(*),
              team2:team2_id(*),
              winner:winner_id(*)
            `)
            .eq('tournament_id', tournament.id)
            .order('round_number', { ascending: true })
            .order('table_number', { ascending: true })

          if (matchesData) {
            const formattedMatches = (matchesData as any[]).map((match) => ({
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
            }))
            setMatches(formattedMatches)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tournamentChannel)
      supabase.removeChannel(teamsChannel)
      supabase.removeChannel(matchesChannel)
    }
  }, [tournament.id])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return null
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {tournament.venue_name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-4 text-gray-600">
                <span className="flex items-center gap-1">
                  📅 {formatDate(tournament.tournament_date)}
                </span>
                {tournament.start_time && (
                  <span className="flex items-center gap-1">
                    🕐 {formatTime(tournament.start_time)}
                  </span>
                )}
                {tournament.venue_location && (
                  <span className="flex items-center gap-1">
                    📍 {tournament.venue_location}
                  </span>
                )}
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  {tournament.num_tables} {tournament.num_tables === 1 ? 'Table' : 'Tables'}
                </span>
                {!isPoolPlayoff && (
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    {tournament.num_rounds} {tournament.num_rounds === 1 ? 'Round' : 'Rounds'}
                  </span>
                )}
                <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                  {isPoolPlayoff ? 'Pool + Playoffs' : 'Round-Robin'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tournament.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : tournament.status === 'in_progress'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {tournament.status === 'in_progress' ? 'In Progress' :
                   tournament.status === 'completed' ? 'Completed' : 'Setup'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowAdmin(!showAdmin)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {showAdmin ? 'Hide Admin' : 'Admin Panel'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tab Navigation - only for Pool+Playoff format */}
        {isPoolPlayoff && (
          <div className="mb-6 bg-white rounded-lg shadow p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'leaderboard'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Leaderboard
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'pool'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pool Stage
            </button>
            <button
              onClick={() => setActiveTab('playoffs')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'playoffs'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Playoffs
            </button>
          </div>
        )}

        {/* Round-Robin View */}
        {!isPoolPlayoff && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Leaderboard teams={teams} />
            </div>
            <div className="lg:col-span-2">
              <MatchSchedule
                matches={matches}
                numRounds={tournament.num_rounds}
              />
            </div>
          </div>
        )}

        {/* Pool+Playoff Views */}
        {isPoolPlayoff && activeTab === 'leaderboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <Leaderboard teams={teams} />
            </div>
            <div className="lg:col-span-2">
              <MatchSchedule
                matches={poolMatches}
                numRounds={tournament.num_rounds}
              />
            </div>
          </div>
        )}

        {isPoolPlayoff && activeTab === 'pool' && (
          <PoolStageView teams={teams} matches={poolMatches} />
        )}

        {isPoolPlayoff && activeTab === 'playoffs' && (
          <PlayoffBracketView matches={playoffMatches} teams={teams} />
        )}

        {/* Admin Panel */}
        {showAdmin && (
          <div className="mt-8">
            <AdminPanel
              tournamentId={tournament.id}
              matches={matches}
              currentStatus={tournament.status}
            />
          </div>
        )}
      </div>
    </div>
  )
}
