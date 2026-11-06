import type { Access } from 'payload'

import { isNewsStaff } from './newsStaff'

/** Staff who manage content see drafts. Everyone else sees only published items. */
export const authenticatedOrPublished: Access = (args) => {
  if (isNewsStaff(args)) {
    return true
  }

  return {
    _status: {
      equals: 'published',
    },
  }
}