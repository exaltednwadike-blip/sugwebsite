import type { CollectionConfig } from 'payload'

import { isEditorOrAbove } from '../access/roles'

export const EmergencyContacts: CollectionConfig<'emergency-contacts'> = {
  slug: 'emergency-contacts',
  access: {
    create: isEditorOrAbove,
    delete: isEditorOrAbove,
    read: (args) => {
      if (isEditorOrAbove(args)) return true
      return {
        isActive: {
          equals: true,
        },
      }
    },
    update: isEditorOrAbove,
  },
  admin: {
    defaultColumns: ['name', 'category', 'phone', 'availability', 'sortOrder', 'isActive'],
    group: 'SUG',
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      options: [
        { label: 'Security', value: 'security' },
        { label: 'Medical', value: 'medical' },
        { label: 'Welfare', value: 'welfare' },
        { label: 'Student Affairs', value: 'student-affairs' },
        { label: 'Other', value: 'other' },
      ],
    },
    {
      name: 'phone',
      type: 'text',
      required: true,
    },
    {
      name: 'altPhone',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      name: 'availability',
      type: 'text',
    },
    {
      name: 'sortOrder',
      type: 'number',
      defaultValue: 0,
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
    },
  ],
}
