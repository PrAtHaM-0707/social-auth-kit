# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.2.1] - 2026-07-22
### Fixed
- **API Consistency**: Exposed the `allowedDomains` option to the Express middleware (`expressGoogleAuth`) and the `SocialAuth` class so it can be utilized globally.

## [1.2.0] - 2026-07-22
### Added
- **Enterprise Hosted Domain Validation**: Support for `allowedDomains` configuration to restrict login to specific Google Workspace domains (hd claim).
- **Raw Payload Access**: The returned user object now automatically includes a `raw` property containing the full, unparsed Google payload, allowing access to custom fields (e.g., `given_name`, `locale`).
- **New error code**: `DOMAIN_NOT_ALLOWED` for when a user's domain is not in the `allowedDomains` list.

## [1.1.0] - 2026-03-25
### Added
- **Thread-safe OAuth2Client singleton**: Promise-based lazy initialization prevents race conditions under high concurrency
- **Request timeout handling**: Configurable timeout (default 5 seconds) for token verification to prevent hanging requests
- **Token size validation**: DoS protection with 5KB max token size check
- **Clock skew tolerance**: 5-minute tolerance for distributed systems with clock drift
- **Enhanced Client ID validation**: Robust validation for string and array client ID formats
- **Lightweight logger support**: Optional logger object for error tracking and debugging
- **Express middleware options**:
  - `required` (boolean, default: true): Make authentication optional
  - `property` (string, default: "user"): Customize where user is attached (e.g., req.authUser)
  - `timeout` (number, default: 5000): Custom verification timeout
  - `logger` (object): Pass custom logger for audit trails
- **Enhanced token extraction**: Improved regex-based extraction with better edge case handling
- **New error code**: `VERIFICATION_TIMEOUT` for timeout scenarios

### Improved
- Optional authentication mode: Skip token verification if `required: false` in middleware
- Error handling consistency: All errors properly use AuthError with code and statusCode
- SocialAuth class: Now supports logger and timeout configuration
- Documentation: Enhanced JSDoc with examples and detailed parameter descriptions
- Bearer token extraction: Handles multiple spaces and format variations

### Fixed
- Race condition in OAuth2Client singleton initialization
- Missing timeout handling for verification requests
- Insufficient input validation for token size and client ID
- Token expiration check too strict (now allows clock skew)

### Security
- Token size validation prevents potential DoS attacks
- Strong Client ID validation prevents malformed configurations
- Request timeout prevents resource exhaustion
- Better error messages don't leak sensitive details

## [1.0.0] - 2026-03-04
### Added
- Initial release
- Google OAuth 2.0 token verification
- Explicit checking of `aud`, `iss`, and `email_verified`
- Expiry, sub, and email validation built-in
- Support for `String | String[]` Client IDs
- Exposes `SocialAuth` class for scalable future provider additions
- Express middleware for automated token extraction and validation
- Typed JSDoc configurations exporting TypeScript definitions
