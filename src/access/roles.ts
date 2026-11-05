import type { Access, AccessArgs, FieldAccess } from 'payload'

import type { User } from '@/payload-types'

type ActiveUser = User & { isActive: true }

const isActiveUser = (user: User | null | undefined): user is ActiveUser =>
  user?.isActive === true

const isActiveSuperAdmin = (user: User | null | undefined): boolean =>
  isActiveUser(user) && user.role === 'super_admin'

export const isSuperAdmin = ({ req: { user } }: AccessArgs<User>): boolean =>
  isActiveSuperAdmin(user)

export const isSuperAdminField: FieldAccess<User> = ({ req: { user } }) =>
  isActiveSuperAdmin(user)

export const isEditorOrAbove = ({ req: { user } }: AccessArgs<User>): boolean =>
  isActiveUser(user) && (user.role === 'super_admin' || user.role === 'editor')

export const isWelfareStaff = ({ req: { user } }: AccessArgs<User>): boolean =>
  isActiveUser(user) && (user.role === 'super_admin' || user.role === 'welfare_manager')

export const isModeratorOrAbove = ({ req: { user } }: AccessArgs<User>): boolean =>
  isActiveUser(user) &&
  (user.role === 'super_admin' ||
    user.role === 'welfare_manager' ||
    user.role === 'moderator')

export const isSelfOrSuperAdmin: Access<User> = ({ id, req: { user } }) => {
  if (!isActiveUser(user)) {
    return false
  }

  if (user.role === 'super_admin') {
    return true
  }

  if (id !== undefined) {
    return id === user.id
  }

  return {
    id: {
      equals: user.id,
    },
  }
}
