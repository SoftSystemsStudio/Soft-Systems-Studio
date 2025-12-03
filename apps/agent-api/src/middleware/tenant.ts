import { Request, Response, NextFunction, RequestHandler } from 'express';
import prisma from '../db';
import '../types/auth'; // Import to register global types

// Ensure request is scoped to a workspace (tenant) and that the workspace exists.
async function requireWorkspaceImpl(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const auth = req.auth || {};

    // Must be authenticated first (unless using API key)
    if (!auth.apiKey && auth.anonymous) {
      res.status(401).json({
        error: 'unauthorized',
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
      return;
    }

    const body = req.body as { workspaceId?: string } | undefined;
    const query = req.query as { workspaceId?: string };
    const headerWorkspace = req.headers['x-workspace-id'];
    const bodyWorkspace: string | undefined =
      body?.workspaceId ??
      query?.workspaceId ??
      (typeof headerWorkspace === 'string' ? headerWorkspace : undefined);
    let workspaceId = bodyWorkspace;

    // If JWT contained workspace info, prefer that
    if (auth.workspaceId) {
      // if workspaceId provided in body and mismatches token -> forbidden (prevent tenant crossing)
      if (workspaceId && workspaceId !== auth.workspaceId) {
        console.warn(
          `[SECURITY] Workspace mismatch attempt: token=${auth.workspaceId}, request=${workspaceId}, user=${auth.sub}`,
        );
        res.status(403).json({
          error: 'forbidden',
          message: 'Cannot access resources from a different workspace',
          code: 'WORKSPACE_MISMATCH',
        });
        return;
      }
      workspaceId = auth.workspaceId;
    }

    if (!workspaceId) {
      res.status(400).json({
        error: 'bad_request',
        message: 'Workspace ID is required',
        code: 'MISSING_WORKSPACE_ID',
      });
      return;
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      res.status(404).json({
        error: 'not_found',
        message: 'Workspace not found',
        code: 'WORKSPACE_NOT_FOUND',
      });
      return;
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
        res.status(403).json({
          error: 'forbidden',
          message: 'You are not a member of this workspace',
          code: 'NOT_WORKSPACE_MEMBER',
        });
        return;
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
    res.status(500).json({ error: 'server_error' });
  }
}

// Wrap async middleware to handle Promise correctly
export const requireWorkspace: RequestHandler = (req, res, next) => {
  void requireWorkspaceImpl(req, res, next);
};

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
