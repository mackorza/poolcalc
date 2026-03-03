import { getTournamentById, getTeamsByTournamentId, getMatchesByTournamentId } from '@/lib/db/queries'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const [tournament, teams, matches] = await Promise.all([
    getTournamentById(id),
    getTeamsByTournamentId(id),
    getMatchesByTournamentId(id),
  ])

  if (!tournament) {
    return NextResponse.json({ error: 'Tournament not found' }, { status: 404 })
  }

  return NextResponse.json({ tournament, teams, matches })
}
