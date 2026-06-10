import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { Star } from 'lucide-react'
import type { CollectibleWithRelations } from '@/types/database'

interface CollectibleCardProps {
  collectible: CollectibleWithRelations
  inCollection?: boolean
}

const CATEGORY_LABELS: Record<string, string> = {
  BKNT: 'Банкнота',
  COIN: 'Монета',
  EXON: 'Екзонумія',
}

export function CollectibleCard({ collectible, inCollection }: CollectibleCardProps) {
  const country = collectible.countries
  const years = collectible.max_year && collectible.max_year !== collectible.min_year
    ? `${collectible.min_year}–${collectible.max_year}`
    : collectible.min_year?.toString() ?? '—'

  return (
    <Link
      href={`/catalog/${collectible.id}`}
      className="card group overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div className="relative bg-gray-100 aspect-[2/1] overflow-hidden">
        {collectible.obverse_thumbnail ? (
          <Image
            src={collectible.obverse_thumbnail}
            alt={collectible.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-300">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <rect x="2" y="6" width="20" height="12" rx="2" strokeWidth={1.5} />
              <circle cx="12" cy="12" r="3" strokeWidth={1.5} />
            </svg>
          </div>
        )}
        {inCollection && (
          <div className="absolute top-2 right-2">
            <span className="badge bg-green-100 text-green-700">
              <Star className="h-3 w-3 mr-1 fill-current" />
              У колекції
            </span>
          </div>
        )}
        {collectible.category_code !== 'BKNT' && (
          <div className="absolute bottom-2 left-2">
            <span className="badge bg-white/90 text-gray-600 text-xs">
              {CATEGORY_LABELS[collectible.category_code] ?? collectible.category_code}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 truncate text-sm leading-snug">
              {country?.flag_emoji && <span className="mr-1">{country.flag_emoji}</span>}
              {collectible.title}
            </p>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {collectible.issuer_name}
            </p>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap shrink-0">{years}</span>
        </div>
      </div>
    </Link>
  )
}
