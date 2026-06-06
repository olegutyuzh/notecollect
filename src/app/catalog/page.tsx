import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BanknoteCard } from '@/components/ui/BanknoteCard'
import { CatalogFilters } from '@/components/ui/CatalogFilters'
import { CatalogEmpty } from '@/components/ui/CatalogEmpty'
import { Suspense } from 'react'
import type { BanknoteWithRelations } from '@/types/database'

interface SearchParams {
  q?: string
  country?: string
  year?: string
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('banknotes')
    .select('*, countries(*), currencies(*)')
    .order('created_at', { ascending: false })

  if (searchParams.q) {
    query = query.or(
      `denomination_text.ilike.%${searchParams.q}%,series.ilike.%${searchParams.q}%,pick_number.ilike.%${searchParams.q}%`
    )
  }

  if (searchParams.country) {
    query = query.eq('country_id', searchParams.country)
  }

  const { data: banknotes, error } = await query.limit(60)

  // Fetch countries for filter
  const { data: countries } = await supabase
    .from('countries')
    .select('id, name_uk, name_en, flag_emoji')
    .order('name_uk')

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Каталог банкнот</h1>
        <p className="text-gray-500 text-sm">
          {banknotes?.length ?? 0} записів
        </p>
      </div>

      {/* Filters */}
      <Suspense fallback={<div className="h-12 mb-8" />}>
        <CatalogFilters countries={countries ?? []} />
      </Suspense>

      {/* Grid */}
      {!banknotes?.length ? (
        <CatalogEmpty hasSearch={!!(searchParams.q || searchParams.country)} />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {(banknotes as BanknoteWithRelations[]).map((b) => (
            <BanknoteCard key={b.id} banknote={b} />
          ))}
        </div>
      )}
    </div>
  )
}
