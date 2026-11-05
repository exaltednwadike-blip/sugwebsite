import type { CollectionConfig } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const ExcoMembers: CollectionConfig<'exco-members'> = {
  slug: 'exco-members',
  access: {
    create: isEditorOrAbove,
    delete: isEditorOrAbove,
    read: () => ({
      isCurrent: {
        equals: true,
      },
    }),
    update: isEditorOrAbove,
  },
  admin: {
    defaultColumns: ['fullName', 'position', 'isSpotlight', 'sortOrder', 'isCurrent'],
    group: 'SUG',
    useAsTitle: 'fullName',
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'position',
      type: 'text',
      required: true,
    },
    {
      name: 'portfolio',
      type: 'textarea',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'officeHours',
      type: 'text',
    },
    {
      name: 'publicEmail',
      type: 'email',
    },
    {
      name: 'publicPhone',
      type: 'text',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isSpotlight',
      type: 'checkbox',
      defaultValue: false,
    },
    {
      name: 'isCurrent',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
