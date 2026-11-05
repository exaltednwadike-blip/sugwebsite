import type { GlobalConfig } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isEditorOrAbove,
  },
  admin: {
    group: 'SUG',
  },
  fields: [
    {
      name: 'secretariatAddress',
      type: 'textarea',
    },
    {
      name: 'contactEmail',
      type: 'email',
    },
    {
      name: 'contactPhone',
      type: 'text',
    },
    {
      name: 'socialLinks',
      type: 'array',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
}
