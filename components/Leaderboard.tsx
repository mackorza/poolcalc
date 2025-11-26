'use client'

import { Database } from '@/lib/types/database'

type Team = Database['public']['Tables']['teams']['Row']

interface LeaderboardProps {
  teams: Team[]
}

export default function Leaderboard({ teams }: LeaderboardProps) {
  return (
    <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden border border-slate-700">
      <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">🏆 Leaderboard</h2>
      </div>

      <div className="divide-y divide-slate-700">
        {teams.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No teams yet
          </div>
        ) : (
          teams.map((team, index) => (
            <div
              key={team.id}
              className={`px-6 py-4 hover:bg-slate-700 transition-colors ${
                index === 0 ? 'bg-yellow-900/30' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex-shrink-0 w-8 text-center">
                    {index === 0 && <span className="text-2xl">🥇</span>}
                    {index === 1 && <span className="text-2xl">🥈</span>}
                    {index === 2 && <span className="text-2xl">🥉</span>}
                    {index > 2 && (
                      <span className="text-lg font-semibold text-slate-400">
                        {index + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="font-semibold text-slate-100">
                      {team.player1_name} & {team.player2_name}
                    </div>
                    <div className="text-sm text-slate-400">
                      {team.wins}W - {team.losses}L
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-400">
                    {team.points}
                  </div>
                  <div className="text-xs text-slate-500">points</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
