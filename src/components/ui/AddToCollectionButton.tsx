'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { AddToCollectionModal } from './AddToCollectionModal'
import type { BanknoteWithRelations } from '@/types/database'

interface Props {
  banknote: BanknoteWithRelations
}

export function AddToCollectionButton({ banknote }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary w-full justify-center">
        <Plus className="h-4 w-4" />
        Додати до колекції
      </button>

      {open && (
        <AddToCollectionModal
          banknote={banknote}
          onClose={() => setOpen(false)}
          onSuccess={() => setOpen(false)}
        />
      )}
    </>
  )
}
