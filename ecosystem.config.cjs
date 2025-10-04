module.exports = {
  apps: [
    {
      name: "crm-api",
      cwd: __dirname,
      script: "pnpm",
      args: "start:api",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "crm-web",
      cwd: __dirname,
      script: "pnpm",
      args: "start:web",
      env: {
        NODE_ENV: "production",
      },
      autorestart: true,
      max_memory_restart: "512M",
    },
  ],
}
