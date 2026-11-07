import type { CollectionConfig, GlobalConfig } from 'payload'

const CONTENT = ['super_admin', 'editor']
const NEWS = ['super_admin', 'editor', 'news_editor']

const COLLECTION_ROLES: Record<string, readonly string[]> = {
  posts: NEWS,
  categories: NEWS,
  media: NEWS,
  memos: CONTENT,
  events: CONTENT,
  resources: CONTENT,
  'exco-members': CONTENT,
  appointees: CONTENT,
  'exco-contact-messages': CONTENT,
  'emergency-contacts': CONTENT,
  pages: ['super_admin'],
}

const GLOBAL_ROLES: Record<string, readonly string[]> = {
  'site-settings': CONTENT,
  header: ['super_admin'],
  footer: ['super_admin'],
}

const hiddenUnlessRole =
  (allowed: readonly string[]) =>
  ({ user }: { user?: unknown }): boolean => {
    const role = (user as { role?: string } | null | undefined)?.role
    return !role || !allowed.includes(role)
  }

export function withMenuRules(collections: CollectionConfig[]): CollectionConfig[] {
  return collections.map((collection) => {
    const allowed = COLLECTION_ROLES[collection.slug]
    if (!allowed || collection.admin?.hidden !== undefined) return collection
    return { ...collection, admin: { ...collection.admin, hidden: hiddenUnlessRole(allowed) } }
  })
}

export function withMenuRulesGlobals(globals: GlobalConfig[]): GlobalConfig[] {
  return globals.map((item) => {
    const allowed = GLOBAL_ROLES[item.slug]
    if (!allowed || item.admin?.hidden !== undefined) return item
    return { ...item, admin: { ...item.admin, hidden: hiddenUnlessRole(allowed) } }
  })
}