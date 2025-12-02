/**
 * Tenant Isolation Helpers
 * Provides utilities for workspace-scoped queries and data ownership
 */

/**
 * User context for tenant-scoped operations
 */
export interface TenantContext {
  userId: string;
  workspaceId: string;
  role?: string;
}

/**
 * Create a where clause scoped to a specific workspace
 * Ensures all queries are tenant-isolated
 *
 * @example
 * // Basic usage
 * const docs = await prisma.kbDocument.findMany({
 *   where: whereWorkspace(ctx),
 * });
 *
 * // With additional filters
 * const docs = await prisma.kbDocument.findMany({
 *   where: whereWorkspace(ctx, { title: { contains: 'search' } }),
 * });
 */
export function whereWorkspace<T extends Record<string, unknown>>(
  ctx: TenantContext,
  additionalWhere: T = {} as T,
): T & { workspaceId: string } {
  return {
    ...additionalWhere,
    workspaceId: ctx.workspaceId,
  };
}

/**
 * Create a where clause that excludes soft-deleted records
 * Combines workspace scoping with soft delete filtering
 *
 * @example
 * const activeClients = await prisma.workspace.findMany({
 *   where: whereActive(ctx),
 * });
 */
export function whereActive<T extends Record<string, unknown>>(
  ctx: TenantContext,
  additionalWhere: T = {} as T,
): T & { workspaceId: string; deletedAt: null } {
  return {
    ...additionalWhere,
    workspaceId: ctx.workspaceId,
    deletedAt: null,
  };
}

/**
 * Create a where clause for user-owned resources within a workspace
 *
 * @example
 * const myDrafts = await prisma.document.findMany({
 *   where: whereOwned(ctx),
 * });
 */
export function whereOwned<T extends Record<string, unknown>>(
  ctx: TenantContext,
  additionalWhere: T = {} as T,
): T & { workspaceId: string; createdBy: string } {
  return {
    ...additionalWhere,
    workspaceId: ctx.workspaceId,
    createdBy: ctx.userId,
  };
}

/**
 * Soft delete a record by setting deletedAt timestamp
 *
 * @example
 * await prisma.kbDocument.update({
 *   where: { id },
 *   data: softDelete(),
 * });
 */
export function softDelete(): { deletedAt: Date } {
  return { deletedAt: new Date() };
}

/**
 * Restore a soft-deleted record
 *
 * @example
 * await prisma.kbDocument.update({
 *   where: { id },
 *   data: restore(),
 * });
 */
export function restore(): { deletedAt: null } {
  return { deletedAt: null };
}

/**
 * Audit fields for create operations
 *
 * @example
 * await prisma.kbDocument.create({
 *   data: {
 *     ...documentData,
 *     ...auditCreate(ctx),
 *   },
 * });
 */
export function auditCreate(ctx: TenantContext): { workspaceId: string; createdBy: string } {
  return {
    workspaceId: ctx.workspaceId,
    createdBy: ctx.userId,
  };
}

/**
 * Validate that a resource belongs to the user's workspace
 * Throws if resource is not found or doesn't belong to workspace
 *
 * @example
 * const doc = await prisma.kbDocument.findUnique({ where: { id } });
 * assertOwnership(ctx, doc, 'Document');
 */
export function assertOwnership<T extends { workspaceId: string } | null>(
  ctx: TenantContext,
  resource: T,
  resourceName: string = 'Resource',
): asserts resource is NonNullable<T> {
  if (!resource) {
    throw new TenantError(`${resourceName} not found`, 'NOT_FOUND', 404);
  }
  if (resource.workspaceId !== ctx.workspaceId) {
    throw new TenantError(`${resourceName} does not belong to this workspace`, 'FORBIDDEN', 403);
  }
}

/**
 * Custom error class for tenant isolation violations
 */
export class TenantError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = 'TenantError';
  }
}

/**
 * Extract tenant context from Express request
 * Requires auth middleware to have populated req.auth
 */
export function getTenantContext(req: {
  auth?: { sub?: string; workspaceId?: string; role?: string };
}): TenantContext {
  if (!req.auth?.sub || !req.auth?.workspaceId) {
    throw new TenantError(
      'Authentication required for tenant-scoped operations',
      'UNAUTHORIZED',
      401,
    );
  }

  return {
    userId: req.auth.sub,
    workspaceId: req.auth.workspaceId,
    role: req.auth.role,
  };
}
