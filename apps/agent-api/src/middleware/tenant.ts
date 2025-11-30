import { Request, Response, NextFunction } from 'express';
import prisma from '../db';

declare global {
  namespace Express {
    interface Request {
      auth?: any;
    }
  }
}

// Ensure request is scoped to a workspace (tenant) and that the workspace exists.
export async function requireWorkspace(req: Request, res: Response, next: NextFunction) {
  try {
    const bodyWorkspace =
      (req.body && req.body.workspaceId) ||
      (req.query && req.query.workspaceId) ||
      req.headers['x-workspace-id'];
    let workspaceId = bodyWorkspace as string | undefined;

    // If JWT contained workspace info, prefer that
    if (req.auth && req.auth.workspaceId) {
      // if workspaceId provided in body and mismatches token -> forbidden
      if (workspaceId && workspaceId !== req.auth.workspaceId) {
        return res.status(403).json({ error: 'workspace_mismatch' });
      }
      workspaceId = req.auth.workspaceId;
    }

    if (!workspaceId) {
      return res.status(400).json({ error: 'missing_workspace_id' });
    }

    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) {
      return res.status(404).json({ error: 'workspace_not_found' });
    }

    // attach workspace to request auth object for downstream handlers
    req.auth = req.auth || {};
    req.auth.workspace = workspace;
    req.auth.workspaceId = workspaceId;

    return next();
  } catch (err: any) {
    console.error('requireWorkspace error', err);
    return res.status(500).json({ error: 'server_error' });
  }
}

export default requireWorkspace;
