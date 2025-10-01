import type { Statements } from "better-auth/plugins/access"

import { createAccessControl } from "better-auth/plugins/access"
import { adminAc, defaultStatements, userAc } from "better-auth/plugins/admin/access"

const statement: Statements = {
  user: defaultStatements.user,
  session: defaultStatements.session,
  // custom statement
  // "resource": ["action1", "action2"],
  product: ["create", "share", "update", "delete"], // <-- Permissions available for created roles
} as const

const accessController = createAccessControl(statement)

const user = accessController.newRole({
  user: userAc.statements.user,
  session: userAc.statements.session,
  product: ["share"], // <-- user has only "share" permission on "product" resource
})

const admin = accessController.newRole({
  user: adminAc.statements.user,
  session: adminAc.statements.session,
  product: ["create", "update", "delete", "share"], // <-- admin has all permissions on "product" resource
})

export {
  accessController,
  admin,
  user,
}
