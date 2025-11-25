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
    <div className="space-y-3">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Match Schedule</h2>

        <div className="space-y-3">
          {matchesByRound.map(({ round, matches: roundMatches }) => (
            <div key={round}>
              <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs">
                  Round {round}
                </span>
                <span className="text-xs text-gray-600">
                  ({roundMatches.filter((m) => m.completed_at).length}/{roundMatches.length} done)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {roundMatches.map((match) => (
                  <div
                    key={match.id}
                    className={`border rounded-lg p-2 transition-all ${
                      match.completed_at
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs font-medium text-gray-500">
                        Table {match.table_number}
                      </span>
                      {match.completed_at && (
                        <span className="text-xs text-green-600">✓</span>
                      )}
                    </div>

                    <div className="space-y-1">
                      {/* Team 1 */}
                      <div
                        className={`px-2 py-1 rounded text-sm ${
                          match.winner_id === match.team1_id
                            ? 'bg-green-100 border border-green-400'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 truncate">
                            {match.team1.player1_name} & {match.team1.player2_name}
                          </span>
                          {match.winner_id === match.team1_id && (
                            <span className="text-green-600 font-bold text-xs ml-1">W</span>
                          )}
                        </div>
                      </div>

                      {/* VS */}
                      <div className="text-center text-xs text-gray-400">vs</div>

                      {/* Team 2 */}
                      <div
                        className={`px-2 py-1 rounded text-sm ${
                          match.winner_id === match.team2_id
                            ? 'bg-green-100 border border-green-400'
                            : 'bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-gray-900 truncate">
                            {match.team2.player1_name} & {match.team2.player2_name}
                          </span>
                          {match.winner_id === match.team2_id && (
                            <span className="text-green-600 font-bold text-xs ml-1">W</span>
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
