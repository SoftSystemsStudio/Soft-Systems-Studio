/* eslint-disable @typescript-eslint/no-namespace */

// Unified auth info type for all middleware
export type AuthInfo = {
  sub?: string;
  email?: string;
  workspaceId?: string;
  role?: string;
  roles?: string[];
  workspace?: unknown;
  apiKey?: true;
  anonymous?: true;
  type?: 'access';
  [k: string]: unknown;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthInfo;
      workspaceFilter?: { workspaceId: string };
    }
  }
}

// Predefined roles with hierarchical permissions
export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
  VIEWER: 'viewer',
} as const;

export type RoleType = (typeof ROLES)[keyof typeof ROLES];

// Role hierarchy: higher index = more permissions
export const ROLE_HIERARCHY: string[] = [
  ROLES.VIEWER,
  ROLES.MEMBER,
  ROLES.MANAGER,
  ROLES.ADMIN,
  ROLES.SUPER_ADMIN,
];
