import type { CollectionConfig } from 'payload'

import { isSelfOrSuperAdmin, isSuperAdmin, isSuperAdminField } from '../../access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  access: {
    admin: isSuperAdmin,
    create: isSuperAdmin,
    delete: isSuperAdmin,
    read: isSelfOrSuperAdmin,
    update: isSelfOrSuperAdmin,
  },
  admin: {
    defaultColumns: ['fullName', 'email', 'role', 'isActive'],
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
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'editor',
      options: [
        { label: 'Super Admin', value: 'super_admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Welfare Manager', value: 'welfare_manager' },
        { label: 'Moderator', value: 'moderator' },
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
