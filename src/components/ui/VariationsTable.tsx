'use client'

import { Fragment, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Pencil, Camera, Award, Hash, DollarSign, MessageSquare } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { AddToCollectionModal } from './AddToCollectionModal'
import { EditCollectedItemModal } from './EditCollectedItemModal'
import { DeleteCollectedItemButton } from './DeleteCollectedItemButton'
import type { CollectibleWithRelations, CollectibleVariation, CollectedItem, NumistaSignature } from '@/types/database'

interface UserVariationItem {
  id: number
  collectible_id: number
  collectible_variation_id: number | null
  user_id: string
  grade: string | null
  quantity: number
  for_swap: boolean
  price_value: number | null
  price_currency: string | null
  serial_number: string | null
  private_comment: string | null
  public_comment: string | null
  grading_company: string | null
  grading_company_id: number | null
  slab_grade: string | null
  slab_number: string | null
  grading_designations: unknown
  pictures: unknown
  created_at: string
}

interface Props {
  collectible: CollectibleWithRelations
  variations: CollectibleVariation[]
  userItems: UserVariationItem[]
  isLoggedIn: boolean
}

function sigInitials(sigs: NumistaSignature[]): string {
  return sigs
    .map(s => (s.signer_name ?? '').trim().split(/\s+/).map((p: string) => p[0]?.toUpperCase() ?? '').join(''))
    .join(' / ')
}

function sigFullNames(sigs: NumistaSignature[]): string {
  return sigs.map(s => `${s.signer_name ?? ''}${s.title ? ` (${s.title})` : ''}`).join('\n')
}

function formatPrice(value: number | null, currency: string | null): string | null {
  if (!value) return null
  const sym: Record<string, string> = { USD: '$', EUR: '€', UAH: '₴', GBP: '£', PLN: 'zł' }
  const s = sym[currency ?? ''] ?? (currency ?? '')
  return `${s}${value.toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const GRADE_COLORS: Record<string, string> = {
  UNC: 'bg-emerald-100 text-emerald-800',
  AU:  'bg-teal-100 text-teal-800',
  XF:  'bg-blue-100 text-blue-800',
  VF:  'bg-sky-100 text-sky-800',
  F:   'bg-amber-100 text-amber-800',
  VG:  'bg-orange-100 text-orange-800',
  G:   'bg-red-100 text-red-800',
}

function ItemRow({ item, onEdit }: { item: UserVariationItem; onEdit: () => void }) {
  const hasPics = Array.isArray(item.pictures) && (item.pictures as unknown[]).length > 0
  const price = formatPrice(item.price_value, item.price_currency)
  const gradeColor = item.grade ? (GRADE_COLORS[item.grade.toUpperCase()] ?? 'bg-gray-100 text-gray-700') : ''
  const designations = Array.isArray(item.grading_designations)
    ? (item.grading_designations as { value: string }[])
    : []

  return (
    <div className="flex items-center gap-2 flex-wrap py-1 pl-4 border-l-2 border-blue-200">
      {/* Qty + Grade */}
      <span className="text-sm font-medium text-gray-700 shrink-0">
        {item.quantity > 1 ? `${item.quantity}×` : '1×'}
      </span>
      {item.grade && (
        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${gradeColor}`}>
          {item.grade}
        </span>
      )}

      {/* Photos */}
      {hasPics && (
        <Link href={`/collection/${item.id}`} title="Є фото" className="text-gray-400 hover:text-blue-500">
          <Camera className="h-3.5 w-3.5" />
        </Link>
      )}

      {/* Grading slab */}
      {(item.grading_company || item.slab_grade) && (
        <span className="inline-flex items-center gap-1 text-xs text-gray-600">
          <Award className="h-3 w-3 text-gray-400 shrink-0" />
          {item.grading_company && <span className="font-medium">{item.grading_company}</span>}
          {item.slab_grade && <span className="font-semibold">{item.slab_grade}</span>}
          {designations.map((d, i) => (
            <span key={i} className="text-purple-700 font-medium bg-purple-50 px-1 rounded">
              {d.value}
            </span>
          ))}
          {item.slab_number && (
            item.grading_company?.toUpperCase().includes('PMG') ? (
              <a
                href={`https://www.pmgnotes.com/certlookup/${item.slab_number}/${item.slab_grade ?? ''}/`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline font-mono"
              >
                #{item.slab_number}
              </a>
            ) : (
              <span className="text-blue-600 font-mono">#{item.slab_number}</span>
            )
          )}
        </span>
      )}

      {/* Serial number */}
      {item.serial_number && (
        <span className="inline-flex items-center gap-0.5 text-xs text-gray-600">
          <Hash className="h-3 w-3 text-gray-400 shrink-0" />
          <span className="font-mono">{item.serial_number}</span>
        </span>
      )}

      {/* Price */}
      {price && (
        <span className="inline-flex items-center gap-0.5 text-xs text-gray-600">
          <DollarSign className="h-3 w-3 text-gray-400 shrink-0" />
          {price}
        </span>
      )}

      {/* Private comment */}
      {item.private_comment && (
        <span className="inline-flex items-center gap-0.5 text-xs text-gray-400" title={item.private_comment}>
          <MessageSquare className="h-3 w-3 shrink-0" />
          <span className="truncate max-w-[140px]">{item.private_comment}</span>
        </span>
      )}

      {/* Public comment */}
      {item.public_comment && (
        <span className="inline-flex items-center gap-0.5 text-xs text-gray-500" title={item.public_comment}>
          <MessageSquare className="h-3 w-3 shrink-0 text-blue-400" />
          <span className="truncate max-w-[140px]">{item.public_comment}</span>
        </span>
      )}

      {/* For swap */}
      {item.for_swap && (
        <span className="text-xs bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-medium">
          Обмін
        </span>
      )}

      {/* Actions */}
      <span className="ml-auto flex items-center gap-1 shrink-0">
        <button
          onClick={onEdit}
          title="Редагувати"
          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
        >
          <Pencil className="h-3.5 w-3.5" />
        </button>
        <DeleteCollectedItemButton itemId={item.id} />
      </span>
    </div>
  )
}

export function VariationsTable({ collectible, variations, userItems, isLoggedIn }: Props) {
  const router = useRouter()
  const [modalVariation, setModalVariation] = useState<CollectibleVariation | null>(null)
  const [editItem, setEditItem] = useState<CollectedItem | null>(null)

  const itemsByVariation = new Map<number, UserVariationItem[]>()
  for (const item of userItems) {
    if (item.collectible_variation_id) {
      const arr = itemsByVariation.get(item.collectible_variation_id) ?? []
      arr.push(item)
      itemsByVariation.set(item.collectible_variation_id, arr)
    }
  }
  const itemsNoVariation = userItems.filter(i => !i.collectible_variation_id)

  if (variations.length === 0) return null

  const colCount = isLoggedIn ? 4 : 3

  return (
    <div className="mt-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-2">
        Варіанти випуску
        <span className="ml-2 text-gray-400 font-normal">({variations.length})</span>
      </h2>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 w-16">Рік</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Підписи</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 hidden sm:table-cell">Коментар</th>
              {isLoggedIn && <th className="px-3 py-2 w-10" />}
            </tr>
          </thead>
          <tbody>
            {variations.map((v) => {
              const sigs = (v.signatures as NumistaSignature[] | null) ?? []
              const myItems = itemsByVariation.get(v.id) ?? []
              const hasThis = myItems.length > 0

              return (
                <Fragment key={v.id}>
                  {/* Variation row */}
                  <tr className={`border-t border-gray-100 ${hasThis ? 'bg-blue-50/50' : 'hover:bg-gray-50/60'}`}>
                    <td className="px-3 py-2.5 font-medium text-gray-900 tabular-nums">
                      {v.gregorian_year ?? v.year ?? '—'}
                    </td>
                    <td className="px-3 py-2.5">
                      {sigs.length > 0 ? (
                        <span
                          title={sigFullNames(sigs)}
                          className="font-mono text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded cursor-default"
                        >
                          {sigInitials(sigs)}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-gray-500 hidden sm:table-cell max-w-[240px] truncate">
                      {v.comment ?? ''}
                    </td>
                    {isLoggedIn && (
                      <td className="px-2 py-2.5 text-right">
                        <button
                          onClick={() => setModalVariation(v)}
                          title="Додати до колекції"
                          className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-colors ml-auto"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    )}
                  </tr>

                  {/* Inline item rows for this variation */}
                  {hasThis && (
                    <tr className="border-t border-blue-100">
                      <td colSpan={colCount} className="px-4 py-2">
                        <div className="space-y-1.5">
                          {myItems.map((item) => (
                            <ItemRow
                              key={item.id}
                              item={item}
                              onEdit={() => setEditItem(item as unknown as CollectedItem)}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>

        {/* Items with no variation assigned */}
        {isLoggedIn && itemsNoVariation.length > 0 && (
          <div className="border-t border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs text-gray-500 font-medium mb-2">Без конкретного варіанту:</p>
            <div className="space-y-1.5">
              {itemsNoVariation.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  onEdit={() => setEditItem(item as unknown as CollectedItem)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {modalVariation && (
        <AddToCollectionModal
          collectible={collectible}
          variation={modalVariation}
          onClose={() => setModalVariation(null)}
          onSuccess={() => { setModalVariation(null); router.refresh() }}
        />
      )}

      {editItem && (
        <EditCollectedItemModal
          item={editItem}
          onClose={() => { setEditItem(null); router.refresh() }}
        />
      )}
    </div>
  )
}
