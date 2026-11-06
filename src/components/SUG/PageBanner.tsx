export function PageBanner({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <section className="rs-banner">
      <div className="rs-wrap">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
    </section>
  )
}