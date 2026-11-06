import { notifyLostFoundClaim } from '@/lib/notify'
import type { CollectionConfig } from 'payload'

import { hideFromNonModeration } from '../access/moderation'
import { isModeratorOrAbove } from '../access/roles'

export const LostFoundClaims: CollectionConfig = {
  slug: 'lost-found-claims',
  labels: { singular: 'Lost & Found Claim', plural: 'Lost & Found Claims' },
  access: {
    create: () => false,
    delete: isModeratorOrAbove,
    read: isModeratorOrAbove,
    update: isModeratorOrAbove,
  },
  admin: {
    defaultColumns: ['item', 'claimerName', 'status', 'createdAt'],
    group: 'SUG',
    hidden: hideFromNonModeration,
    useAsTitle: 'claimerName',
  },
  hooks: {
    afterChange: [notifyLostFoundClaim],
  },
  fields: [
    { name: 'item', type: 'relationship', relationTo: 'lost-found-items', required: true },
    { name: 'claimerName', type: 'text', required: true, maxLength: 100 },
    { name: 'claimerContact', type: 'text', required: true, maxLength: 200 },
    { name: 'message', type: 'textarea', required: true, maxLength: 1000 },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'Handled', value: 'handled' },
      ],
    },
  ],
}