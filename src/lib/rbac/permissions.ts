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
export const allRoleStatements = buildAllRoleStatements();

export type AnyStatement = (typeof allRoleStatements)[number];

// Suppression de la table personnalisée ROLE_PERMISSIONS - faire du `ac` de better-auth
// la source unique de vérité pour l'autorisation.
// Cela permet d'unifier tous les mécanismes d'autorisation sous le même système.
