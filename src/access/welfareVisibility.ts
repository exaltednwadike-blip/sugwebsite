import type { User } from '@/payload-types'

type MaybeUser = Pick<User, 'role'> | null | undefined

export const hideFromNonWelfare = ({ user }: { user?: unknown }): boolean => {
  const role = (user as MaybeUser)?.role
  return role !== 'super_admin' && role !== 'welfare_manager'
}