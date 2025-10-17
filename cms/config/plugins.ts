export default ({ env }) => ({
  graphql: {
    enabled: true,
    config: {
      defaultLimit: 100,
      maxLimit: 1000,
      apolloServer: {
        introspection: true,
      },
    },
  },
  "markdown-field": {
    enabled: true,
    resolve: "./src/plugins/markdown-field",
  },
  upload: {
    config: {
      provider: env("UPLOAD_PROVIDER", "local"),
      sizeLimit: env.int("UPLOAD_SIZE_LIMIT", 250 * 1024 * 1024),
      providerOptions: {
        localServer: {
          maxage: 300000,
        },
      },
    },
  },
});
