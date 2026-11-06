import { notifyLostFoundItem } from '@/lib/notify'
import type { CollectionConfig } from 'payload'

import { approvedOrStaff, hideFromNonModeration, isModerationStaff } from '../access/moderation'
import { isModeratorOrAbove } from '../access/roles'

export const LostFoundItems: CollectionConfig = {
  slug: 'lost-found-items',
  labels: { singular: 'Lost & Found Item', plural: 'Lost & Found Items' },
  access: {
    create: () => false,
    delete: isModeratorOrAbove,
    read: approvedOrStaff,
    update: isModeratorOrAbove,
  },
  admin: {
    defaultColumns: ['title', 'kind', 'status', 'location', 'createdAt'],
    group: 'SUG',
    hidden: hideFromNonModeration,
    useAsTitle: 'title',
  },
  hooks: {
    afterChange: [notifyLostFoundItem],
  },
  fields: [
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: [
        { label: 'Lost', value: 'lost' },
        { label: 'Found', value: 'found' },
      ],
    },
    { name: 'title', type: 'text', required: true, maxLength: 120 },
    { name: 'description', type: 'textarea', maxLength: 1000 },
    { name: 'location', type: 'text', required: true, maxLength: 160 },
    { name: 'dateOccurred', type: 'date', required: true },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'pending',
      required: true,
      index: true,
      options: [
        { label: 'Pending review', value: 'pending' },
        { label: 'Approved (public)', value: 'approved' },
        { label: 'Returned to owner', value: 'returned' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
    {
      name: 'contactName',
      type: 'text',
      maxLength: 100,
      access: { read: ({ req: { user } }) => isModerationStaff(user) },
    },
    {
      name: 'contactInfo',
      type: 'text',
      required: true,
      maxLength: 200,
      access: { read: ({ req: { user } }) => isModerationStaff(user) },
    },
    {
      name: 'staffNotes',
      type: 'textarea',
      access: { read: ({ req: { user } }) => isModerationStaff(user) },
    },
  ],
}