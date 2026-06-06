import { createServerSupabaseClient } from '@/lib/supabase-server'
import { BanknoteCard } from '@/components/ui/BanknoteCard'
import { CatalogFilters } from '@/components/ui/CatalogFilters'
import { CatalogEmpty } from '@/components/ui/CatalogEmpty'
import { Suspense } from 'react'
import type { BanknoteWithRelations } from '@/types/database'

interface SearchParams {
  q?: string
  country?: string
  currency?: string
  year_from?: string
  year_to?: string
  series?: string
  material?: string
  printer?: string
  pick?: string
  issuer?: string
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const sp = await searchParams
  const supabase = await createServerSupabaseClient()

  let query = supabase
    .from('banknotes')
    .select('*, countries(*), currencies(*)')
    .order('created_at', { ascending: false })

  // Text search across multiple fields
  if (sp.q) {
    query = query.or(
      `denomination_text.ilike.%${sp.q}%,series.ilike.%${sp.q}%,pick_number.ilike.%${sp.q}%,issuer.ilike.%${sp.q}%`
    )
  }
  if (sp.country)   query = query.eq('country_id', sp.country)
  if (sp.currency)  query = query.eq('currency_id', sp.currency)
  if (sp.year_from) query = query.gte('year_from', parseInt(sp.year_from))
  if (sp.year_to)   query = query.lte('year_from', parseInt(sp.year_to))
  if (sp.series)    query = query.ilike('series', `%${sp.series}%`)
  if (sp.material)  query = query.eq('material', sp.material)
  if (sp.printer)   query = query.ilike('printer', `%${sp.printer}%`)
  if (sp.pick)      query = query.ilike('pick_number', `%${sp.pick}%`)
  if (sp.issuer)    query = query.ilike('issuer', `%${sp.issuer}%`)

  const { data: banknotes } = await query.limit(120)

  const [{ data: countries }, { data: currencies }, { data: issuerRows }] = await Promise.all([
    supabase.from('countries').select('id, name_uk, name_en, flag_emoji, code').order('name_uk'),
    supabase.from('currencies').select('id, name_uk, name_en, code, symbol').order('code'),
    supabase.from('banknotes').select('issuer').not('issuer', 'is', null),
  ])

  const issuers = [...new Set(
    (issuerRows ?? []).map(r => r.issuer).filter(Boolean) as string[]
  )].sort()

  const hasSearch = Object.values(sp).some(Boolean)

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Каталог банкнот</h1>
        <p className="text-gray-500 text-sm">{banknotes?.length ?? 0} записів</p>
      </div>

      <Suspense fallback={<div className="h-16 mb-8 card rounded-xl animate-pulse bg-gray-100" />}>
        <CatalogFilters countries={countries ?? []} currencies={currencies ?? []} issuers={issuers} />
      </Suspense>

      {!banknotes?.length ? (
        <CatalogEmpty hasSearch={hasSearch} />
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
