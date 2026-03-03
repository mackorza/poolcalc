import { notFound, redirect } from 'next/navigation'
import TournamentAdminView from '@/components/TournamentAdminView'
import { getTournamentById, getTeamsByTournamentId, getMatchesByTournamentId } from '@/lib/db/queries'
import { getSession } from '@/lib/auth'
import type { MatchWithTeams } from '@/lib/db/types'

interface TournamentAdminPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentAdminPage({ params }: TournamentAdminPageProps) {
  if (!(await getSession())) {
    redirect('/login?from=/tournament')
  }

  const { id } = await params

  const tournament = await getTournamentById(id)
  if (!tournament) {
    notFound()
  }

  const teams = await getTeamsByTournamentId(id)
  const matches = await getMatchesByTournamentId(id)

  return (
    <TournamentAdminView
      tournament={tournament}
      teams={teams}
      matches={matches as MatchWithTeams[]}
    />
  )
}
