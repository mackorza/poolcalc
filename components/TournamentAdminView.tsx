'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import Leaderboard from './Leaderboard'
import MatchSchedule from './MatchSchedule'
import AdminPanel from './AdminPanel'
import TiebreakerPanel from './TiebreakerPanel'
import PoolStageView from './PoolStageView'
import PlayoffBracketView from './PlayoffBracketView'

type Tournament = Database['public']['Tables']['tournaments']['Row']
type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface TournamentAdminViewProps {
  tournament: Tournament
  teams: Team[]
  matches: Match[]
}

export default function TournamentAdminView({ tournament: initialTournament, teams: initialTeams, matches: initialMatches }: TournamentAdminViewProps) {
  const router = useRouter()
  const [tournament, setTournament] = useState(initialTournament)
  const [teams, setTeams] = useState(initialTeams)
  const [matches, setMatches] = useState(initialMatches)
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'pool' | 'playoffs'>('leaderboard')

  const isPoolPlayoff = tournament.tournament_format === 'pool_playoff'
  const poolMatches = matches.filter(m => m.stage === 'pool')
  const playoffMatches = matches.filter(m => m.stage !== 'pool')

  // Function to refetch all data
  const refetchData = useCallback(async () => {
    const supabase = createClient()

    // Refetch teams
    const { data: teamsData } = await supabase
      .from('teams')
      .select('*')
      .eq('tournament_id', tournament.id)
      .order('points', { ascending: false })

    if (teamsData) {
      setTeams(teamsData)
    }

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
        stage: match.stage,
        bracket_position: match.bracket_position,
        created_at: match.created_at,
        team1: match.team1,
        team2: match.team2,
        winner: match.winner,
      }))
      setMatches(formattedMatches)
    }
  }, [tournament.id])

  // Update state when props change (from server revalidation)
  useEffect(() => {
    setTournament(initialTournament)
    setTeams(initialTeams)
    setMatches(initialMatches)
  }, [initialTournament, initialTeams, initialMatches])

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to tournament changes
    const tournamentChannel = supabase
      .channel(`admin-tournament-${tournament.id}`)
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
      .channel(`admin-teams-${tournament.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'teams',
          filter: `tournament_id=eq.${tournament.id}`,
        },
        () => {
          refetchData()
        }
      )
      .subscribe()

    // Subscribe to matches changes
    const matchesChannel = supabase
      .channel(`admin-matches-${tournament.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `tournament_id=eq.${tournament.id}`,
        },
        () => {
          refetchData()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(tournamentChannel)
      supabase.removeChannel(teamsChannel)
      supabase.removeChannel(matchesChannel)
    }
  }, [tournament.id, refetchData])

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
    <div className="min-h-screen bg-slate-900">
      {/* Header */}
      <div className="bg-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="px-3 py-1 bg-orange-600 text-orange-100 rounded-full text-sm font-bold">
                  ADMIN MODE
                </span>
              </div>
              <h1 className="text-3xl font-bold text-white">
                {tournament.venue_name}
              </h1>
              <div className="mt-2 flex flex-wrap gap-4 text-blue-200">
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
                <span className="px-3 py-1 bg-blue-700 text-blue-100 rounded-full text-sm font-medium">
                  {tournament.num_tables} {tournament.num_tables === 1 ? 'Table' : 'Tables'}
                </span>
                {!isPoolPlayoff && (
                  <span className="px-3 py-1 bg-purple-700 text-purple-100 rounded-full text-sm font-medium">
                    {tournament.num_rounds} {tournament.num_rounds === 1 ? 'Round' : 'Rounds'}
                  </span>
                )}
                <span className="px-3 py-1 bg-indigo-700 text-indigo-100 rounded-full text-sm font-medium">
                  {isPoolPlayoff ? 'Pool + Playoffs' : 'Round-Robin'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tournament.status === 'completed'
                    ? 'bg-green-700 text-green-100'
                    : tournament.status === 'in_progress'
                    ? 'bg-yellow-600 text-yellow-100'
                    : 'bg-slate-600 text-slate-200'
                }`}>
                  {tournament.status === 'in_progress' ? 'In Progress' :
                   tournament.status === 'completed' ? 'Completed' : 'Setup'}
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/tournament/${tournament.id}`}
                className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
              >
                View Public Page
              </Link>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Check out the tournament: ${tournament.venue_name}\n${typeof window !== 'undefined' ? window.location.origin : ''}/tournament/${tournament.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Share
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Admin Panel - Always visible on admin page */}
        <div className="mb-8">
          <AdminPanel
            tournamentId={tournament.id}
            matches={matches}
            currentStatus={tournament.status}
            onDataChange={refetchData}
          />
        </div>

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
              <TiebreakerPanel
                tournamentId={tournament.id}
                teams={teams}
                matches={matches}
                numTables={tournament.num_tables}
                onDataChange={refetchData}
              />
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
              <TiebreakerPanel
                tournamentId={tournament.id}
                teams={teams}
                matches={matches}
                numTables={tournament.num_tables}
                onDataChange={refetchData}
              />
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
      </div>
    </div>
  )
}
