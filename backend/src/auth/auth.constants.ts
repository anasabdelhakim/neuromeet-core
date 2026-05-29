// =========================
// CENTRALIZED AUTH CONSTANTS
// =========================
// SECURITY: All time-related and security constants live here so they are
// never duplicated or out of sync across the codebase.
//
// NOTE: `as const` is critical — it preserves the literal string types
// ('1h', '7d') so @nestjs/jwt accepts them as valid `StringValue` for expiresIn.
export const AUTH_CONSTANTS = {
  /** Access token lifetime (JWT `expiresIn` format) */
  ACCESS_TOKEN_EXPIRY: '1h',

  /** Refresh token lifetime (JWT `expiresIn` format) */
  REFRESH_TOKEN_EXPIRY: '7d',

  /** Maximum number of times a refresh token chain can be extended */
  REFRESH_TOKEN_MAX_USES: 5,

  /** Reset-password token validity window in milliseconds (10 minutes) */
  RESET_TOKEN_EXPIRY_MS: 10 * 60 * 1000,

  /** OTP validity window in milliseconds (15 minutes) */
  OTP_EXPIRY_MS: 15 * 60 * 1000,

  /** How long an unverified user is kept before cleanup deletes it (24 hours) */
  UNVERIFIED_USER_MAX_AGE_MS: 24 * 60 * 60 * 1000,

  /** bcrypt cost factor — 12 is the recommended minimum for production */
  BCRYPT_SALT_ROUNDS: 12,
} as const;
