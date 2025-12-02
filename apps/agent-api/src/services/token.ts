import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import prisma from '../db';
import env from '../env';

// Token expiry configuration
export const TOKEN_CONFIG = {
  accessToken: {
    expiresIn: env.NODE_ENV === 'production' ? '15m' : '30m', // 15 min prod, 30 min dev
  },
  refreshToken: {
    expiresInMs:
      env.NODE_ENV === 'production'
        ? 7 * 24 * 60 * 60 * 1000 // 7 days prod
        : 30 * 24 * 60 * 60 * 1000, // 30 days dev
  },
};

export type AccessTokenPayload = {
  sub: string;
  email: string;
  workspaceId: string;
  role: string;
  type: 'access';
};

// Generate a cryptographically secure refresh token
export function generateRefreshToken(): string {
  return crypto.randomBytes(64).toString('hex');
}

// Create access token (short-lived JWT)
export function createAccessToken(payload: Omit<AccessTokenPayload, 'type'>): string {
  const secret = env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET not configured');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return jwt.sign({ ...payload, type: 'access' } as any, secret, {
    algorithm: env.JWT_ALGORITHM as jwt.Algorithm,
    expiresIn: TOKEN_CONFIG.accessToken.expiresIn as jwt.SignOptions['expiresIn'],
  });
}

// Store refresh token in database
export async function createRefreshTokenInDb(
  userId: string,
  workspaceId: string,
): Promise<{ token: string; expiresAt: Date }> {
  const token = generateRefreshToken();
  const expiresAt = new Date(Date.now() + TOKEN_CONFIG.refreshToken.expiresInMs);

  await prisma.refreshToken.create({
    data: {
      token,
      userId,
      workspaceId,
      expiresAt,
    },
  });

  return { token, expiresAt };
}

// Rotate refresh token: invalidate old, create new
export async function rotateRefreshToken(oldToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
} | null> {
  // Find the existing token
  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: oldToken },
    include: {
      user: true,
    },
  });

  if (!existingToken) {
    return null;
  }

  // Check if token was already used (replay attack detection)
  if (existingToken.revokedAt) {
    // Token reuse detected! Revoke all tokens for this user as security measure
    console.warn(
      `[SECURITY] Refresh token reuse detected for user ${existingToken.userId}. Revoking all tokens.`,
    );
    await revokeAllUserTokens(existingToken.userId);
    return null;
  }

  // Check if token has expired
  if (existingToken.expiresAt < new Date()) {
    // Mark as revoked for audit purposes
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  // Get user's role for the workspace
  const membership = await prisma.workspaceMembership.findUnique({
    where: {
      workspaceId_userId: {
        workspaceId: existingToken.workspaceId,
        userId: existingToken.userId,
      },
    },
  });

  if (!membership) {
    // User no longer has access to this workspace
    await prisma.refreshToken.update({
      where: { id: existingToken.id },
      data: { revokedAt: new Date() },
    });
    return null;
  }

  // Create new tokens
  const newRefresh = await createRefreshTokenInDb(existingToken.userId, existingToken.workspaceId);

  // Mark old token as revoked and link to new token
  await prisma.refreshToken.update({
    where: { id: existingToken.id },
    data: {
      revokedAt: new Date(),
      replacedBy: newRefresh.token,
    },
  });

  // Create new access token
  const accessToken = createAccessToken({
    sub: existingToken.userId,
    email: existingToken.user.email,
    workspaceId: existingToken.workspaceId,
    role: membership.role,
  });

  return {
    accessToken,
    refreshToken: newRefresh.token,
    expiresAt: newRefresh.expiresAt,
  };
}

// Revoke a specific refresh token
export async function revokeRefreshToken(token: string): Promise<boolean> {
  try {
    await prisma.refreshToken.update({
      where: { token },
      data: { revokedAt: new Date() },
    });
    return true;
  } catch {
    return false;
  }
}

// Revoke all refresh tokens for a user (security measure)
export async function revokeAllUserTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

// Revoke all tokens for a specific workspace (e.g., when user is removed from workspace)
export async function revokeWorkspaceTokens(userId: string, workspaceId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      workspaceId,
      revokedAt: null,
    },
    data: { revokedAt: new Date() },
  });
}

// Clean up expired tokens (should be run periodically)
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: {
      OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { not: null } }],
    },
  });
  return result.count;
}

export default {
  createAccessToken,
  createRefreshTokenInDb,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllUserTokens,
  revokeWorkspaceTokens,
  cleanupExpiredTokens,
  TOKEN_CONFIG,
};
