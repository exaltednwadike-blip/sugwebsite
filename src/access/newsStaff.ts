import type { Access } from 'payload'

const NEWS_ROLES = ['super_admin', 'editor', 'news_editor']

/** Who may create, edit and delete news posts and media. */
export const isNewsStaff: Access = ({ req: { user } }) =>
  Boolean(user && user.isActive === true && NEWS_ROLES.includes(String(user.role)))