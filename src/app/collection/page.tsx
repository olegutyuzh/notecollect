import { createServerSupabaseClient } from '@/lib/supabase-server'
import Image from 'next/image'
import Link from 'next/link'
import { Star, Plus } from 'lucide-react'
import { formatGrade } from '@/lib/utils'
import type { CollectionItemWithBanknote } from '@/types/database'

export default async function CollectionPage() {
  const supabase = await createServerSupabaseClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">Увійдіть щоб переглянути колекцію</h1>
        <p className="text-gray-500 text-sm mb-6">
          Реєструйтесь безкоштовно і починайте вести облік своїх банкнот
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login" className="btn-secondary">Увійти</Link>
          <Link href="/auth/register" className="btn-primary">Реєстрація</Link>
        </div>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('user_collections')
    .select('*, banknotes(*, countries(*), currencies(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const totalItems = items?.reduce((sum, i) => sum + (i.quantity ?? 1), 0) ?? 0
  const uniqueBanknotes = items?.length ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Моя колекція</h1>
          <p className="text-gray-500 text-sm mt-1">
            {uniqueBanknotes} унікальних · {totalItems} екземплярів
          </p>
        </div>
        <Link href="/catalog" className="btn-primary">
          <Plus className="h-4 w-4" />
          Додати банкноту
        </Link>
      </div>

      {!items?.length ? (
        <div className="text-center py-20 text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">Колекція порожня</p>
          <p className="text-sm mt-1">Знайдіть банкноту в каталозі та додайте її</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(items as CollectionItemWithBanknote[]).map((item) => {
            const b = item.banknotes
            const country = b?.countries
            return (
              <div key={item.id} className="card overflow-hidden flex">
                {/* Image */}
                <div className="relative w-24 bg-gray-100 shrink-0">
                  {b?.image_obverse_url ? (
                    <Image src={b.image_obverse_url} alt="" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.5} />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {country?.flag_emoji} {b?.denomination_text}
                  </p>
                  <p className="text-xs text-gray-500">{country?.name_uk ?? country?.name_en}</p>

                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.grade && (
                      <span className="badge bg-blue-50 text-blue-700">{item.grade}</span>
                    )}
                    {item.quantity > 1 && (
                      <span className="badge bg-gray-100 text-gray-600">×{item.quantity}</span>
                    )}
                    {item.for_trade && (
                      <span className="badge bg-amber-50 text-amber-700">Обмін</span>
                    )}
                  </div>

                  {item.purchase_price && (
                    <p className="mt-1 text-xs text-gray-400">${item.purchase_price}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
