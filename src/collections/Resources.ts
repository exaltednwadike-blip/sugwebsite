import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const Resources: CollectionConfig<'resources'> = {
  slug: 'resources',
  access: {
    create: isEditorOrAbove,
    delete: isEditorOrAbove,
    read: (args) => {
      if (isEditorOrAbove(args)) return true
      return {
        _status: {
          equals: 'published',
        },
      }
    },
    update: isEditorOrAbove,
  },
  admin: {
    defaultColumns: ['title', 'category', 'publishedDate', '_status'],
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
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Constitution', value: 'constitution' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Forms', value: 'forms' },
        { label: 'Guidelines', value: 'guidelines' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'file',
      type: 'upload',
      relationTo: 'media',
      required: true,
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
    },
  ],
  versions: {
    drafts: true,
  },
}
