import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-slate-100">
            Pool<span className="text-blue-500">Calc</span>
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl">
            Manage your pool tournaments with ease. Create teams, schedule matches,
            and track scores in real-time.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link
            href="/admin"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Create Tournament
          </Link>
          <Link
            href="/tournaments"
            className="px-8 py-4 bg-slate-800 text-blue-400 border-2 border-blue-500 rounded-lg font-semibold hover:bg-slate-700 transition-colors"
          >
            View Tournaments
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="text-4xl mb-4">🎱</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-100">Random Teams</h3>
            <p className="text-slate-400 text-sm">
              Auto-generate randomized teams from your player list
            </p>
          </div>
          <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-100">Live Leaderboard</h3>
            <p className="text-slate-400 text-sm">
              Real-time standings that update as matches complete
            </p>
          </div>
          <div className="p-6 bg-slate-800 rounded-lg shadow-lg border border-slate-700">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-semibold text-lg mb-2 text-slate-100">Round-Robin</h3>
            <p className="text-slate-400 text-sm">
              Automatic scheduling for fair tournament brackets
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
