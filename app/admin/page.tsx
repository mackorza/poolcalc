'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { createTournament } from '@/app/actions/tournament'
import { getRecommendedRounds } from '@/lib/tournament/utils'

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [venueName, setVenueName] = useState('')
  const [venueLocation, setVenueLocation] = useState('')
  const [tournamentDate, setTournamentDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [numTables, setNumTables] = useState(3)
  const [numRounds, setNumRounds] = useState(5)
  const [playerInput, setPlayerInput] = useState('')
  const [players, setPlayers] = useState<string[]>([])

  // Calculate recommended rounds based on players and tables
  const recommendation = useMemo(() => {
    if (players.length >= 2 && players.length % 2 === 0) {
      return getRecommendedRounds(players.length, numTables)
    }
    return null
  }, [players.length, numTables])

  const handleAddPlayer = () => {
    if (playerInput.trim()) {
      setPlayers([...players, playerInput.trim()])
      setPlayerInput('')
    }
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await createTournament({
        venueName,
        venueLocation: venueLocation || undefined,
        tournamentDate,
        startTime: startTime || undefined,
        numTables,
        numRounds,
        playerNames: players,
      })

      if (result.error) {
        setError(result.error)
      } else if (result.tournamentId) {
        router.push(`/tournament/${result.tournamentId}`)
      }
    } catch (err) {
      setError('Failed to create tournament')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Tournament</h1>
          <p className="text-gray-600 mb-8">Set up a new pool tournament</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Venue Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Venue Information</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., Downtown Pool Hall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Venue Location
                </label>
                <input
                  type="text"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="e.g., 123 Main St, City"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tournament Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={tournamentDate}
                    onChange={(e) => setTournamentDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>
              </div>
            </div>

            {/* Tournament Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Tournament Settings</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Tables *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={numTables}
                    onChange={(e) => setNumTables(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number of Rounds *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={numRounds}
                    onChange={(e) => setNumRounds(parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                  {recommendation && (
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => setNumRounds(recommendation.recommended)}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        💡 Use recommended: {recommendation.recommended} rounds
                      </button>
                      <p className="text-xs text-gray-500 mt-1">
                        {recommendation.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Players */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800">Players</h2>
              <p className="text-sm text-gray-600">
                Add player names. Teams will be randomly generated (must be even number of players).
              </p>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={playerInput}
                  onChange={(e) => setPlayerInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddPlayer()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 placeholder:text-gray-400"
                  placeholder="Enter player name"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Add
                </button>
              </div>

              {players.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Players ({players.length})
                    </span>
                    {players.length % 2 !== 0 && (
                      <span className="text-sm text-red-600">
                        Need even number of players
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {players.map((player, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-gray-200"
                      >
                        <span className="text-sm text-gray-900">{player}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePlayer(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || players.length < 2 || players.length % 2 !== 0}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Tournament...' : 'Create Tournament'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
