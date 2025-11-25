'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import Leaderboard from './Leaderboard'
import MatchSchedule from './MatchSchedule'
import PoolStageView from './PoolStageView'
import PlayoffBracketView from './PlayoffBracketView'
import confetti from 'canvas-confetti'

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
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'pool' | 'playoffs'>('leaderboard')
  const [showWinnerBanner, setShowWinnerBanner] = useState(false)
  const confettiTriggered = useRef(false)

  const isPoolPlayoff = tournament.tournament_format === 'pool_playoff'
  const poolMatches = matches.filter(m => m.stage === 'pool')
  const playoffMatches = matches.filter(m => m.stage !== 'pool')

  // Check for a clear winner
  const checkForWinner = useCallback(() => {
    if (teams.length < 2 || matches.length === 0) return null

    const allMatchesCompleted = matches.every(m => m.completed_at)
    if (!allMatchesCompleted) return null

    // Check if there's a tiebreaker match that's completed
    const tiebreakerMatch = matches.find(m => m.stage === 'tiebreaker' && m.completed_at)
    if (tiebreakerMatch && tiebreakerMatch.winner_id) {
      return teams.find(t => t.id === tiebreakerMatch.winner_id) || null
    }

    // Check if there's a clear winner (no tie at top)
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points)
    if (sortedTeams[0].points > sortedTeams[1].points) {
      return sortedTeams[0]
    }

    return null
  }, [teams, matches])

  const winner = checkForWinner()

  // Trigger confetti when winner is determined
  useEffect(() => {
    if (winner && !confettiTriggered.current) {
      confettiTriggered.current = true
      setShowWinnerBanner(true)

      // Fire confetti multiple times for a shower effect
      const duration = 3000
      const end = Date.now() + duration

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
        })
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
        })

        if (Date.now() < end) {
          requestAnimationFrame(frame)
        }
      }
      frame()

      // Big burst in the center
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347', '#00CED1', '#9370DB']
      })
    }
  }, [winner])

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
      .channel(`public-tournament-${tournament.id}`)
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
      .channel(`public-teams-${tournament.id}`)
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
      .channel(`public-matches-${tournament.id}`)
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Winner Banner */}
      {showWinnerBanner && winner && (
        <div className="bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-400 py-4 px-4 text-center animate-pulse">
          <div className="max-w-7xl mx-auto">
            <div className="text-3xl font-bold text-gray-900">
              🏆 CHAMPIONS 🏆
            </div>
            <div className="text-2xl font-bold text-gray-800 mt-1">
              {winner.player1_name} & {winner.player2_name}
            </div>
          </div>
        </div>
      )}

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
          <div className="space-y-6">
            <Leaderboard teams={teams} />
            <MatchSchedule
              matches={matches}
              numRounds={tournament.num_rounds}
            />
          </div>
        )}

        {/* Pool+Playoff Views */}
        {isPoolPlayoff && activeTab === 'leaderboard' && (
          <div className="space-y-6">
            <Leaderboard teams={teams} />
            <MatchSchedule
              matches={poolMatches}
              numRounds={tournament.num_rounds}
            />
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
