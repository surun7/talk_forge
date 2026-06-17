// ── Auth placeholder — all stubs for future cloud sync ──

export interface User {
  id: string;
  email: string;
  name: string;
}

/** Always false — cloud login not yet implemented */
export function isAuthenticated(): boolean {
  return false;
}

/** Always null — cloud login not yet implemented */
export function getCurrentUser(): User | null {
  return null;
}

/**
 * Placeholder: future implementation will push all local projects
 * to the authenticated user's cloud storage endpoint.
 */
export async function syncToCloud(): Promise<void> {
  // TODO: implement cloud sync via fetch('/api/sync', { method: 'POST', body: ... })
}

/**
 * Placeholder: future implementation will open OAuth flow
 * and store the resulting session token.
 */
export async function login(): Promise<User> {
  throw new Error("Cloud login not yet implemented");
}

/**
 * Placeholder: future implementation will clear the session
 * and optionally sync remaining data.
 */
export async function logout(): Promise<void> {
  // TODO: clear session token, optionally syncToCloud() first
}
