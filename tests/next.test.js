import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextGoogleAuth } from "../src/middlewares/next.js";
import { AUTH_ERRORS } from "../src/errors/codes.js";
import { AuthError } from "../src/errors/AuthError.js";

// Mock the core verify function
vi.mock("../src/google/verifyGoogleToken.js", () => ({
  verifyGoogleToken: vi.fn()
}));

import { verifyGoogleToken } from "../src/google/verifyGoogleToken.js";

describe("Next.js Middleware (nextGoogleAuth)", () => {
  const mockRequest = (authHeader) => ({
    headers: { get: vi.fn().mockReturnValue(authHeader) },
    url: "http://localhost/api/auth"
  });

  const mockHandler = vi.fn().mockResolvedValue(new Response("Success"));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if clientId is missing", () => {
    expect(() => nextGoogleAuth({})).toThrowError("`clientId` is required");
  });

  it("should return 401 Response if token is missing and required=true", async () => {
    const middleware = nextGoogleAuth({ clientId: "test-id" });
    const req = mockRequest(null);

    const response = await middleware(mockHandler)(req, {});

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.code).toBe(AUTH_ERRORS.MISSING_BEARER_TOKEN);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should call handler if token is missing and required=false", async () => {
    const middleware = nextGoogleAuth({ clientId: "test-id", required: false, property: "customUser" });
    const req = mockRequest(null);

    await middleware(mockHandler)(req, {});

    expect(req.customUser).toBeNull();
    expect(mockHandler).toHaveBeenCalledWith(req, {});
  });

  it("should return 401 Response if verification fails", async () => {
    verifyGoogleToken.mockRejectedValue(new AuthError("Expired", AUTH_ERRORS.TOKEN_EXPIRED, 401));
    const middleware = nextGoogleAuth({ clientId: "test-id" });
    const req = mockRequest("Bearer invalid_token");

    const response = await middleware(mockHandler)(req, {});

    expect(response.status).toBe(401);
    const data = await response.json();
    expect(data.code).toBe(AUTH_ERRORS.TOKEN_EXPIRED);
    expect(mockHandler).not.toHaveBeenCalled();
  });

  it("should populate req.user and call handler on success", async () => {
    const mockUser = { id: "123", email: "test@nextjs.com" };
    verifyGoogleToken.mockResolvedValue(mockUser);
    
    const middleware = nextGoogleAuth({ clientId: "test-id" });
    const req = mockRequest("Bearer valid_token");
    const context = { params: { id: 1 } };

    const response = await middleware(mockHandler)(req, context);

    expect(req.user).toEqual(mockUser);
    expect(mockHandler).toHaveBeenCalledWith(req, context);
  });
});
