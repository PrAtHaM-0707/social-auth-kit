/**
 * Extracts a Bearer token from the Authorization header
 * @param {string | undefined | null} authHeader
 * @returns {string | null}
 */
export function extractToken(authHeader: string | undefined | null): string | null;
