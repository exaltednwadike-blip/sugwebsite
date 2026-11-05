import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const Events: CollectionConfig<'events'> = {
  slug: 'events',
  access: {
    create: isEditorOrAbove,
    delete: isEditorOrAbove,
    read: () => ({
      _status: {
        equals: 'published',
      },
    }),
    update: isEditorOrAbove,
  },
  admin: {
    defaultColumns: ['title', 'eventType', 'startsAt', 'venue'],
    group: 'SUG',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'eventType',
      type: 'select',
      options: [
        { label: 'Meeting', value: 'meeting' },
        { label: 'Town Hall', value: 'town_hall' },
        { label: 'Cultural', value: 'cultural' },
        { label: 'Sports', value: 'sports' },
        { label: 'Academic', value: 'academic' },
        { label: 'General', value: 'general' },
      ],
    },
    {
      name: 'venue',
      type: 'text',
    },
    {
      name: 'startsAt',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'endsAt',
      type: 'date',
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'banner',
      type: 'upload',
      relationTo: 'media',
    },
  ],
  versions: {
    drafts: true,
  },
}
