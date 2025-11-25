'use client'

import { useState } from 'react'
import { addTiebreakerMatch } from '@/app/actions/tournament'
import { Database } from '@/lib/types/database'

type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface TiebreakerPanelProps {
  tournamentId: string
  teams: Team[]
  matches: Match[]
  numTables: number
  onDataChange?: () => void
}

export default function TiebreakerPanel({
  tournamentId,
  teams,
  matches,
  numTables,
  onDataChange,
}: TiebreakerPanelProps) {
  const [loading, setLoading] = useState(false)
  const [selectedTable, setSelectedTable] = useState(1)
  const [showModal, setShowModal] = useState(false)

  // Check if all matches are completed
  const allMatchesCompleted = matches.length > 0 && matches.every((m) => m.completed_at)

  // Check if there are already tiebreaker matches that aren't completed
  const pendingTiebreakerMatches = matches.filter(
    (m) => m.stage === 'tiebreaker' && !m.completed_at
  )

  // Find teams with tied top scores
  const findTiedTopTeams = (): Team[] => {
    if (teams.length < 2) return []

    // Sort teams by points (descending)
    const sortedTeams = [...teams].sort((a, b) => b.points - a.points)
    const topScore = sortedTeams[0].points

    // Get all teams with the top score
    const tiedTeams = sortedTeams.filter((t) => t.points === topScore)

    // Only return if there's a tie (more than 1 team with top score)
    return tiedTeams.length > 1 ? tiedTeams : []
  }

  const tiedTeams = findTiedTopTeams()

  // Don't show if there's no tie, not all matches complete, or there are pending tiebreakers
  if (!allMatchesCompleted || tiedTeams.length < 2 || pendingTiebreakerMatches.length > 0) {
    return null
  }

  const handleAddTiebreaker = async () => {
    if (tiedTeams.length < 2) return

    setLoading(true)
    try {
      // For now, create a match between the first two tied teams
      // In a more complex scenario, you might want to handle more than 2 tied teams
      const result = await addTiebreakerMatch(
        tournamentId,
        tiedTeams[0].id,
        tiedTeams[1].id,
        selectedTable
      )

      if (result.success) {
        setShowModal(false)
        onDataChange?.()
      } else {
        console.error('Failed to create tiebreaker:', result.error)
      }
    } catch (error) {
      console.error('Failed to add tiebreaker match:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4 mt-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-orange-800">Tiebreaker Required!</h3>
            <p className="text-sm text-orange-700 mt-1">
              {tiedTeams.length} teams are tied with {tiedTeams[0].points} points:
            </p>
            <ul className="mt-2 space-y-1">
              {tiedTeams.map((team) => (
                <li key={team.id} className="text-sm text-orange-800 font-medium">
                  • {team.player1_name} & {team.player2_name}
                </li>
              ))}
            </ul>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Add Playoff Round
          </button>
        </div>
      </div>

      {/* Modal for table selection */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Add Tiebreaker Match</h3>

            <div className="mb-4">
              <p className="text-gray-700 mb-2">Match between:</p>
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="font-medium text-gray-900">
                  {tiedTeams[0].player1_name} & {tiedTeams[0].player2_name}
                </div>
                <div className="text-center text-gray-500 font-bold">VS</div>
                <div className="font-medium text-gray-900">
                  {tiedTeams[1].player1_name} & {tiedTeams[1].player2_name}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Table
              </label>
              <div className="flex flex-wrap gap-2">
                {Array.from({ length: numTables }, (_, i) => i + 1).map((table) => (
                  <button
                    key={table}
                    type="button"
                    onClick={() => setSelectedTable(table)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedTable === table
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Table {table}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddTiebreaker}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Match'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
