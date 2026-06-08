import { createServerSupabaseClient } from '@/lib/supabase-server'
import { CollectibleCard } from '@/components/ui/CollectibleCard'
import { CatalogFilters } from '@/components/ui/CatalogFilters'
import { CatalogEmpty } from '@/components/ui/CatalogEmpty'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import type { CollectibleWithRelations } from '@/types/database'

interface SearchParams {
  q?: string
  issuer?: string
  category?: string
  year_from?: string
  year_to?: string
}

export default async function CatalogPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()
  const t = await getTranslations('Catalog')

  let query = supabase
    .from('collectibles')
    .select('*, countries(*)')
    .order('id', { ascending: false })

  if (sp.q)         query = query.ilike('title', `%${sp.q}%`)
  if (sp.issuer)    query = query.ilike('issuer_name', `%${sp.issuer}%`)
  if (sp.category)  query = query.eq('category', sp.category)
  if (sp.year_from) query = query.gte('min_year', parseInt(sp.year_from))
  if (sp.year_to)   query = query.lte('max_year', parseInt(sp.year_to))

  const { data: collectibles } = await query.limit(120)

  const { data: issuerRows } = await supabase
    .from('collectibles')
    .select('issuer_name')
    .not('issuer_name', 'is', null)
    .order('issuer_name')
    .limit(2000)

  const issuers = [
    ...new Set((issuerRows ?? []).map(r => r.issuer_name).filter(Boolean) as string[])
  ].sort()

  const hasSearch = Object.values(sp).some(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">{t('title')}</h1>
        <p className="text-gray-500 text-sm">{t('count', { count: collectibles?.length ?? 0 })}</p>
      </div>

      <Suspense fallback={<div className="h-16 mb-8 card rounded-xl animate-pulse bg-gray-100" />}>
        <CatalogFilters issuers={issuers} />
      </Suspense>

      {!collectibles?.length ? (
        <CatalogEmpty hasSearch={hasSearch} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(collectibles as CollectibleWithRelations[]).map((c) => (
            <CollectibleCard key={c.id} collectible={c} />
          ))}
        </div>
      )}
    </div>
  )
}
