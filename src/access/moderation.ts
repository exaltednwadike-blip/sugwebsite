import type { Access, AccessArgs } from 'payload'

import type { User } from '@/payload-types'

import { isModeratorOrAbove } from './roles'

type MaybeUser = Pick<User, 'role' | 'isActive'> | null | undefined

export const isModerationStaff = (user: MaybeUser): boolean =>
  user?.isActive === true &&
  (user.role === 'super_admin' || user.role === 'welfare_manager' || user.role === 'moderator')

export const hideFromNonModeration = ({ user }: { user?: unknown }): boolean =>
  !isModerationStaff(user as MaybeUser)

/** Staff see everything. Everyone else sees only approved items. */
export const approvedOrStaff: Access = (args) => {
  if (isModeratorOrAbove(args as AccessArgs<User>)) {
    return true
  }
  return { status: { equals: 'approved' } }
}