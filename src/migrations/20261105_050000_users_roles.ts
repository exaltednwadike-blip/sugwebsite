import type { MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  let page = 1
  let firstUser = true

  while (true) {
    const users = await payload.find({
      collection: 'users',
      depth: 0,
      limit: 1000,
      overrideAccess: true,
      page,
      sort: 'createdAt',
    })

    for (const user of users.docs) {
      await payload.update({
        collection: 'users',
        id: user.id,
        overrideAccess: true,
        data: {
          fullName: user.fullName || user.name || user.email,
          ...(firstUser ? { role: 'super_admin' } : {}),
        },
      })
      firstUser = false
    }

    if (page >= users.totalPages) {
      break
    }
    page += 1
  }
}
