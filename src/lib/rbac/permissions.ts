import { Role } from "@prisma/client";
import { statements as roleStatements } from "../user/user.service";
import { statement as orgStatements } from "../organization/organization.service";

/**
 * buildAllRoleStatements
 *
 * Aggregates all RBAC policy statements defined across the user and
 * organization modules into a single flattened array.
 *
 * Why:
 * - Central place to obtain the complete set of statements for registration
 *   with a policy engine (e.g., when initializing RBAC/ABAC), or for
 *   diagnostics/debugging.
 * - Avoids accidental mutation of the original source arrays by cloning via
 *   spread syntax.
 * - Encapsulates the aggregation logic behind a named function for clarity
 *   and future extension (easy to add new statement groups).
 */
function buildAllRoleStatements() {
  return [
    // User domain statements
    ...roleStatements.comments,
    ...roleStatements.user,
    ...roleStatements.session,
    ...roleStatements.apps,
    ...roleStatements.topics,

    // Organization domain statements
    ...orgStatements.organization,
    ...orgStatements.invitation,
    ...orgStatements.member,
  ];
}

// Export a convenient prebuilt list for consumers that just need the values.
// Keeping the builder function allows tests or callers to rebuild if needed.
export const allRoleStatements = buildAllRoleStatements()[0];

// Narrow type representing one aggregated statement; combined with string tokens
// to allow business-friendly identifiers (e.g., "apps-list").
export type AnyStatement = typeof allRoleStatements;

/**
 * buildRoleStatementsMap
 *
 * Build an immutable mapping Role -> (statements | strings)[] in the requested
 * style. Each role array is composed by spreading known statement groups from
 * user/organization modules and adding business-readable string tokens.
 *
 * Why
 * - Replaces enum-based Permission mapping with concrete statements and
 *   readable identifiers closer to your policy language.
 * - Centralizes composition and enforces immutability to prevent runtime
 *   mutations.
 */
function buildRoleStatementsMap(): Readonly<
  Record<Role, ReadonlyArray<AnyStatement | string>>
> {
  return {
    [Role.SUPER_ADMIN]: Object.freeze([
      ...orgStatements.organization,
      ...orgStatements.member,
      ...roleStatements.user,
      ...roleStatements.comments,
      ...roleStatements.session,
      ...roleStatements.apps,
      "view-topic",
    ]),

    [Role.OWNER]: Object.freeze([
      ...orgStatements.organization,
      ...orgStatements.member,
      ...orgStatements.invitation,
      ...roleStatements.apps,
      ...roleStatements.topics,
      ...roleStatements.comments,
      "ban",
      "list",
      "set-password",
      "update",
    ]),

    [Role.ADMIN]: Object.freeze([
      ...roleStatements.comments,
      ...orgStatements.invitation,
      ...orgStatements.member,
      "ban",
      "set-password",
      "update",
      // "member-update",
      // "member-delete",
      // "member-update-name",
      "apps-list",
      "view-topic",
    ]),

    [Role.MEMBER]: Object.freeze([
      "set-password",
      "update",
      "create-comment",
      "toggle-hide",
      "apps-list",
      "view-topic",
      "update-name",
    ]),

    [Role.USER]: Object.freeze([
      "set-password",
      "update",
      "create-topic",
      "create-comment",
      "apps-list",
      "view-topic",
    ]),
  } as const;
}

// Export a frozen, ready-to-use map.
export const ROLE_PERMISSIONS = Object.freeze(buildRoleStatementsMap());
