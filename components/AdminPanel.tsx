'use client'

import { useState } from 'react'
import { updateMatchWinner, updateTournamentStatus } from '@/app/actions/tournament'
import { Database } from '@/lib/types/database'

type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface AdminPanelProps {
  tournamentId: string
  matches: Match[]
  currentStatus: 'setup' | 'in_progress' | 'completed'
  onDataChange?: () => void
}

export default function AdminPanel({ tournamentId, matches, currentStatus, onDataChange }: AdminPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const handleSetWinner = async (matchId: string, winnerId: string) => {
    setLoading(matchId)
    try {
      await updateMatchWinner(matchId, winnerId)
      // Trigger refetch after successful update
      onDataChange?.()
    } catch (error) {
      console.error('Failed to update match:', error)
    } finally {
      setLoading(null)
    }
  }

  const handleStatusChange = async (newStatus: 'setup' | 'in_progress' | 'completed') => {
    setStatusLoading(true)
    try {
      await updateTournamentStatus(tournamentId, newStatus)
      // Trigger refetch after successful update
      onDataChange?.()
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  // Separate matches into incomplete and completed
  const incompleteMatches = matches.filter((m) => !m.completed_at)
  const completedMatches = matches.filter((m) => m.completed_at)

  // Helper to get button styles based on winner status
  const getTeamButtonStyles = (match: Match, teamId: string) => {
    const isWinner = match.winner_id === teamId
    const isLoser = match.winner_id && match.winner_id !== teamId

    if (isWinner) {
      return 'p-4 text-left bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    }
    if (isLoser) {
      return 'p-4 text-left bg-red-800/70 text-red-100 rounded-lg hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
    }
    return 'p-4 text-left bg-slate-600 text-white rounded-lg hover:bg-slate-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
  }

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg p-6 border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-100">Admin Panel</h2>

        <div className="flex gap-2">
          <button
            onClick={() => handleStatusChange('setup')}
            disabled={statusLoading || currentStatus === 'setup'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStatus === 'setup'
                ? 'bg-slate-600 text-slate-300 cursor-not-allowed'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={statusLoading || currentStatus === 'in_progress'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStatus === 'in_progress'
                ? 'bg-yellow-600 text-white cursor-not-allowed'
                : 'bg-yellow-700 text-yellow-100 hover:bg-yellow-600'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={statusLoading || currentStatus === 'completed'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStatus === 'completed'
                ? 'bg-green-600 text-white cursor-not-allowed'
                : 'bg-green-700 text-green-100 hover:bg-green-600'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Incomplete Matches Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-200">
            Pending Matches ({incompleteMatches.length})
          </h3>

          {incompleteMatches.length === 0 ? (
            <div className="text-center py-4 text-slate-400 bg-slate-700 rounded-lg">
              All matches have a winner selected!
            </div>
          ) : (
            <div className="space-y-3">
              {incompleteMatches.map((match) => (
                <div
                  key={match.id}
                  className="border border-slate-600 rounded-lg p-4 bg-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-300">
                      Round {match.round_number} - Table {match.table_number}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSetWinner(match.id, match.team1_id)}
                      disabled={loading === match.id}
                      className={getTeamButtonStyles(match, match.team1_id)}
                    >
                      <div className="font-medium">
                        {match.team1.player1_name} & {match.team1.player2_name}
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {match.team1.wins}W - {match.team1.losses}L ({match.team1.points} pts)
                      </div>
                    </button>

                    <button
                      onClick={() => handleSetWinner(match.id, match.team2_id)}
                      disabled={loading === match.id}
                      className={getTeamButtonStyles(match, match.team2_id)}
                    >
                      <div className="font-medium">
                        {match.team2.player1_name} & {match.team2.player2_name}
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {match.team2.wins}W - {match.team2.losses}L ({match.team2.points} pts)
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Matches Section */}
        {completedMatches.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-200">
              Completed Matches ({completedMatches.length})
            </h3>

            <div className="space-y-3">
              {completedMatches.map((match) => (
                <div
                  key={match.id}
                  className="border border-slate-500 rounded-lg p-4 bg-slate-700"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-300">
                      Round {match.round_number} - Table {match.table_number}
                    </span>
                    <span className="text-xs text-green-400 font-semibold">
                      Done
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <button
                      onClick={() => handleSetWinner(match.id, match.team1_id)}
                      disabled={loading === match.id}
                      className={getTeamButtonStyles(match, match.team1_id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {match.team1.player1_name} & {match.team1.player2_name}
                        </span>
                        {match.winner_id === match.team1_id && (
                          <span className="font-bold">W</span>
                        )}
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {match.team1.wins}W - {match.team1.losses}L ({match.team1.points} pts)
                      </div>
                    </button>

                    <button
                      onClick={() => handleSetWinner(match.id, match.team2_id)}
                      disabled={loading === match.id}
                      className={getTeamButtonStyles(match, match.team2_id)}
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {match.team2.player1_name} & {match.team2.player2_name}
                        </span>
                        {match.winner_id === match.team2_id && (
                          <span className="font-bold">W</span>
                        )}
                      </div>
                      <div className="text-sm opacity-80 mt-1">
                        {match.team2.wins}W - {match.team2.losses}L ({match.team2.points} pts)
                      </div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
