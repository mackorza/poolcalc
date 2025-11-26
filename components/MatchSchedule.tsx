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
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 border border-slate-700">
        <h2 className="text-xl font-bold text-slate-100 mb-4">📋 Match Schedule</h2>

        <div className="space-y-3">
          {matchesByRound.map(({ round, matches: roundMatches }) => (
            <div key={round}>
              <h3 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <span className="bg-blue-900 text-blue-200 px-2 py-0.5 rounded-full text-xs">
                  Round {round}
                </span>
                <span className="text-xs text-slate-400">
                  ({roundMatches.filter((m) => m.completed_at).length}/{roundMatches.length} done)
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {roundMatches.map((match) => {
                  const isCompleted = !!match.completed_at
                  const team1Won = match.winner_id === match.team1_id
                  const team2Won = match.winner_id === match.team2_id

                  return (
                    <div
                      key={match.id}
                      className={`border rounded-lg p-2 transition-all ${
                        isCompleted
                          ? 'border-slate-500 bg-slate-700'
                          : 'border-slate-600 bg-slate-800'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-medium text-slate-300">
                          Table {match.table_number}
                        </span>
                        {isCompleted && (
                          <span className="text-xs text-green-400 font-semibold">Done</span>
                        )}
                      </div>

                      <div className="space-y-1">
                        {/* Team 1 */}
                        <div
                          className={`px-2 py-1.5 rounded text-sm font-medium ${
                            isCompleted
                              ? team1Won
                                ? 'bg-green-600 text-white'
                                : 'bg-red-800/70 text-red-100'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {match.team1.player1_name} & {match.team1.player2_name}
                            </span>
                            {team1Won && (
                              <span className="font-bold text-xs ml-1">W</span>
                            )}
                          </div>
                        </div>

                        {/* VS */}
                        <div className="text-center text-xs text-slate-400 font-medium">vs</div>

                        {/* Team 2 */}
                        <div
                          className={`px-2 py-1.5 rounded text-sm font-medium ${
                            isCompleted
                              ? team2Won
                                ? 'bg-green-600 text-white'
                                : 'bg-red-800/70 text-red-100'
                              : 'bg-slate-600 text-white'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="truncate">
                              {match.team2.player1_name} & {match.team2.player2_name}
                            </span>
                            {team2Won && (
                              <span className="font-bold text-xs ml-1">W</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
