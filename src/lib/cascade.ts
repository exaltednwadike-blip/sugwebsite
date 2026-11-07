import type { CollectionBeforeDeleteHook, CollectionSlug } from 'payload'

/** Deletes the records that point at a parent record, just before the parent is deleted. */
export const deleteChildren =
  (childCollection: CollectionSlug, field: string): CollectionBeforeDeleteHook =>
  async ({ id, req }) => {
    await req.payload.delete({
      collection: childCollection,
      where: { [field]: { equals: id } },
      req,
      overrideAccess: true,
    })
  }