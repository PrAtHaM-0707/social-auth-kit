/**
 * Extracts a Bearer token from the Authorization header
 * @param {string | undefined | null} authHeader 
 * @returns {string | null}
 */
export function extractToken(authHeader) {
  if (!authHeader || typeof authHeader !== "string") {
    return null;
  }
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
    return parts[1];
  }
  return null;
}
