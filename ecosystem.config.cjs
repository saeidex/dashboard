module.exports = {
  apps: [
    {
      name: "takumitex-api",
      cwd: __dirname,
      script: "cmd",
      args: "/c pnpm start:api",
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "takumitex-web",
      cwd: __dirname,
      script: "cmd",
      args: "/c pnpm start:web",
      autorestart: true,
      max_memory_restart: "512M",
    },
    {
      name: "ngrok",
      cwd: __dirname,
      script: "cmd",
      args: "/c pnpm start:ngrok",
      autorestart: true,
      max_memory_restart: "256M",
    }
  ],
};
