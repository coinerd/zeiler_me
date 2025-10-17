export default ({ env }) => ({
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
    sessions: {
      accessTokenLifespan: env.int('ADMIN_SESSION_ACCESS_TOKEN_LIFESPAN', 1800),
      maxRefreshTokenLifespan: env.int('ADMIN_SESSION_MAX_REFRESH_TOKEN_LIFESPAN', 2592000),
      idleRefreshTokenLifespan: env.int('ADMIN_SESSION_IDLE_REFRESH_TOKEN_LIFESPAN', 604800),
      maxSessionLifespan: env.int('ADMIN_SESSION_MAX_SESSION_LIFESPAN', 2592000),
      idleSessionLifespan: env.int('ADMIN_SESSION_IDLE_SESSION_LIFESPAN', 3600),
    },
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
  secrets: {
    encryptionKey: env('ENCRYPTION_KEY'),
  },
  flags: {
    nps: env.bool('FLAG_NPS', true),
    promoteEE: env.bool('FLAG_PROMOTE_EE', true),
  },
});
