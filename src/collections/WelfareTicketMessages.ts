import { notifyWelfareReply } from '@/lib/notify'
import type { CollectionConfig } from 'payload'

import { isWelfareStaff } from '../access/roles'
import { hideFromNonWelfare } from '../access/welfareVisibility'

export const WelfareTicketMessages: CollectionConfig = {
  slug: 'welfare-ticket-messages',
  labels: { singular: 'Welfare Message', plural: 'Welfare Messages' },
  access: {
    create: isWelfareStaff,
    delete: isWelfareStaff,
    read: isWelfareStaff,
    update: isWelfareStaff,
  },
  admin: {
    defaultColumns: ['ticket', 'sender', 'createdAt'],
    group: 'SUG',
    hidden: hideFromNonWelfare,
    useAsTitle: 'sender',
  },
  hooks: {
    afterChange: [notifyWelfareReply],
  },
  fields: [
    {
      name: 'ticket',
      type: 'relationship',
      relationTo: 'welfare-tickets',
      required: true,
    },
    {
      name: 'sender',
      type: 'select',
      defaultValue: 'staff',
      required: true,
      options: [
        { label: 'Student', value: 'student' },
        { label: 'Staff', value: 'staff' },
      ],
    },
    {
      name: 'body',
      type: 'textarea',
      required: true,
      maxLength: 2000,
    },
  ],
}