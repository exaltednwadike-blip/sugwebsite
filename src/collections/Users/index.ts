import type { CollectionConfig, PayloadRequest } from 'payload'

import { isSelfOrSuperAdmin, isSuperAdmin, isSuperAdminField } from '../../access/roles'

const STAFF_ROLES = ['super_admin', 'editor', 'news_editor', 'welfare_manager', 'moderator']

const canAccessAdmin = ({ req: { user } }: { req: PayloadRequest }): boolean =>
  Boolean(user && user.isActive === true && STAFF_ROLES.includes(String(user.role)))

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: canAccessAdmin,
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: isSelfOrSuperAdmin,
    update: isSelfOrSuperAdmin,
  },
  admin: {
    defaultColumns: ['fullName', 'position', 'email', 'role', 'isActive'],
    hidden: ({ user }: { user?: unknown }) =>
      (user as { role?: string } | null | undefined)?.role !== 'super_admin',
    useAsTitle: 'fullName',
  },
  auth: true,
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'position',
      type: 'select',
      options: [
        { label: 'President', value: 'president' },
        { label: 'Speaker', value: 'speaker' },
        { label: 'Director of Welfare', value: 'director_welfare' },
        { label: 'Chief Security Officer 1', value: 'cso_1' },
        { label: 'Chief Security Officer 2', value: 'cso_2' },
        { label: 'PRO', value: 'pro' },
        { label: 'Website Administrator', value: 'website_admin' },
        { label: 'Other', value: 'other' },
      ],
      access: {
        update: isSuperAdminField,
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin (full access)', value: 'super_admin' },
        { label: 'Editor (all content)', value: 'editor' },
        { label: 'News Editor (news only)', value: 'news_editor' },
        { label: 'Welfare Manager (welfare and Lost & Found)', value: 'welfare_manager' },
        { label: 'Moderator (Lost & Found only)', value: 'moderator' },
      ],
      access: {
        update: isSuperAdminField,
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      access: {
        update: isSuperAdminField,
      },
    },
  ],
  timestamps: true,
}