import type { Payload } from 'payload'

type StaffUser = {
  fullName?: string | null
  name?: string | null
  email?: string | null
  role?: string | null
  position?: string | null
}

type Props = { payload?: Payload; user?: unknown }

type LinkItem = { href: string; label: string; badge?: number }

const ROLE_LABELS: Record<string, string> = {
  super_admin: 'Super Admin',
  editor: 'Content Editor',
  news_editor: 'News Editor',
  welfare_manager: 'Welfare Manager',
  moderator: 'Moderator',
}

const ROLE_HINTS: Record<string, string> = {
  super_admin: 'You can manage everything on the website.',
  editor: 'You manage news, memos, events, resources and executive pages.',
  news_editor: 'You write and publish news posts.',
  welfare_manager: 'You handle anonymous welfare tickets and Lost & Found.',
  moderator: 'You review Lost & Found reports and claims.',
}

const POSITION_LABELS: Record<string, string> = {
  president: 'President',
  speaker: 'Speaker',
  director_welfare: 'Director of Welfare',
  cso_1: 'Chief Security Officer 1',
  cso_2: 'Chief Security Officer 2',
  pro: 'PRO',
  website_admin: 'Website Administrator',
  other: 'Staff',
}

const link = (slug: string, label: string): LinkItem => ({
  href: `/admin/collections/${slug}`,
  label,
})

async function countPendingItems(payload?: Payload): Promise<number> {
  if (!payload) return 0
  try {
    const r = await payload.count({
      collection: 'lost-found-items',
      where: { status: { equals: 'pending' } },
      overrideAccess: true,
    })
    return r.totalDocs
  } catch {
    return 0
  }
}

async function countNewTickets(payload?: Payload): Promise<number> {
  if (!payload) return 0
  try {
    const r = await payload.count({
      collection: 'welfare-tickets',
      where: { status: { equals: 'new' } },
      overrideAccess: true,
    })
    return r.totalDocs
  } catch {
    return 0
  }
}

function linksFor(role: string, pendingItems: number, newTickets: number): LinkItem[] {
  const content: LinkItem[] = [
    link('posts', 'News posts'),
    link('memos', 'Memos'),
    link('events', 'Events'),
    link('resources', 'Resources'),
    link('exco-members', 'Executives'),
    link('emergency-contacts', 'Emergency contacts'),
    link('exco-contact-messages', 'Contact messages'),
    link('media', 'Media library'),
  ]
  const lostFound: LinkItem[] = [
    {
      href: '/admin/collections/lost-found-items?where[status][equals]=pending',
      label: 'Lost & Found: pending review',
      badge: pendingItems,
    },
    link('lost-found-items', 'All Lost & Found items'),
    link('lost-found-claims', 'Lost & Found claims'),
  ]
  const welfare: LinkItem[] = [
    {
      href: '/admin/collections/welfare-tickets?where[status][equals]=new',
      label: 'Welfare: new tickets',
      badge: newTickets,
    },
    link('welfare-tickets', 'All welfare tickets'),
    link('welfare-ticket-messages', 'Welfare messages'),
  ]

  if (role === 'super_admin') return [...content, ...lostFound, ...welfare, link('users', 'Users')]
  if (role === 'editor') return content
  if (role === 'news_editor') return [link('posts', 'News posts'), link('media', 'Media library')]
  if (role === 'welfare_manager') return [...welfare, ...lostFound]
  if (role === 'moderator') return lostFound
  return []
}

export const SugDashboard = async ({ payload, user }: Props) => {
  const u = (user ?? null) as StaffUser | null
  const role = u?.role ?? ''
  const canLostFound = role === 'super_admin' || role === 'welfare_manager' || role === 'moderator'
  const canWelfare = role === 'super_admin' || role === 'welfare_manager'

  const pending = canLostFound ? await countPendingItems(payload) : 0
  const newTickets = canWelfare ? await countNewTickets(payload) : 0
  const links = linksFor(role, pending, newTickets)
  const who = u?.fullName || u?.name || u?.email || 'there'
  const title = POSITION_LABELS[u?.position ?? ''] ?? ROLE_LABELS[role] ?? 'Staff'

  return (
    <div
      style={{
        background: '#F3FAF5',
        border: '1px solid #D5E8DB',
        borderRadius: 16,
        marginBottom: 24,
        padding: 20,
      }}
    >
      <h2 style={{ color: '#0A3D2A', margin: '0 0 4px' }}>Welcome, {who}</h2>
      <p style={{ color: '#3d5a4c', margin: '0 0 4px' }}>
        <strong>{title}</strong> &middot; {ROLE_LABELS[role] ?? 'Staff'} access
      </p>
      <p style={{ color: '#3d5a4c', margin: '0 0 14px' }}>
        {ROLE_HINTS[role] ?? 'Ask a Super Admin to give your account a role.'}
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {links.map((l) => (
          <a
            href={l.href}
            key={l.href}
            style={{
              alignItems: 'center',
              background: '#12804A',
              borderRadius: 999,
              color: '#fff',
              display: 'inline-flex',
              fontWeight: 600,
              gap: 8,
              padding: '8px 16px',
              textDecoration: 'none',
            }}
          >
            {l.label}
            {l.badge && l.badge > 0 ? (
              <span
                style={{
                  background: '#C6F432',
                  borderRadius: 999,
                  color: '#0A3D2A',
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '1px 8px',
                }}
              >
                {l.badge}
              </span>
            ) : null}
          </a>
        ))}
      </div>

      <div
        style={{
          background: '#fff',
          border: '1px solid #D5E8DB',
          borderRadius: 12,
          color: '#0A3D2A',
          padding: 12,
        }}
      >
        <strong>How to delete</strong>
        <ul style={{ margin: '6px 0 0', paddingLeft: 20 }}>
          <li>Many items: open a list, tick the boxes, then click Delete.</li>
          <li>One item: open it, click the three dots at the top right, then Delete.</li>
        </ul>
      </div>
    </div>
  )
}