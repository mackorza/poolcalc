'use client'

import { Database } from '@/lib/types/database'
import { getStageDisplayName } from '@/lib/tournament/playoff-utils'

type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
  stage: 'pool' | 'quarterfinal' | 'semifinal' | 'final' | 'third_place'
  bracket_position: number | null
}

interface PlayoffBracketViewProps {
  matches: Match[]
  teams: Team[]
}

export default function PlayoffBracketView({ matches }: PlayoffBracketViewProps) {
  // Group matches by stage
  const quarterfinals = matches.filter(m => m.stage === 'quarterfinal').sort((a, b) => (a.bracket_position || 0) - (b.bracket_position || 0))
  const semifinals = matches.filter(m => m.stage === 'semifinal').sort((a, b) => (a.bracket_position || 0) - (b.bracket_position || 0))
  const thirdPlace = matches.find(m => m.stage === 'third_place')
  const final = matches.find(m => m.stage === 'final')

  const hasQuarterfinals = quarterfinals.length > 0

  const renderTeamDisplay = (team: Team | null, isWinner: boolean) => {
    if (!team) {
      return (
        <div className="text-gray-400 italic text-sm">TBD</div>
      )
    }

    return (
      <div className={`${isWinner ? 'font-bold text-green-700' : 'text-gray-900'}`}>
        <div className="text-sm">{team.player1_name}</div>
        <div className="text-xs text-gray-600">{team.player2_name}</div>
      </div>
    )
  }

  const renderMatch = (match: Match | undefined, label: string) => {
    if (!match) return null

    const team1IsWinner = match.winner_id === match.team1_id
    const team2IsWinner = match.winner_id === match.team2_id
    const isCompleted = match.winner_id !== null

    return (
      <div className="bg-white rounded-lg shadow-md border-2 border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        <div className="bg-gray-100 px-3 py-1 border-b border-gray-200">
          <div className="text-xs font-semibold text-gray-700">{label}</div>
        </div>
        <div className="p-3 space-y-2">
          <div className={`p-2 rounded ${team1IsWinner ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border border-gray-200'}`}>
            {renderTeamDisplay(match.team1, team1IsWinner)}
          </div>
          <div className={`p-2 rounded ${team2IsWinner ? 'bg-green-50 border-2 border-green-500' : 'bg-gray-50 border border-gray-200'}`}>
            {renderTeamDisplay(match.team2, team2IsWinner)}
          </div>
        </div>
        {isCompleted && (
          <div className="bg-green-50 px-3 py-1 border-t border-green-200">
            <div className="text-xs font-medium text-green-700">Winner: {match.winner?.player1_name}</div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Playoff Bracket</h2>
        <p className="text-sm text-gray-600">Knockout stage</p>
      </div>

      {/* Bracket Layout */}
      <div className="space-y-12">
        {/* Quarterfinals */}
        {hasQuarterfinals && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 text-center">{getStageDisplayName('quarterfinal')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quarterfinals.map((match, index) => (
                <div key={match.id}>
                  {renderMatch(match, `QF${index + 1}`)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Semifinals */}
        {semifinals.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-gray-800 text-center">{getStageDisplayName('semifinal')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {semifinals.map((match, index) => (
                <div key={match.id}>
                  {renderMatch(match, `SF${index + 1}`)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Finals */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-800 text-center">Finals</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {thirdPlace && (
              <div>
                {renderMatch(thirdPlace, getStageDisplayName('third_place'))}
              </div>
            )}
            {final && (
              <div>
                {renderMatch(final, getStageDisplayName('final'))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Legend</h4>
        <div className="flex flex-wrap gap-4 text-xs text-gray-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-50 border-2 border-green-500 rounded"></div>
            <span>Winner</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-50 border border-gray-200 rounded"></div>
            <span>Loser / Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-gray-400 italic">TBD</div>
            <span>To Be Determined</span>
          </div>
        </div>
      </div>
    </div>
  )
}
