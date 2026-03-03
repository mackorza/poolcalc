import { notFound, redirect } from 'next/navigation'
import TournamentEditForm from '@/components/TournamentEditForm'
import { getTournamentById, getTeamsByTournamentId } from '@/lib/db/queries'
import { getSession } from '@/lib/auth'

export const dynamic = 'force-dynamic'

interface TournamentEditPageProps {
  params: Promise<{ id: string }>
}

export default async function TournamentEditPage({ params }: TournamentEditPageProps) {
  if (!(await getSession())) {
    redirect('/login?from=/tournament')
  }

  const { id } = await params

  const tournament = await getTournamentById(id)
  if (!tournament) {
    notFound()
  }

  // Only allow editing during setup
  if (tournament.status !== 'setup') {
    redirect(`/tournament/${id}/admin`)
  }

  const teams = await getTeamsByTournamentId(id)

  // Extract flat player list from teams (ordered by creation)
  const players = teams.flatMap(t => [t.player1_name, t.player2_name])

  return (
    <TournamentEditForm
      tournament={tournament}
      existingPlayers={players}
    />
  )
}
