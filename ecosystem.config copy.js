module.exports = {
  apps: [
    {
      name: "crm-api",
      cwd: __dirname,
      script: "pnpm",
      args: "start:api",
      env: {
        NODE_ENV: "production",
        PORT: 9999,
        CLIENT_URL: "http://localhost:4173",
        TRUSTED_ORIGINS: "http://localhost:4173",
        DATABASE_URL: "file:./data/prod.db",
        DATABASE_AUTH_TOKEN: "bce89ec2cf06008c47f78df78504b6f8fb5f5ced9d043b3d49113d92976f21b8",
        LOG_LEVEL: "error",
        BETTER_AUTH_SECRET: "709746890cedafa396ab9ea6513bb8ec26552c34f58440b10df2c29b9752b298",
        BETTER_AUTH_URL: "http://localhost:9999"
      },
      autorestart: true,
      max_memory_restart: "4096M",
    },
    {
      name: "crm-web",
      cwd: __dirname,
      script: "pnpm",
      args: "start:web",
      env: {
        NODE_ENV: "production",
        VITE_API_URI: "http://localhost:9999",
        BASE_URL: "http://localhost:4173"
      },
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
}
