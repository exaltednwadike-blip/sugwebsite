import type { CollectionConfig } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const Appointees: CollectionConfig = {
  slug: 'appointees',
  labels: { singular: 'Appointee', plural: 'Appointees' },
  access: {
    create: isEditorOrAbove,
    delete: isEditorOrAbove,
    read: () => true,
    update: isEditorOrAbove,
  },
  admin: {
    defaultColumns: ['fullName', 'position', 'phone', 'sortOrder'],
    description:
      'People appointed to serve under the Office of the President. They appear on the Appointees page. To remove someone, delete them.',
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
      admin: { description: 'The position they hold, for example "Special Adviser on Welfare". You can change this any time.' },
    },
    {
      name: 'phone',
      type: 'text',
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
      admin: { description: 'Lower numbers come first.' },
    },
  ],
}