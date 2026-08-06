/**
 * Stable Auth.js secret.
 *
 * Never auto-generate inside the bundle: if `process.env.AUTH_SECRET` is
 * momentarily unavailable (e.g. a Turbopack chunk evaluated before env
 * loading), Auth.js falls back to a RANDOM per-process secret and then fails
 * to decrypt previously-issued session cookies with
 * "JWTSessionError: no matching decryption secret".
 *
 * `AUTH_SECRET` from the environment is used in production. The fallback is a
 * fixed development secret so every chunk always derives the same key.
 */
export const AUTH_SECRET =
  process.env.AUTH_SECRET ??
  "dev-only-zacode-secret-0123456789abcdef0123456789abcdef";
