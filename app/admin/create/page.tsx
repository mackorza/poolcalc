import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import CreateTournamentForm from '@/components/CreateTournamentForm'

export const dynamic = 'force-dynamic'

export default async function AdminCreatePage() {
  if (!(await getSession())) {
    redirect('/login?from=/admin/create')
  }

  return (
    <div>
      <div className="max-w-2xl mx-auto px-4 pt-8">
        <Link
          href="/admin"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium"
        >
          &larr; Back to Dashboard
        </Link>
      </div>
      <CreateTournamentForm />
    </div>
  )
}
