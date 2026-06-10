'use client'

import { useState, useTransition } from 'react'
import { updateUserRole } from './actions'

interface Props {
  userId: string
  currentRole: 'user' | 'admin'
  isSelf: boolean
}

export function RoleToggle({ userId, currentRole, isSelf }: Props) {
  const [role, setRole] = useState(currentRole)
  const [pending, startTransition] = useTransition()

  function toggle() {
    const next = role === 'admin' ? 'user' : 'admin'
    startTransition(async () => {
      await updateUserRole(userId, next)
      setRole(next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={pending || isSelf}
      title={isSelf ? 'Не можна змінити власну роль' : undefined}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium transition-colors border ${
        role === 'admin'
          ? 'bg-violet-50 text-violet-700 border-violet-200 hover:bg-violet-100'
          : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
      } ${(pending || isSelf) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      {pending ? '...' : role === 'admin' ? '👑 admin' : '👤 user'}
    </button>
  )
}
