import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function TournamentsPage() {
  const supabase = await createClient()

  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*')
    .order('tournament_date', { ascending: false })

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
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white">Tournaments</h1>
            <p className="text-slate-400 mt-2">Browse all pool tournaments</p>
          </div>
          <Link
            href="/admin"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create New Tournament
          </Link>
        </div>

        {!tournaments || tournaments.length === 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-12 text-center">
            <div className="text-6xl mb-4">🎱</div>
            <h2 className="text-2xl font-semibold text-white mb-2">No tournaments yet</h2>
            <p className="text-slate-400 mb-6">Create your first tournament to get started!</p>
            <Link
              href="/admin"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Tournament
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament) => (
              <Link
                key={tournament.id}
                href={`/tournament/${tournament.id}`}
                className="block bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 hover:border-slate-600 hover:bg-slate-800/70 transition-all overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h2 className="text-xl font-bold text-white line-clamp-2">
                      {tournament.venue_name}
                    </h2>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                        tournament.status === 'completed'
                          ? 'bg-green-700 text-green-100'
                          : tournament.status === 'in_progress'
                          ? 'bg-yellow-600 text-yellow-100'
                          : 'bg-slate-600 text-slate-200'
                      }`}
                    >
                      {tournament.status === 'in_progress'
                        ? 'Live'
                        : tournament.status === 'completed'
                        ? 'Finished'
                        : 'Upcoming'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-400">
                    <div className="flex items-center gap-2">
                      <span>📅</span>
                      <span>{formatDate(tournament.tournament_date)}</span>
                    </div>

                    {tournament.venue_location && (
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span className="line-clamp-1">{tournament.venue_location}</span>
                      </div>
                    )}

                    <div className="flex gap-4 mt-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">{tournament.num_tables}</span>
                        <span className="text-xs text-slate-500">
                          {tournament.num_tables === 1 ? 'table' : 'tables'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">{tournament.num_rounds}</span>
                        <span className="text-xs text-slate-500">
                          {tournament.num_rounds === 1 ? 'round' : 'rounds'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-white">{tournament.num_players || 0}</span>
                        <span className="text-xs text-slate-500">
                          {tournament.num_players === 1 ? 'player' : 'players'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-3 bg-slate-900/50 border-t border-slate-700">
                  <span className="text-blue-400 font-medium text-sm hover:text-blue-300">
                    View Tournament →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
