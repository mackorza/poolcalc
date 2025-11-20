'use client'

import { Database } from '@/lib/types/database'

type Team = Database['public']['Tables']['teams']['Row']

interface LeaderboardProps {
  teams: Team[]
}

export default function Leaderboard({ teams }: LeaderboardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-900">🏆 Leaderboard</h2>
      </div>

      <div className="divide-y divide-gray-200">
        {teams.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No teams yet
          </div>
        ) : (
          teams.map((team, index) => (
            <div
              key={team.id}
              className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                index === 0 ? 'bg-yellow-50' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-8 text-center">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && (
                      <span className="text-lg font-semibold text-gray-500">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {team.player1_name} & {team.player2_name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {team.wins}W - {team.losses}L
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {team.points}
                  </div>
                  <div className="text-xs text-gray-500">points</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
