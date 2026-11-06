import { notifyContactMessage } from '@/lib/notify'
import type { CollectionConfig } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const ExcoContactMessages: CollectionConfig<'exco-contact-messages'> = {
  slug: 'exco-contact-messages',
  access: {
    create: () => false,
    delete: isEditorOrAbove,
    read: isEditorOrAbove,
    update: isEditorOrAbove,
  },
  admin: {
    defaultColumns: ['subject', 'member', 'senderName', 'senderEmail', 'isRead', 'createdAt'],
    group: 'SUG',
    useAsTitle: 'subject',
  },
  hooks: {
    afterChange: [notifyContactMessage],
  },
  fields: [
    {
      name: 'member',
      type: 'relationship',
      relationTo: 'exco-members',
      required: true,
    },
    {
      name: 'senderName',
      type: 'text',
      required: true,
      maxLength: 100,
    },
    {
      name: 'senderEmail',
      type: 'email',
      required: true,
    },
    {
      name: 'subject',
      type: 'text',
      required: true,
      maxLength: 160,
    },
    {
      name: 'message',
      type: 'textarea',
      required: true,
      maxLength: 2000,
    },
    {
      name: 'isRead',
      type: 'checkbox',
      defaultValue: false,
    },
  ],
}
