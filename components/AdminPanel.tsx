'use client'

import { useState } from 'react'
import { updateMatchWinner, clearMatchWinner, updateTournamentStatus, addTiebreakerMatch } from '@/app/actions/tournament'
import type { Team, MatchWithTeams } from '@/lib/db/types'

type Match = MatchWithTeams

interface AdminPanelProps {
  tournamentId: string
  matches: Match[]
  teams: Team[]
  numTables: number
  currentStatus: 'setup' | 'in_progress' | 'completed'
  onDataChange?: () => void
}

export default function AdminPanel({ tournamentId, matches, teams, numTables, currentStatus, onDataChange }: AdminPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [statusLoading, setStatusLoading] = useState(false)
  const [showAddMatch, setShowAddMatch] = useState(false)
  const [addMatchTeam1, setAddMatchTeam1] = useState('')
  const [addMatchTeam2, setAddMatchTeam2] = useState('')
  const [addMatchTable, setAddMatchTable] = useState(1)
  const [addMatchLoading, setAddMatchLoading] = useState(false)

  const handleSetWinner = async (matchId: string, winnerId: string, currentWinnerId: string | null) => {
    setLoading(matchId)
    try {
      if (winnerId === currentWinnerId) {
        // Toggle: clicking the current winner clears the result
        await clearMatchWinner(matchId)
      } else {
        await updateMatchWinner(matchId, winnerId)
      }
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

  const handleAddMatch = async () => {
    if (!addMatchTeam1 || !addMatchTeam2 || addMatchTeam1 === addMatchTeam2) return
    setAddMatchLoading(true)
    try {
      const result = await addTiebreakerMatch(tournamentId, addMatchTeam1, addMatchTeam2, addMatchTable)
      if (result.success) {
        setShowAddMatch(false)
        setAddMatchTeam1('')
        setAddMatchTeam2('')
        setAddMatchTable(1)
        onDataChange?.()
      }
    } catch (error) {
      console.error('Failed to add match:', error)
    } finally {
      setAddMatchLoading(false)
    }
  }

  // Separate matches into incomplete and completed
  const incompleteMatches = matches.filter((m) => !m.completed_at)
  const completedMatches = matches.filter((m) => m.completed_at)
  const allMatchesCompleted = matches.length > 0 && incompleteMatches.length === 0

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
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-slate-100">Admin Panel</h2>
          <button
            onClick={() => setShowAddMatch(true)}
            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Add Match
          </button>
        </div>

        <div className="hidden lg:flex gap-2">
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
            onClick={() => handleStatusChange(allMatchesCompleted ? 'completed' : 'in_progress')}
            disabled={statusLoading || (allMatchesCompleted ? currentStatus === 'completed' : currentStatus === 'in_progress')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              allMatchesCompleted
                ? currentStatus === 'completed'
                  ? 'bg-green-600 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-500 animate-pulse'
                : currentStatus === 'in_progress'
                  ? 'bg-yellow-600 text-white cursor-not-allowed'
                  : 'bg-yellow-700 text-yellow-100 hover:bg-yellow-600'
            }`}
          >
            {allMatchesCompleted ? 'Mark Completed' : 'In Progress'}
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
                      onClick={() => handleSetWinner(match.id, match.team1_id, match.winner_id)}
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
                      onClick={() => handleSetWinner(match.id, match.team2_id, match.winner_id)}
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
                      onClick={() => handleSetWinner(match.id, match.team1_id, match.winner_id)}
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
                      onClick={() => handleSetWinner(match.id, match.team2_id, match.winner_id)}
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

      {/* Add Match Modal */}
      {showAddMatch && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4 border border-slate-600">
            <h3 className="text-xl font-bold text-white mb-4">Add Match</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Team 1</label>
                <select
                  value={addMatchTeam1}
                  onChange={(e) => setAddMatchTeam1(e.target.value)}
                  title="Select Team 1"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">Select team...</option>
                  {teams.filter(t => t.id !== addMatchTeam2).map(team => (
                    <option key={team.id} value={team.id}>
                      {team.player1_name} & {team.player2_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Team 2</label>
                <select
                  value={addMatchTeam2}
                  onChange={(e) => setAddMatchTeam2(e.target.value)}
                  title="Select Team 2"
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                >
                  <option value="">Select team...</option>
                  {teams.filter(t => t.id !== addMatchTeam1).map(team => (
                    <option key={team.id} value={team.id}>
                      {team.player1_name} & {team.player2_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Table</label>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: numTables }, (_, i) => i + 1).map((table) => (
                    <button
                      key={table}
                      type="button"
                      onClick={() => setAddMatchTable(table)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        addMatchTable === table
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      Table {table}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddMatch(false)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg font-medium hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddMatch}
                disabled={addMatchLoading || !addMatchTeam1 || !addMatchTeam2 || addMatchTeam1 === addMatchTeam2}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addMatchLoading ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
