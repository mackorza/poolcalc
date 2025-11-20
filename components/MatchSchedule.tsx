'use client'

import { Database } from '@/lib/types/database'

type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface MatchScheduleProps {
  matches: Match[]
  numRounds: number
}

export default function MatchSchedule({ matches, numRounds }: MatchScheduleProps) {
  // Group matches by round
  const matchesByRound = Array.from({ length: numRounds }, (_, i) => i + 1).map((roundNum) => ({
    round: roundNum,
    matches: matches.filter((m) => m.round_number === roundNum),
  }))

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">📋 Match Schedule</h2>

        <div className="space-y-6">
          {matchesByRound.map(({ round, matches: roundMatches }) => (
            <div key={round}>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  Round {round}
                </span>
                <span className="text-sm text-gray-600">
                  ({roundMatches.filter((m) => m.completed_at).length}/{roundMatches.length} completed)
                </span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {roundMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`border-2 rounded-lg p-4 transition-all ${
                      match.completed_at
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white hover:border-blue-300'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-semibold text-gray-600 uppercase">
                        Table {match.table_number}
                      </span>
                      {match.completed_at && (
                        <span className="text-xs font-semibold text-green-600 uppercase">
                          ✓ Complete
                        </span>
                      )}
                    </div>

                    <div className="space-y-2">
                      {/* Team 1 */}
                      <div
                        className={`p-3 rounded ${
                          match.winner_id === match.team1_id
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {match.team1.player1_name} & {match.team1.player2_name}
                          </div>
                          {match.winner_id === match.team1_id && (
                            <span className="text-green-600 font-bold text-lg">W</span>
                          )}
                        </div>
                      </div>

                      {/* VS */}
                      <div className="text-center text-xs font-semibold text-gray-400">
                        VS
                      </div>

                      {/* Team 2 */}
                      <div
                        className={`p-3 rounded ${
                          match.winner_id === match.team2_id
                            ? 'bg-green-100 border-2 border-green-500'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-gray-900">
                            {match.team2.player1_name} & {match.team2.player2_name}
                          </div>
                          {match.winner_id === match.team2_id && (
                            <span className="text-green-600 font-bold text-lg">W</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
