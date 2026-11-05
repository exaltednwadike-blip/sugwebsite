import type { CollectionConfig } from 'payload'

import { anyone } from '../access/anyone'
import { isEditorOrAbove } from '../access/roles'
import { slugField } from 'payload'

export const Categories: CollectionConfig = {
  slug: 'categories',
  access: {
    create: isEditorOrAbove,
    delete: isEditorOrAbove,
    read: anyone,
    update: isEditorOrAbove,
  },
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    slugField({
      position: undefined,
    }),
  ],
}
