import { notFound } from 'next/navigation'
import TournamentView from '@/components/TournamentView'
import { getTournamentById, getTeamsByTournamentId, getMatchesByTournamentId } from '@/lib/db/queries'
import type { MatchWithTeams } from '@/lib/db/types'

interface TournamentPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params

  const tournament = await getTournamentById(id)
  if (!tournament) {
    notFound()
  }

  const teams = await getTeamsByTournamentId(id)
  const matches = await getMatchesByTournamentId(id)

  return (
    <TournamentView
      tournament={tournament}
      teams={teams}
      matches={matches as MatchWithTeams[]}
    />
  )
}
