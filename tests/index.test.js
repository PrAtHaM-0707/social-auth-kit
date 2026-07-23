import { describe, it, expect } from "vitest";
import { AuthError } from "../src/errors/AuthError.js";
import { extractToken } from "../src/utils/token.js";
import { SocialAuth } from "../src/SocialAuth.js";

describe("Core & Utilities", () => {
  describe("Token Utility", () => {
    it("should extract bearer token correctly", () => {
      const token = extractToken("Bearer my-secret-token");
      expect(token).toBe("my-secret-token");
    });

    it("should return null for invalid formats", () => {
      expect(extractToken("Basic 1234")).toBeNull();
      expect(extractToken(null)).toBeNull();
      expect(extractToken("")).toBeNull();
    });
  });

  describe("SocialAuth Scalable Class", () => {
    it("should throw missing config on verify if provider is not configured", async () => {
      const auth = new SocialAuth({});
      await expect(auth.verify("google", "123")).rejects.toThrowError(
        new AuthError("Google Client ID not configured", "MISSING_CONFIG", 500)
      );
    });

    it("should throw missing provider for unknown providers", async () => {
      const auth = new SocialAuth({ google: { clientId: "xyz" } });
      await expect(auth.verify("apple", "123")).rejects.toThrowError(/not supported/i);
    });
  });
});
