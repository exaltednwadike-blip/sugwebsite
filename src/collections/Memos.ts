import type { CollectionConfig } from 'payload'
import { slugField } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const Memos: CollectionConfig<'memos'> = {
  slug: 'memos',
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
    defaultColumns: ['refNumber', 'title', 'issuedDate', '_status'],
    group: 'SUG',
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'refNumber',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField(),
    {
      name: 'summary',
      type: 'textarea',
    },
    {
      name: 'pdf',
      type: 'upload',
      relationTo: 'media',
      required: true,
      filterOptions: {
        mimeType: {
          equals: 'application/pdf',
        },
      },
    },
    {
      name: 'issuedBy',
      type: 'text',
    },
    {
      name: 'issuedDate',
      type: 'date',
      required: true,
      admin: {
        date: {
          pickerAppearance: 'dayAndTime',
        },
      },
    },
    {
      name: 'category',
      type: 'relationship',
      relationTo: 'categories',
    },
  ],
  versions: {
    drafts: true,
  },
}
