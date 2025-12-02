import { Request, Response, NextFunction } from 'express';
import prisma from '../db';
import '../types/auth'; // Import to register global types

// Ensure request is scoped to a workspace (tenant) and that the workspace exists.
export async function requireWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const auth = req.auth || {};

    // Must be authenticated first (unless using API key)
    if (!auth.apiKey && auth.anonymous) {
      return res.status(401).json({
        error: 'unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    const bodyWorkspace =
      (req.body && req.body.workspaceId) ||
      (req.query && req.query.workspaceId) ||
      req.headers['x-workspace-id'];
    let workspaceId = bodyWorkspace as string | undefined;

    // If JWT contained workspace info, prefer that
    if (auth.workspaceId) {
      // if workspaceId provided in body and mismatches token -> forbidden (prevent tenant crossing)
      if (workspaceId && workspaceId !== auth.workspaceId) {
        console.warn(
          `[SECURITY] Workspace mismatch attempt: token=${auth.workspaceId}, request=${workspaceId}, user=${auth.sub}`,
        );
        return res.status(403).json({
          error: 'forbidden',
          message: 'Cannot access resources from a different workspace',
          code: 'WORKSPACE_MISMATCH',
        });
      }
      workspaceId = auth.workspaceId;
    }

    if (!workspaceId) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'Workspace ID is required',
        code: 'MISSING_WORKSPACE_ID',
      });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({
        error: 'not_found',
        message: 'Workspace not found',
        code: 'WORKSPACE_NOT_FOUND',
      });
    }

    // If authenticated user (not API key), verify membership
    if (auth.sub && !auth.apiKey) {
      const membership = await prisma.workspaceMembership.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId,
            userId: auth.sub,
          },
        },
      });

      if (!membership) {
        console.warn(
          `[SECURITY] Unauthorized workspace access attempt: user=${auth.sub}, workspace=${workspaceId}`,
        );
        return res.status(403).json({
          error: 'forbidden',
          message: 'You are not a member of this workspace',
          code: 'NOT_WORKSPACE_MEMBER',
        });
      }

      // Attach membership role to auth for downstream handlers
      req.auth = req.auth || {};
      req.auth.role = membership.role;
    }

    // attach workspace to request auth object for downstream handlers
    req.auth = req.auth || {};
    req.auth.workspace = workspace;
    req.auth.workspaceId = workspaceId;

    return next();
  } catch (err: unknown) {
    console.error('requireWorkspace error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}

// Middleware to scope database queries to current workspace
// Use this to ensure all queries are tenant-isolated
export function workspaceScope() {
  return (req: Request, res: Response, next: NextFunction) => {
    const workspaceId = req.auth?.workspaceId;

    if (!workspaceId) {
      return res.status(400).json({
        error: 'bad_request',
        message: 'Workspace context required',
        code: 'MISSING_WORKSPACE_CONTEXT',
      });
    }

    // Attach workspace filter helper to request for use in handlers
    (req as Request & { workspaceFilter: { workspaceId: string } }).workspaceFilter = {
      workspaceId,
    };

    return next();
  };
}

export default requireWorkspace;
