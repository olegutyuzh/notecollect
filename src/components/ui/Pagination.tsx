import { Link } from '@/i18n/navigation'

interface Props {
  currentPage: number
  totalPages: number
  getHref: (page: number) => string
}

export function Pagination({ currentPage, totalPages, getHref }: Props) {
  if (totalPages <= 1) return null

  // Build page number list with ellipsis
  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  const base = 'inline-flex items-center justify-center w-9 h-9 rounded-lg text-sm font-medium transition-colors select-none'

  return (
    <div className="flex items-center justify-center gap-1 mt-8 pb-4">
      {/* Prev */}
      {currentPage > 1 ? (
        <Link href={getHref(currentPage - 1)} className={`${base} border border-gray-200 text-gray-600 hover:bg-gray-100`}>
          ‹
        </Link>
      ) : (
        <span className={`${base} border border-gray-100 text-gray-300 cursor-not-allowed`}>‹</span>
      )}

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className={`${base} text-gray-400`}>…</span>
        ) : (
          <Link
            key={p}
            href={getHref(p)}
            className={`${base} ${
              p === currentPage
                ? 'bg-blue-600 text-white shadow-sm'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-100'
            }`}
          >
            {p}
          </Link>
        )
      )}

      {/* Next */}
      {currentPage < totalPages ? (
        <Link href={getHref(currentPage + 1)} className={`${base} border border-gray-200 text-gray-600 hover:bg-gray-100`}>
          ›
        </Link>
      ) : (
        <span className={`${base} border border-gray-100 text-gray-300 cursor-not-allowed`}>›</span>
      )}
    </div>
  )
}
