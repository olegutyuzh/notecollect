'use client'

import { useState, useEffect, useRef } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'
import { Link } from '@/i18n/navigation'
import { Globe, AlertCircle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { select } from 'd3-selection'
import { geoNaturalEarth1, geoPath, geoGraticule } from 'd3-geo'
import { feature, mesh } from 'topojson-client'

// ISO 3166-1 numeric → alpha2 map
const NUM_TO_A2: Record<number, string> = {
  4:'AF',8:'AL',12:'DZ',20:'AD',24:'AO',32:'AR',36:'AU',40:'AT',
  44:'BS',48:'BH',50:'BD',52:'BB',56:'BE',64:'BT',68:'BO',70:'BA',
  72:'BW',76:'BR',84:'BZ',90:'SB',96:'BN',100:'BG',104:'MM',108:'BI',
  112:'BY',116:'KH',120:'CM',124:'CA',132:'CV',140:'CF',144:'LK',148:'TD',
  152:'CL',156:'CN',170:'CO',174:'KM',178:'CG',180:'CD',188:'CR',191:'HR',
  192:'CU',196:'CY',203:'CZ',204:'BJ',208:'DK',212:'DM',214:'DO',
  218:'EC',222:'SV',226:'GQ',231:'ET',232:'ER',233:'EE',242:'FJ',246:'FI',
  250:'FR',266:'GA',268:'GE',270:'GM',276:'DE',288:'GH',300:'GR',308:'GD',
  320:'GT',324:'GN',328:'GY',332:'HT',340:'HN',344:'HK',348:'HU',
  356:'IN',360:'ID',364:'IR',368:'IQ',372:'IE',376:'IL',380:'IT',
  388:'JM',392:'JP',398:'KZ',400:'JO',404:'KE',408:'KP',410:'KR',
  414:'KW',417:'KG',418:'LA',422:'LB',426:'LS',428:'LV',430:'LR',
  434:'LY',438:'LI',440:'LT',442:'LU',446:'MO',450:'MG',454:'MW',
  458:'MY',462:'MV',466:'ML',470:'MT',478:'MR',480:'MU',484:'MX',
  496:'MN',498:'MD',499:'ME',504:'MA',508:'MZ',512:'OM',516:'NA',
  520:'NR',524:'NP',528:'NL',548:'VU',554:'NZ',558:'NI',562:'NE',
  566:'NG',578:'NO',586:'PK',591:'PA',598:'PG',600:'PY',604:'PE',
  608:'PH',616:'PL',620:'PT',630:'PR',634:'QA',642:'RO',643:'RU',
  646:'RW',682:'SA',686:'SN',688:'RS',694:'SL',703:'SK',704:'VN',
  705:'SI',706:'SO',710:'ZA',716:'ZW',724:'ES',728:'SS',736:'SD',
  740:'SR',752:'SE',756:'CH',760:'SY',762:'TJ',764:'TH',768:'TG',
  776:'TO',780:'TT',784:'AE',788:'TN',792:'TR',795:'TM',800:'UG',
  804:'UA',807:'MK',818:'EG',826:'GB',834:'TZ',840:'US',858:'UY',
  860:'UZ',862:'VE',887:'YE',894:'ZM',275:'PS',
}

function getColor(count: number): string {
  if (count === 0)  return '#e5e7eb'
  if (count <= 2)   return '#bfdbfe'
  if (count <= 5)   return '#60a5fa'
  if (count <= 15)  return '#f59e0b'
  if (count <= 30)  return '#f97316'
  return '#dc2626'
}

interface CountryStat  { code: string; name: string; flag: string; count: number }
interface IssuerStat   { name: string; count: number }
interface GradeStat    { grade: string; count: number; color: string }
interface YearStat     { year: number; count: number }

const GRADE_COLORS: Record<string, string> = {
  'UNC':'#10b981','AU':'#34d399','XF':'#3b82f6','VF':'#93c5fd',
  'F':'#f59e0b','VG':'#fb923c','G':'#ef4444',
}
const GRADE_ORDER = ['UNC','AU','XF','VF','F','VG','G']

function DonutChart({ data, noDataLabel, totalLabel }: { data: GradeStat[]; noDataLabel: string; totalLabel: string }) {
  const total = data.reduce((s, d) => s + d.count, 0)
  if (total === 0) return <p className="text-sm text-gray-400">{noDataLabel}</p>

  const cx = 70, cy = 70, R = 55, ri = 32
  let angle = -Math.PI / 2
  const arcs = data.map(d => {
    const frac = d.count / total
    const start = angle; angle += frac * 2 * Math.PI; const end = angle
    const large = frac > 0.5 ? 1 : 0
    const x1 = cx + R * Math.cos(start),  y1 = cy + R * Math.sin(start)
    const x2 = cx + R * Math.cos(end),    y2 = cy + R * Math.sin(end)
    const x3 = cx + ri * Math.cos(end),   y3 = cy + ri * Math.sin(end)
    const x4 = cx + ri * Math.cos(start), y4 = cy + ri * Math.sin(start)
    return {
      ...d,
      path: `M${x1.toFixed(2)},${y1.toFixed(2)} A${R},${R},0,${large},1,${x2.toFixed(2)},${y2.toFixed(2)} L${x3.toFixed(2)},${y3.toFixed(2)} A${ri},${ri},0,${large},0,${x4.toFixed(2)},${y4.toFixed(2)} Z`,
    }
  })

  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" viewBox="0 0 140 140" className="flex-shrink-0">
        {arcs.map(a => (
          <path key={a.grade} d={a.path} fill={a.color} stroke="white" strokeWidth="1.5" />
        ))}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="10" fill="#9ca3af">{totalLabel}</text>
        <text x={cx} y={cx + 10} textAnchor="middle" fontSize="20" fontWeight="bold" fill="#111827">{total}</text>
      </svg>
      <div className="space-y-1.5">
        {arcs.map(a => (
          <div key={a.grade} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: a.color }} />
            <span className="font-medium w-8 text-gray-700">{a.grade}</span>
            <span className="text-gray-500">{a.count}</span>
            <span className="text-gray-400 text-xs">({Math.round(a.count / total * 100)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Year bar chart ──────────────────────────────────────────────────────────

function YearChart({ data }: { data: YearStat[] }) {
  const [hovered, setHovered] = useState<YearStat | null>(null)

  if (data.length === 0) return <p className="text-sm text-gray-400">Немає даних</p>

  const maxCount = Math.max(...data.map(d => d.count))
  const BAR_W = Math.max(8, Math.min(28, Math.floor(600 / data.length) - 3))
  const H = 120
  const CHART_W = data.length * (BAR_W + 3)

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: CHART_W + 40 }} className="relative">
        <svg
          width={CHART_W + 8}
          height={H + 40}
          className="overflow-visible"
        >
          {data.map((d, i) => {
            const barH = Math.max(2, Math.round((d.count / maxCount) * H))
            const x = i * (BAR_W + 3)
            const y = H - barH
            const isHov = hovered?.year === d.year
            return (
              <g key={d.year}
                onMouseEnter={() => setHovered(d)}
                onMouseLeave={() => setHovered(null)}
                style={{ cursor: 'default' }}
              >
                <rect
                  x={x} y={y} width={BAR_W} height={barH}
                  rx={3}
                  fill={isHov ? '#2563eb' : '#93c5fd'}
                  className="transition-colors duration-100"
                />
                {/* Year label — every 5 years or first/last */}
                {(d.year % 5 === 0 || i === 0 || i === data.length - 1) && (
                  <text
                    x={x + BAR_W / 2} y={H + 16}
                    textAnchor="middle" fontSize="10" fill="#9ca3af"
                  >
                    {d.year}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* Tooltip */}
        {hovered && (
          <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 pointer-events-none whitespace-nowrap shadow-xl z-10">
            {hovered.year} — {hovered.count} шт.
          </div>
        )}
      </div>
    </div>
  )
}

export default function StatsPage() {
  const t = useTranslations('Stats')
  const [loading, setLoading]           = useState(true)
  const [authError, setAuthError]       = useState(false)
  const [countryStats, setCountryStats] = useState<CountryStat[]>([])
  const [issuerStats, setIssuerStats]   = useState<IssuerStat[]>([])
  const [gradeStats, setGradeStats]     = useState<GradeStat[]>([])
  const [yearStats, setYearStats]       = useState<YearStat[]>([])
  const [summary, setSummary]           = useState({ items: 0, types: 0, countries: 0, forSwap: 0 })
  const [tooltip, setTooltip]           = useState<{ x: number; y: number; html: string } | null>(null)
  const [mapError, setMapError]         = useState(false)

  const mapRef       = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const supabase = createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) { setAuthError(true); setLoading(false); return }

      const { data: items, error } = await supabase
        .from('collected_items')
        .select(`
          quantity,
          grade,
          for_swap,
          collectibles!inner(
            id,
            issuer_name,
            min_year,
            countries(id, code, name_uk, name_en, flag_emoji)
          )
        `)
        .eq('user_id', user.id)

      if (error || !items) { setLoading(false); return }

      type RawItem = {
        quantity: number
        grade: string | null
        for_swap: boolean
        collectibles: {
          id: number
          issuer_name: string | null
          min_year: number | null
          countries: { id: number; code: string | null; name_uk: string | null; name_en: string; flag_emoji: string | null } | null
        } | null
      }
      const typedItems = items as unknown as RawItem[]

      const byCountry = new Map<string, CountryStat>()
      const byIssuer  = new Map<string, IssuerStat>()
      const byGrade   = new Map<string, number>()
      const byYear    = new Map<number, number>()
      let totalItems = 0, totalTypes = 0, totalForSwap = 0

      for (const item of typedItems) {
        const qty = item.quantity ?? 1
        totalItems += qty; totalTypes++
        if (item.for_swap) totalForSwap += qty

        if (item.grade) {
          const g = item.grade.toUpperCase()
          byGrade.set(g, (byGrade.get(g) ?? 0) + qty)
        }

        const col = (item.collectibles as any)
        const country = col?.countries
        if (country?.code) {
          const ex = byCountry.get(country.code)
          if (ex) { ex.count += qty }
          else byCountry.set(country.code, {
            code: country.code,
            name: country.name_uk ?? country.name_en ?? country.code,
            flag: country.flag_emoji ?? '',
            count: qty,
          })
        }

        const issuerName = col?.issuer_name as string | null
        if (issuerName) {
          const ex = byIssuer.get(issuerName)
          if (ex) { ex.count += qty }
          else byIssuer.set(issuerName, { name: issuerName, count: qty })
        }

        const year = col?.min_year as number | null
        if (year) {
          byYear.set(year, (byYear.get(year) ?? 0) + qty)
        }
      }

      const grades = GRADE_ORDER
        .filter(g => byGrade.has(g))
        .map(g => ({ grade: g, count: byGrade.get(g)!, color: GRADE_COLORS[g] ?? '#9ca3af' }))

      // Заповнюємо пропущені роки нулями для неперервного графіку
      const yearEntries = [...byYear.entries()].sort((a, b) => a[0] - b[0])
      const filledYears: YearStat[] = []
      if (yearEntries.length > 0) {
        const minY = yearEntries[0][0]
        const maxY = yearEntries[yearEntries.length - 1][0]
        for (let y = minY; y <= maxY; y++) {
          filledYears.push({ year: y, count: byYear.get(y) ?? 0 })
        }
      }

      setCountryStats([...byCountry.values()].sort((a, b) => b.count - a.count))
      setIssuerStats([...byIssuer.values()].sort((a, b) => b.count - a.count))
      setGradeStats(grades)
      setYearStats(filledYears)
      setSummary({ items: totalItems, types: totalTypes, countries: byCountry.size, forSwap: totalForSwap })
      setLoading(false)
    })
  }, [])

  useEffect(() => {
    if (loading || authError || !mapRef.current || !containerRef.current) return

    const countByA2: Record<string, number> = {}
    const infoByA2:  Record<string, string>  = {}
    for (const c of countryStats) {
      countByA2[c.code] = c.count
      infoByA2[c.code]  = `${c.flag} ${c.name} · ${c.count}`
    }

    async function render() {
      let world: any
      try {
        const res = await fetch('/countries-110m.json')
        if (!res.ok) throw new Error('geo fetch failed')
        world = await res.json()
      } catch { setMapError(true); return }

      const el = containerRef.current!
      const W = el.clientWidth || 800
      const H = Math.round(W * 0.5)
      const svg = select(mapRef.current!)
        .attr('width', W).attr('height', H)
        .style('background', '#f1f5f9').style('border-radius', '8px')
      svg.selectAll('*').remove()

      const proj = geoNaturalEarth1().scale(W / 2 / Math.PI).translate([W / 2, H / 2])
      const path = geoPath().projection(proj)
      const countries: any = feature(world, world.objects.countries)

      svg.selectAll('path.country')
        .data(countries.features).join('path').attr('class', 'country')
        .attr('d', path as any)
        .attr('fill', (d: any) => { const a2 = NUM_TO_A2[parseInt(d.id)]; return getColor(a2 ? (countByA2[a2] ?? 0) : 0) })
        .attr('stroke', '#ffffff').attr('stroke-width', 0.4)
        .style('cursor', (d: any) => { const a2 = NUM_TO_A2[parseInt(d.id)]; return a2 && infoByA2[a2] ? 'pointer' : 'default' })
        .on('mousemove', (event: MouseEvent, d: any) => {
          const a2 = NUM_TO_A2[parseInt(d.id)]
          if (!a2 || !infoByA2[a2]) return
          const rect = el.getBoundingClientRect()
          setTooltip({ x: event.clientX - rect.left + 12, y: event.clientY - rect.top - 36, html: infoByA2[a2] })
        })
        .on('mouseleave', () => setTooltip(null))

      svg.append('path').datum(geoGraticule()())
        .attr('fill', 'none').attr('stroke', '#cbd5e1').attr('stroke-width', 0.3).attr('d', path as any)
      svg.append('path').datum(mesh(world, world.objects.countries, (a: any, b: any) => a !== b) as any)
        .attr('fill', 'none').attr('stroke', '#ffffff').attr('stroke-width', 0.5).attr('d', path as any)
    }

    render().catch(() => setMapError(true))
  }, [loading, authError, countryStats])

  if (loading) return (
    <div className="flex items-center justify-center min-h-96">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
    </div>
  )

  if (authError) return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <Globe className="h-12 w-12 text-gray-300 mx-auto mb-4" />
      <h1 className="text-xl font-semibold text-gray-800 mb-4">{t('authRequired')}</h1>
      <div className="flex gap-3 justify-center">
        <Link href="/auth/login" className="btn-secondary">Login</Link>
        <Link href="/auth/register" className="btn-primary">Register</Link>
      </div>
    </div>
  )

  const maxCount = countryStats[0]?.count ?? 1
  const maxIssuerCount = issuerStats[0]?.count ?? 1

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Globe className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: t('items'),     value: summary.items     },
          { label: t('unique'),    value: summary.types     },
          { label: t('countries'), value: summary.countries },
          { label: t('forSwap'),   value: summary.forSwap   },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center py-5">
            <p className="text-3xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* World map */}
      <div className="card p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">{t('mapTitle')}</h2>
        <div ref={containerRef} className="relative w-full">
          {mapError ? (
            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg p-4">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              {t('mapError')}
            </div>
          ) : (
            <svg ref={mapRef} className="w-full" />
          )}
          {tooltip && (
            <div
              className="absolute pointer-events-none bg-gray-900 text-white text-xs rounded-md px-2.5 py-1.5 whitespace-nowrap z-10 shadow-xl"
              style={{ left: tooltip.x, top: tooltip.y }}
            >
              {tooltip.html}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 flex-wrap">
          {[
            { color: '#e5e7eb', label: '0' },
            { color: '#bfdbfe', label: '1-2' },
            { color: '#60a5fa', label: '3-5' },
            { color: '#f59e0b', label: '6-15' },
            { color: '#f97316', label: '16-30' },
            { color: '#dc2626', label: '31+' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-4 h-3 rounded-sm inline-block border border-gray-200" style={{ background: color }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Year distribution */}
      {yearStats.length > 0 && (
        <div className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">По роках випуску</h2>
            <span className="text-xs text-gray-400">
              {yearStats[0]?.year} – {yearStats[yearStats.length - 1]?.year}
              {' · '}{yearStats.filter(y => y.count > 0).length} різних років
            </span>
          </div>
          <YearChart data={yearStats} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Grade donut */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('gradesTitle')}</h2>
          <DonutChart data={gradeStats} noDataLabel={t('noData')} totalLabel={t('total')} />
        </div>

        {/* Top issuers */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Топ емітентів</h2>
          {issuerStats.length === 0 ? (
            <p className="text-sm text-gray-400">{t('noData')}</p>
          ) : (
            <div className="space-y-2">
              {issuerStats.slice(0, 12).map((iss, i) => (
                <div key={iss.name} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{iss.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full bg-blue-400 transition-all"
                        style={{ width: `${Math.round((iss.count / maxIssuerCount) * 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{iss.count}</span>
                  </div>
                </div>
              ))}
              {issuerStats.length > 12 && (
                <p className="text-xs text-gray-400 pt-1">+{issuerStats.length - 12}</p>
              )}
            </div>
          )}
        </div>

        {/* Top countries */}
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">{t('topCountriesTitle')}</h2>
          {countryStats.length === 0 ? (
            <p className="text-sm text-gray-400">{t('noData')}</p>
          ) : (
            <div className="space-y-2">
              {countryStats.slice(0, 12).map((c, i) => (
                <div key={c.code} className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 w-5 text-right">{i + 1}</span>
                  <span className="text-base w-6 text-center leading-none">{c.flag}</span>
                  <span className="text-sm text-gray-700 flex-1 truncate">{c.name}</span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="h-1.5 rounded-full transition-all"
                        style={{ width: `${Math.round((c.count / maxCount) * 100)}%`, background: getColor(c.count) }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-gray-900 w-8 text-right">{c.count}</span>
                  </div>
                </div>
              ))}
              {countryStats.length > 12 && (
                <p className="text-xs text-gray-400 pt-1">+{countryStats.length - 12}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
