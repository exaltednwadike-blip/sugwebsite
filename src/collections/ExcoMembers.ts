import type { CollectionConfig } from 'payload'

import { ALL_OFFICES, officeLabel } from '../lib/offices'
import { isEditorOrAbove } from '../access/roles'

export const ExcoMembers: CollectionConfig<'exco-members'> = {
  slug: 'exco-members',
  labels: { singular: 'Official', plural: 'Officials' },
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
    defaultColumns: ['fullName', 'office', 'position', 'sortOrder', 'isCurrent'],
    group: 'SUG',
    useAsTitle: 'fullName',
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (!data) {
          return data
        }
        const office = typeof data.office === 'string' ? data.office : ''
        if (office && office !== 'house_member') {
          data.position = officeLabel(office)
        } else if (office === 'house_member' && !data.position) {
          data.position = 'House Member'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'fullName',
      type: 'text',
      required: true,
    },
    {
      name: 'office',
      type: 'select',
      options: ALL_OFFICES.map((o) => ({ label: o.label, value: o.value })),
      admin: {
        description:
          'Pick the office. Executives are listed first, then the House. The title is filled in for you.',
      },
    },
    {
      name: 'position',
      type: 'text',
      required: true,
      admin: {
        description: 'Only needed for House Members, or if no office is chosen above.',
        condition: (data) => !data?.office || data.office === 'house_member',
      },
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
      admin: { description: 'Used to order House Members. Lower numbers come first.' },
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