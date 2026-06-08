import { createServerSupabaseClient } from '@/lib/supabase-server'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Star, Plus } from 'lucide-react'
import type { CollectedItemWithCollectible } from '@/types/database'
import { getTranslations } from 'next-intl/server'

export default async function CollectionPage() {
  const supabase = await createServerSupabaseClient()
  const t = await getTranslations('Collection')
  const tn = await getTranslations('Nav')
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <Star className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h1 className="text-xl font-semibold text-gray-900 mb-2">{t('authRequired')}</h1>
        <p className="text-gray-500 text-sm mb-6">{t('authDesc')}</p>
        <div className="flex gap-3 justify-center">
          <Link href="/auth/login" className="btn-secondary">{tn('login')}</Link>
          <Link href="/auth/register" className="btn-primary">{tn('register')}</Link>
        </div>
      </div>
    )
  }

  const { data: items } = await supabase
    .from('collected_items')
    .select('*, collectibles(*, countries(*))')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const typedItems = items as unknown as CollectedItemWithCollectible[] | null
  const totalItems = typedItems?.reduce((sum, i) => sum + (i.quantity ?? 1), 0) ?? 0
  const uniqueCount = items?.length ?? 0

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {t('subtitle', { unique: uniqueCount, total: totalItems })}
          </p>
        </div>
        <Link href="/catalog" className="btn-primary">
          <Plus className="h-4 w-4" />
          {t('addBtn')}
        </Link>
      </div>

      {!items?.length ? (
        <div className="text-center py-20 text-gray-400">
          <Star className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">{t('emptyTitle')}</p>
          <p className="text-sm mt-1">{t('emptyDesc')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(typedItems ?? []).map((item) => {
            const c = item.collectibles
            const country = c?.countries
            return (
              <Link
                key={item.id}
                href={`/collection/${item.id}`}
                className="card overflow-hidden flex hover:shadow-md hover:ring-1 hover:ring-blue-200 transition-all cursor-pointer"
              >
                <div className="relative w-24 bg-gray-100 shrink-0">
                  {c?.obverse_thumbnail ? (
                    <Image src={c.obverse_thumbnail} alt="" fill className="object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.5} />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {country?.flag_emoji} {c?.title}
                  </p>
                  <p className="text-xs text-gray-500">{c?.issuer_name}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {item.grade && (
                      <span className="badge bg-blue-50 text-blue-700">{item.grade}</span>
                    )}
                    {item.quantity > 1 && (
                      <span className="badge bg-gray-100 text-gray-600">×{item.quantity}</span>
                    )}
                    {item.for_swap && (
                      <span className="badge bg-amber-50 text-amber-700">{t('badges.trade')}</span>
                    )}
                  </div>
                  {item.price_value && (
                    <p className="mt-1 text-xs text-gray-400">
                      {item.price_value} {item.price_currency ?? 'USD'}
                    </p>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
