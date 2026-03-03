'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { updateTournament } from '@/app/actions/tournament'
import { getRecommendedRounds } from '@/lib/tournament/utils'
import { determinePlayoffFormat } from '@/lib/tournament/playoff-utils'
import type { Tournament } from '@/lib/db/types'

interface TournamentEditFormProps {
  tournament: Tournament
  existingPlayers: string[]
}

export default function TournamentEditForm({ tournament, existingPlayers }: TournamentEditFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [venueName, setVenueName] = useState(tournament.venue_name)
  const [venueLocation, setVenueLocation] = useState(tournament.venue_location || '')
  const [tournamentDate, setTournamentDate] = useState(tournament.tournament_date)
  const [startTime, setStartTime] = useState(tournament.start_time || '')
  const [numTables, setNumTables] = useState(tournament.num_tables)
  const [numRounds, setNumRounds] = useState(tournament.num_rounds)
  const [playerInput, setPlayerInput] = useState('')
  const [players, setPlayers] = useState<string[]>(existingPlayers)
  const [tournamentFormat, setTournamentFormat] = useState<'round_robin' | 'pool_playoff'>(
    tournament.tournament_format
  )

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const playerCountChanged = players.length !== existingPlayers.length
  const formatChanged = tournamentFormat !== tournament.tournament_format
  const tablesChanged = numTables !== tournament.num_tables
  const willRegenerate = playerCountChanged || formatChanged || tablesChanged

  // Calculate recommended rounds
  const recommendation = useMemo(() => {
    if (tournamentFormat === 'round_robin' && players.length >= 2 && players.length % 2 === 0) {
      return getRecommendedRounds(players.length, numTables)
    }
    return null
  }, [players.length, numTables, tournamentFormat])

  useEffect(() => {
    if (recommendation && tournamentFormat === 'round_robin') {
      setNumRounds(recommendation.recommended)
    }
  }, [recommendation, tournamentFormat])

  const playoffInfo = useMemo(() => {
    if (tournamentFormat === 'pool_playoff' && players.length >= 2 && players.length % 2 === 0) {
      const numTeams = players.length / 2
      return determinePlayoffFormat(numTeams)
    }
    return null
  }, [players.length, tournamentFormat])

  const handleAddPlayer = () => {
    if (playerInput.trim()) {
      setPlayers([...players, playerInput.trim()])
      setPlayerInput('')
    }
  }

  const handleRemovePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index))
    if (editingIndex === index) {
      setEditingIndex(null)
      setEditingValue('')
    }
  }

  const handleStartEdit = (index: number) => {
    setEditingIndex(index)
    setEditingValue(players[index])
  }

  const handleSaveEdit = () => {
    if (editingIndex !== null && editingValue.trim()) {
      const newPlayers = [...players]
      newPlayers[editingIndex] = editingValue.trim()
      setPlayers(newPlayers)
    }
    setEditingIndex(null)
    setEditingValue('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const result = await updateTournament({
        tournamentId: tournament.id,
        venueName,
        venueLocation: venueLocation || undefined,
        tournamentDate,
        startTime: startTime || undefined,
        numTables,
        numRounds,
        playerNames: players,
        tournamentFormat,
      })

      if (result.error) {
        setError(result.error)
      } else {
        router.push(`/tournament/${tournament.id}/admin`)
      }
    } catch (err) {
      setError('Failed to update tournament')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg border border-slate-700 p-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold text-white">Edit Tournament</h1>
            <button
              type="button"
              onClick={() => router.push(`/tournament/${tournament.id}/admin`)}
              className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="text-slate-400 mb-8">Modify tournament settings and players</p>

          {willRegenerate && (
            <div className="mb-6 p-4 bg-amber-900/30 border border-amber-700 rounded-lg">
              <p className="text-amber-300 text-sm font-medium">
                Teams and match schedule will be regenerated when you save.
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Venue Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Venue Information</h2>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Venue Location
                </label>
                <input
                  type="text"
                  value={venueLocation}
                  onChange={(e) => setVenueLocation(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tournament Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={tournamentDate}
                    onChange={(e) => setTournamentDate(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>

            {/* Tournament Settings */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Tournament Settings</h2>

              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">
                  Tournament Format *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setTournamentFormat('round_robin')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      tournamentFormat === 'round_robin'
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tournamentFormat === 'round_robin' ? 'border-blue-500' : 'border-slate-500'
                      }`}>
                        {tournamentFormat === 'round_robin' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <span className="font-semibold text-white">Round-Robin</span>
                    </div>
                    <p className="text-xs text-slate-400 ml-6">
                      Every team plays every other team
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTournamentFormat('pool_playoff')}
                    className={`p-4 rounded-lg border-2 transition-all text-left ${
                      tournamentFormat === 'pool_playoff'
                        ? 'border-blue-500 bg-blue-900/30'
                        : 'border-slate-600 hover:border-slate-500 bg-slate-700/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                        tournamentFormat === 'pool_playoff' ? 'border-blue-500' : 'border-slate-500'
                      }`}>
                        {tournamentFormat === 'pool_playoff' && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <span className="font-semibold text-white">Pool + Playoffs</span>
                    </div>
                    <p className="text-xs text-slate-400 ml-6">
                      Pool stage → Knockout playoffs
                    </p>
                  </button>
                </div>

                {playoffInfo && tournamentFormat === 'pool_playoff' && (
                  <div className="mt-3 p-3 bg-blue-900/30 rounded-lg border border-blue-700">
                    <p className="text-sm text-blue-300 font-medium mb-1">
                      Pool + Playoff Format
                    </p>
                    <ul className="text-xs text-blue-200 space-y-1">
                      <li>• {playoffInfo.numPools} pools of {playoffInfo.teamsPerPool} teams</li>
                      <li>• Top {playoffInfo.teamsQualify} from each pool advance</li>
                      <li>• Knockout: {playoffInfo.playoffStages.join(' → ')}</li>
                    </ul>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Number of Tables *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={numTables}
                    onChange={(e) => setNumTables(parseInt(e.target.value))}
                    className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                  />
                </div>

                {tournamentFormat === 'round_robin' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Number of Rounds *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={numRounds}
                      onChange={(e) => setNumRounds(parseInt(e.target.value))}
                      className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white"
                    />
                    {recommendation && (
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setNumRounds(recommendation.recommended)}
                          className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                        >
                          Use recommended: {recommendation.recommended} rounds
                        </button>
                        <p className="text-xs text-slate-500 mt-1">
                          {recommendation.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {tournamentFormat === 'pool_playoff' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">
                      Pool Stage Rounds
                    </label>
                    <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600">
                      <p className="text-sm text-slate-300">
                        Auto-calculated based on pool size
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Players */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Players</h2>
              <p className="text-sm text-slate-400">
                Click a player name to edit it. Add or remove players as needed.
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
                  className="flex-1 px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder:text-slate-500"
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
                <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">
                      Players ({players.length})
                    </span>
                    {players.length % 2 !== 0 && (
                      <span className="text-sm text-red-400">
                        Need even number of players
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {players.map((player, index) => (
                      <div key={index}>
                        {editingIndex === index ? (
                          <div className="flex items-center gap-1 bg-slate-600/50 px-2 py-1 rounded-full border border-blue-500">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault()
                                  handleSaveEdit()
                                }
                                if (e.key === 'Escape') {
                                  setEditingIndex(null)
                                  setEditingValue('')
                                }
                              }}
                              autoFocus
                              className="w-24 bg-transparent text-sm text-white outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleSaveEdit}
                              className="text-green-400 hover:text-green-300 text-sm font-bold"
                            >
                              ✓
                            </button>
                            <button
                              type="button"
                              onClick={() => { setEditingIndex(null); setEditingValue('') }}
                              className="text-slate-400 hover:text-slate-300 text-sm"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 bg-slate-600/50 px-3 py-1 rounded-full border border-slate-500">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(index)}
                              className="text-sm text-white hover:text-blue-300 transition-colors"
                            >
                              {player}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemovePlayer(index)}
                              className="text-red-400 hover:text-red-300"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || players.length < 2 || players.length % 2 !== 0}
              className="w-full py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-slate-600 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
