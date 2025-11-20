'use client'

import { Database } from '@/lib/types/database'

type Team = Database['public']['Tables']['teams']['Row']
type Match = Database['public']['Tables']['matches']['Row'] & {
  team1: Team
  team2: Team
  winner: Team | null
}

interface PoolStageViewProps {
  teams: Team[]
  matches: Match[]
}

interface PoolStanding {
  team: Team
  played: number
  wins: number
  losses: number
  points: number
}

export default function PoolStageView({ teams, matches }: PoolStageViewProps) {
  // Group teams by pool
  const pools = teams.reduce((acc, team) => {
    const poolName = team.pool_group || 'Unknown'
    if (!acc[poolName]) {
      acc[poolName] = []
    }
    acc[poolName].push(team)
    return acc
  }, {} as Record<string, Team[]>)

  // Sort pool names alphabetically
  const sortedPoolNames = Object.keys(pools).sort()

  // Calculate standings for each team
  const getTeamStandings = (poolTeams: Team[]): PoolStanding[] => {
    return poolTeams
      .map(team => {
        const teamMatches = matches.filter(
          m => m.team1_id === team.id || m.team2_id === team.id
        )
        const completed = teamMatches.filter(m => m.winner_id !== null)
        const wins = completed.filter(m => m.winner_id === team.id).length
        const losses = completed.length - wins

        return {
          team,
          played: completed.length,
          wins,
          losses,
          points: team.points,
        }
      })
      .sort((a, b) => {
        // Sort by points desc, then wins desc
        if (b.points !== a.points) return b.points - a.points
        return b.wins - a.wins
      })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Pool Stage</h2>
        <p className="text-sm text-gray-600">
          Top teams from each pool advance to playoffs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedPoolNames.map(poolName => {
          const poolTeams = pools[poolName]
          const standings = getTeamStandings(poolTeams)

          return (
            <div key={poolName} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <h3 className="text-xl font-bold text-white">Pool {poolName}</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pos
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Team
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        P
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        W
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        L
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((standing, index) => (
                      <tr
                        key={standing.team.id}
                        className={`hover:bg-gray-50 ${
                          index < 2 ? 'bg-green-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className={`text-sm font-semibold ${
                              index < 2 ? 'text-green-700' : 'text-gray-900'
                            }`}>
                              {index + 1}
                            </span>
                            {index < 2 && (
                              <span className="ml-1 text-green-600">✓</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">
                            {standing.team.player1_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {standing.team.player2_name}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-900">
                          {standing.played}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-900">
                          {standing.wins}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap text-sm text-gray-900">
                          {standing.losses}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <span className="text-sm font-bold text-gray-900">
                            {standing.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="bg-gray-50 px-4 py-2 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  <span className="text-green-600">✓</span> Qualified for playoffs
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
