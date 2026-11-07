import type { GlobalAfterChangeHook, GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

import { isEditorOrAbove } from '../access/roles'

// When an editor saves Site Settings, refresh the public pages so the
// breaking bar and footer update without a redeploy.
const refreshSite: GlobalAfterChangeHook = ({ doc }) => {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // Not running inside a Next.js request (for example a script): nothing to refresh.
  }
  return doc
}

export const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  access: {
    read: () => true,
    update: isEditorOrAbove,
  },
  admin: {
    group: 'SUG',
  },
  hooks: {
    afterChange: [refreshSite],
  },
  fields: [
    {
      name: 'breakingEnabled',
      type: 'checkbox',
      defaultValue: true,
      label: 'Show the breaking news bar',
      admin: {
        description: 'Untick to hide the bar completely. It also stays hidden if there are no items below.',
      },
    },
    {
      name: 'breakingItems',
      type: 'array',
      label: 'Breaking news items',
      maxRows: 5,
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        description: 'Short headlines shown in the scrolling bar at the top of the site (up to 5).',
      },
      fields: [
        {
          name: 'text',
          type: 'text',
          required: true,
          maxLength: 140,
          label: 'Headline',
        },
        {
          name: 'link',
          type: 'text',
          label: 'Link (optional)',
          admin: {
            description: 'A site page such as /news/my-post, or a full address starting with https://',
          },
          validate: (value: string | null | undefined) => {
            if (!value) return true
            const v = value.trim()
            if (v.startsWith('/') || /^https?:\/\//i.test(v)) return true
            return 'Use a site path starting with / or a full address starting with https://'
          },
        },
      ],
    },
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
