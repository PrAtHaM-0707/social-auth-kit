import { describe, it, expect, vi, beforeEach } from "vitest";
import { expressGoogleAuth } from "../src/middlewares/express.js";
import { AUTH_ERRORS } from "../src/errors/codes.js";
import { AuthError } from "../src/errors/AuthError.js";

// Mock the core verify function
vi.mock("../src/google/verifyGoogleToken.js", () => ({
  verifyGoogleToken: vi.fn()
}));

import { verifyGoogleToken } from "../src/google/verifyGoogleToken.js";

describe("Express Middleware (expressGoogleAuth)", () => {
  const mockReq = (authHeader) => ({
    headers: { authorization: authHeader }
  });

  const mockRes = () => {
    const res = {};
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    return res;
  };

  const mockNext = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should throw error if clientId is missing", () => {
    expect(() => expressGoogleAuth({})).toThrowError("`clientId` is required");
  });

  it("should return 401 if token is missing and required=true", async () => {
    const middleware = expressGoogleAuth({ clientId: "test-id" });
    const req = mockReq(undefined);
    const res = mockRes();

    await middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      error: "Unauthorized",
      message: "Missing or invalid Authorization header. Expected format: 'Bearer <token>'",
      code: AUTH_ERRORS.MISSING_BEARER_TOKEN
    });
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should call next() if token is missing and required=false", async () => {
    const middleware = expressGoogleAuth({ clientId: "test-id", required: false, property: "authUser" });
    const req = mockReq(undefined);
    const res = mockRes();

    await middleware(req, res, mockNext);

    expect(req.authUser).toBeNull();
    expect(mockNext).toHaveBeenCalled();
  });

  it("should return 401 if verification fails", async () => {
    verifyGoogleToken.mockRejectedValue(new AuthError("Expired", AUTH_ERRORS.TOKEN_EXPIRED, 401));
    const middleware = expressGoogleAuth({ clientId: "test-id" });
    const req = mockReq("Bearer invalid_token");
    const res = mockRes();

    await middleware(req, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      code: AUTH_ERRORS.TOKEN_EXPIRED
    }));
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should populate req.user and call next() on success", async () => {
    const mockUser = { id: "123", email: "test@example.com" };
    verifyGoogleToken.mockResolvedValue(mockUser);
    
    const middleware = expressGoogleAuth({ clientId: "test-id" });
    const req = mockReq("Bearer valid_token");
    const res = mockRes();

    await middleware(req, res, mockNext);

    expect(req.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalled();
  });
});
