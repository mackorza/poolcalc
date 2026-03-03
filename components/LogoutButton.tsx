'use client'

import { logoutAction } from '@/app/actions/auth'

export function LogoutButton() {
  return (
    <button
      type="button"
      onClick={() => logoutAction()}
      className="px-6 py-3 bg-red-700 text-white rounded-lg font-semibold hover:bg-red-800 transition-colors"
    >
      Logout
    </button>
  )
}
