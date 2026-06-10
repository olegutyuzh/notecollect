'use client'

import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { EditCollectedItemModal } from './EditCollectedItemModal'
import type { CollectedItem } from '@/types/database'

interface Props {
  item: CollectedItem
  /** Show full label "Редагувати". Defaults to icon-only. */
  showLabel?: boolean
}

export function EditCollectedItemButton({ item, showLabel = false }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Редагувати"
        className={
          showLabel
            ? 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors'
            : 'w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors'
        }
      >
        <Pencil className="h-3.5 w-3.5" />
        {showLabel && 'Редагувати'}
      </button>

      {open && (
        <EditCollectedItemModal
          item={item}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  )
}
