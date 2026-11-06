import type { CollectionConfig } from 'payload'

import { isSuperAdmin, isWelfareStaff } from '../access/roles'
import { hideFromNonWelfare } from '../access/welfareVisibility'

export const WelfareTickets: CollectionConfig = {
  slug: 'welfare-tickets',
  labels: { singular: 'Welfare Ticket', plural: 'Welfare Tickets' },
  access: {
    create: () => false,
    delete: isSuperAdmin,
    read: isWelfareStaff,
    update: isWelfareStaff,
  },
  admin: {
    defaultColumns: ['ticketCode', 'category', 'status', 'createdAt'],
    group: 'SUG',
    hidden: hideFromNonWelfare,
    useAsTitle: 'ticketCode',
  },
  fields: [
    {
      name: 'ticketCode',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { readOnly: true },
    },
    {
      name: 'secretHash',
      type: 'text',
      access: {
        read: () => false,
        update: () => false,
      },
      admin: { hidden: true },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Harassment', value: 'harassment' },
        { label: 'Academic', value: 'academic' },
        { label: 'Health', value: 'health' },
        { label: 'Hostel / Accommodation', value: 'hostel-accommodation' },
        { label: 'Financial', value: 'financial' },
        { label: 'Safety', value: 'safety' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      maxLength: 3000,
    },
    {
      name: 'optionalContact',
      type: 'text',
      maxLength: 200,
    },
    {
      name: 'status',
      type: 'select',
      defaultValue: 'new',
      required: true,
      options: [
        { label: 'New', value: 'new' },
        { label: 'In review', value: 'in-review' },
        { label: 'In progress', value: 'in-progress' },
        { label: 'Resolved', value: 'resolved' },
        { label: 'Closed', value: 'closed' },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
    },
  ],
}