import type { Access } from 'payload'

import { isEditorOrAbove } from './roles'

/** Content collections (pages, categories, settings...) are limited to editors and super admins. */
export const authenticated: Access = (args) => isEditorOrAbove(args)