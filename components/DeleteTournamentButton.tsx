'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteTournament } from '@/app/actions/tournament'

interface DeleteTournamentButtonProps {
  tournamentId: string
  tournamentName: string
}

export function DeleteTournamentButton({ tournamentId, tournamentName }: DeleteTournamentButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    setDeleting(true)
    const result = await deleteTournament(tournamentId)
    if (result.error) {
      alert(result.error)
      setDeleting(false)
      setConfirming(false)
    } else {
      router.refresh()
    }
  }

  if (confirming) {
    return (
      <div className="flex gap-1">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:bg-slate-600"
        >
          {deleting ? '...' : 'Confirm'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="px-3 py-1.5 bg-slate-600 text-white text-sm rounded-lg hover:bg-slate-500 transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-3 py-1.5 bg-red-700 text-white text-sm rounded-lg hover:bg-red-800 transition-colors"
    >
      Delete
    </button>
  )
}
