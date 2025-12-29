بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

<p dir="rtl">Dashboards</p>

## Template Author

[@satnaing](https://github.com/satnaing)

## License

Licensed under the [MIT License](https://choosealicense.com/licenses/mit/)

## Run on a single PC (without Docker)

When you are the only person using the dashboard on your own computer, you can keep everything lightweight and skip containers entirely. The API serves the SQLite database from the local filesystem and the web client ships a static build that runs in a browser.

👉 For a full walkthrough that covers prerequisite installs, directory layout, PM2 boot configuration, updates, and backups, read [`docs/self-hosting-guide.md`](./docs/self-hosting-guide.md).

### Prerequisites

- Node.js 20+
- PNPM 10+ (`corepack enable pnpm` on recent Node installs)

### One-time setup

```bash
pnpm install
pnpm build
```

### Keep the services running 24/7 with PM2

1. Install PM2 globally (once):

	```bash
	pnpm add -g pm2
	```

2. Launch both processes using the included `ecosystem.config.cjs`:

	```bash
	pm2 start ecosystem.config.cjs
	pm2 save
	```

	- `crm-api` runs `pnpm start:api` → `node ./apps/api/dist/src/index.js`
	- `crm-web` runs `pnpm start:web` → `vite preview --host 0.0.0.0 --port 4173`

3. (Optional) Auto-start on Windows login so the services boot with the PC:

	```bash
	pm2 install pm2-windows-startup
	```

	The next reboot restores the saved process list automatically. You can also recover manually with `pm2 resurrect`.

4. Useful PM2 commands:

	```bash
	pm2 status          # show process health
	pm2 logs crm-api    # tail API logs
	pm2 restart crm-web # restart the web server after a new build
	pm2 delete crm-api  # remove a process from the list
	```

If you prefer to stop PM2 from launching at boot, run `pm2 uninstall pm2-windows-startup` and `pm2 delete all`.

## Docker

### Prerequisites

- Docker Desktop 4.24+ (or Docker Engine 24+)
- PNPM is **not** required on the host – everything is installed inside the images

### Configure environment

The containers rely on a handful of runtime values. Create a `.env` file next to `docker-compose.yml` and populate it with the required secrets:

```dotenv
# Optional overrides — defaults are:
#   NODE_ENV=development → file:./dev.db (stored next to the API code)
#   NODE_ENV=production  → file:/data/prod.db (persisted in the api-data volume)
# DATABASE_URL="file:/data/prod.db"

# Switch to LibSQL/Turso by overriding the URL and supplying a token
# DATABASE_URL="https://<your-libsql-endpoint>"
# DATABASE_AUTH_TOKEN="<database-auth-token>"

# Optional overrides
TRUSTED_ORIGINS="http://localhost:4173"
VITE_API_URL="http://localhost:9999/api"
LOG_LEVEL="info"
```

> The compose file maps the API to `http://localhost:9999` and the web client to `http://localhost:4173` by default. Update the values above if you change those ports. The SQLite data lives inside the named Docker volume `api-data` (production) or `apps/api/dev.db` (development), so it survives restarts in both environments.

### Build and run locally

```bash
# Build both images (api + web)
pnpm docker:build

# Start the stack in detached mode
pnpm docker:up

# Inspect container status
pnpm docker:ps

# Stream API logs
pnpm docker:logs:api

# Stop the stack
pnpm docker:down
```

After the services start you can browse the UI at [http://localhost:4173](http://localhost:4173) and access the API at [http://localhost:9999/api](http://localhost:9999/api).

### Container maintenance

- Rebuild the images after dependency updates: `docker compose build --no-cache`
- Tail logs for a specific service: `docker compose logs -f api`
- Tear everything down (and remove volumes): `docker compose down -v`
