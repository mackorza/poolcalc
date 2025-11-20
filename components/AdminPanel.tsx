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
}

export default function AdminPanel({ tournamentId, matches, currentStatus }: AdminPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)

  const handleSetWinner = async (matchId: string, winnerId: string) => {
    setLoading(matchId)
    try {
      await updateMatchWinner(matchId, winnerId)
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
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setStatusLoading(false)
    }
  }

  // Only show incomplete matches
  const incompleteMatches = matches.filter((m) => !m.completed_at)

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">⚙️ Admin Panel</h2>

        <div className="flex gap-2">
          <button
            onClick={() => handleStatusChange('setup')}
            disabled={statusLoading || currentStatus === 'setup'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStatus === 'setup'
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Setup
          </button>
          <button
            onClick={() => handleStatusChange('in_progress')}
            disabled={statusLoading || currentStatus === 'in_progress'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStatus === 'in_progress'
                ? 'bg-yellow-200 text-yellow-700 cursor-not-allowed'
                : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
            }`}
          >
            In Progress
          </button>
          <button
            onClick={() => handleStatusChange('completed')}
            disabled={statusLoading || currentStatus === 'completed'}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              currentStatus === 'completed'
                ? 'bg-green-200 text-green-700 cursor-not-allowed'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            Completed
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Incomplete Matches ({incompleteMatches.length})
        </h3>

        {incompleteMatches.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            All matches completed!
          </div>
        ) : (
          <div className="space-y-3">
            {incompleteMatches.map((match) => (
              <div
                key={match.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-gray-600">
                    Round {match.round_number} - Table {match.table_number}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => handleSetWinner(match.id, match.team1_id)}
                    disabled={loading === match.id}
                    className="p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-900">
                      {match.team1.player1_name} & {match.team1.player2_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {match.team1.wins}W - {match.team1.losses}L ({match.team1.points} pts)
                    </div>
                  </button>

                  <button
                    onClick={() => handleSetWinner(match.id, match.team2_id)}
                    disabled={loading === match.id}
                    className="p-4 text-left bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-900">
                      {match.team2.player1_name} & {match.team2.player2_name}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {match.team2.wins}W - {match.team2.losses}L ({match.team2.points} pts)
                    </div>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
