import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getAllTournaments } from '@/lib/db/queries'
import { LogoutButton } from '@/components/LogoutButton'
import { DeleteTournamentButton } from '@/components/DeleteTournamentButton'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  if (!(await getSession())) {
    redirect('/login?from=/admin')
  }

  const tournaments = await getAllTournaments()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">PoolCalc Admin</h1>
            <p className="text-slate-400 mt-1">Manage your tournaments</p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/admin/create"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              + New Tournament
            </Link>
            <LogoutButton />
          </div>
        </div>

        {/* Tournament List */}
        {!tournaments || tournaments.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-12 text-center">
            <div className="text-6xl mb-4">🎱</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No tournaments yet</h2>
            <p className="text-slate-400 mb-6">Create your first tournament to get started!</p>
            <Link
              href="/admin/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Tournament
            </Link>
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Tournament</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Status</th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-slate-400">Players</th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-slate-400">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tournaments.map((tournament) => (
                    <tr key={tournament.id} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                      <td className="px-6 py-4">
                        <div className="text-white font-medium">{tournament.venue_name}</div>
                        {tournament.venue_location && (
                          <div className="text-sm text-slate-500">{tournament.venue_location}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm whitespace-nowrap">
                        {formatDate(tournament.tournament_date)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tournament.status === 'completed'
                            ? 'bg-green-700 text-green-100'
                            : tournament.status === 'in_progress'
                            ? 'bg-yellow-600 text-yellow-100'
                            : 'bg-slate-600 text-slate-200'
                        }`}>
                          {tournament.status === 'in_progress' ? 'In Progress' :
                           tournament.status === 'completed' ? 'Completed' : 'Setup'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-300 text-sm">
                        {tournament.num_players || 0}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/tournament/${tournament.id}/admin`}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            Manage
                          </Link>
                          {tournament.status === 'setup' && (
                            <Link
                              href={`/tournament/${tournament.id}/edit`}
                              className="px-3 py-1.5 bg-amber-600 text-white text-sm rounded-lg hover:bg-amber-700 transition-colors"
                            >
                              Edit
                            </Link>
                          )}
                          <Link
                            href={`/tournament/${tournament.id}`}
                            className="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-500 transition-colors"
                          >
                            View
                          </Link>
                          <DeleteTournamentButton
                            tournamentId={tournament.id}
                            tournamentName={tournament.venue_name}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
