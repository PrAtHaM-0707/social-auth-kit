# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
