import Link from 'next/link'

export function Pager({
  label,
  page,
  totalPages,
  hrefFor,
}: {
  label: string
  page: number
  totalPages: number
  hrefFor: (page: number) => string
}) {
  if (totalPages <= 1) return null
  const start = Math.max(1, Math.min(page - 2, totalPages - 4))
  const end = Math.min(totalPages, start + 4)
  const pages: number[] = []
  for (let i = start; i <= end; i++) pages.push(i)

  return (
    <nav aria-label={label} className="rs-pager">
      {page > 1 ? (
        <Link aria-label="Previous page" className="rs-page" href={hrefFor(page - 1)}>
          &lt;
        </Link>
      ) : (
        <span aria-hidden="true" className="rs-page is-disabled">
          &lt;
        </span>
      )}
      {pages.map((p) => (
        <Link
          aria-current={p === page ? 'page' : undefined}
          className={p === page ? 'rs-page is-current' : 'rs-page'}
          href={hrefFor(p)}
          key={p}
        >
          {p}
        </Link>
      ))}
      {page < totalPages ? (
        <Link aria-label="Next page" className="rs-page" href={hrefFor(page + 1)}>
          &gt;
        </Link>
      ) : (
        <span aria-hidden="true" className="rs-page is-disabled">
          &gt;
        </span>
      )}
    </nav>
  )
}