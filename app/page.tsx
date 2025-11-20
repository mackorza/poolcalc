import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
      <main className="flex flex-col items-center gap-8 p-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-gray-900">
            Pool<span className="text-blue-600">Calc</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl">
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
            className="px-8 py-4 bg-white text-blue-600 border-2 border-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
          >
            View Tournaments
          </Link>
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl">
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎱</div>
            <h3 className="font-semibold text-lg mb-2">Random Teams</h3>
            <p className="text-gray-600 text-sm">
              Auto-generate randomized teams from your player list
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="font-semibold text-lg mb-2">Live Leaderboard</h3>
            <p className="text-gray-600 text-sm">
              Real-time standings that update as matches complete
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="font-semibold text-lg mb-2">Round-Robin</h3>
            <p className="text-gray-600 text-sm">
              Automatic scheduling for fair tournament brackets
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
