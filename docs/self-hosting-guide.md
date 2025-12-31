بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ

<p dir="rtl">takumitex Self-Hosting Guidebook (Single Windows PC + PM2)</p>

This guide walks through every step required to run the Universal Packaging and Accessories takumitex on a single Windows computer. It covers installing prerequisites, fetching the repository, preparing the build, configuring the process manager, and operating the stack day to day. Follow the sections in order for a smooth setup.

## 1. System prerequisites

- **Windows 10/11** with administrator access
- **PowerShell** or **Git Bash** (installed with Git) for running commands
- **Git 2.40+** ([download](https://git-scm.com/download/win))
- **Node.js 20 LTS** ([download](https://nodejs.org/en/download))
- Internet access to download dependencies

> If Node.js was already installed, confirm the version with `node -v`. It should be `v20.x`. Update if necessary.

## 2. Enable PNPM (package manager)

1. Open **PowerShell** (Run as Administrator is recommended for the first command).
2. Enable Corepack so Node can manage PNPM automatically:
   ```powershell
   corepack enable pnpm
   ```
3. Verify the version:
   ```powershell
   pnpm -v
   ```
   Expect to see a `10.x` release. If Corepack warns about activation, re-run the command.

## 3. Choose where the project will live

Pick a permanent folder so the database file remains stable between reboots. A common choice is `C:\takumitex`.

```powershell
New-Item -ItemType Directory -Path C:\takumitex
Set-Location C:\takumitex
```

You can substitute another drive if preferred (e.g., `D:\Projects\takumitex`). Make sure the path does not contain spaces to keep scripts simple.

## 4. Download the repository

Option A – **Clone with Git** (recommended for receiving updates):
```powershell
git clone https://github.com/saeidex/takumitex.git
Set-Location .\takumitex
```

Option B – **Download as ZIP**:
1. Visit the repository page on GitHub.
2. Click **Code → Download ZIP**.
3. Extract the archive into the folder created above.
4. Open PowerShell inside the extracted folder.

## 5. Install dependencies

From the project root (`C:\takumitex\takumitex` if you cloned inside `C:\takumitex`):
```powershell
pnpm install
```

This installs dependencies for all workspaces (API, web client, shared packages).

## 6. Prepare environment variables

1. Copy the example environment file if available or create a new `.env` next to `docker-compose.yml`:
   ```powershell
   Copy-Item .env.example .env
   ```
   If `.env.example` does not exist, create `.env` manually with the following defaults:
   ```dotenv
   NODE_ENV=production
   TRUSTED_ORIGINS=http://localhost:4173
   VITE_API_URL=http://localhost:9999/api
   LOG_LEVEL=info
   ```
2. Save the file. For a single-user install the default SQLite location (`apps/api/dev.db`) is perfect.

## 7. Build the applications

Compile both the API and the web client once so the production artifacts exist:
```powershell
pnpm build
```

- The API build outputs `apps/api/dist`.
- The web build outputs `apps/web/dist`.

Re-run this command whenever you update the source code.

## 8. Review the PM2 ecosystem file

The repository ships with `ecosystem.config.cjs` in the root directory. It starts two apps:

- `takumitex-api` → `pnpm start:api` (`node ./apps/api/dist/src/index.js`)
- `takumitex-web` → `pnpm start:web` (serves the web bundle via Vite preview)

Open the file if you want to tweak names or ports. By default the web client listens on `127.0.0.1:4173` and the API on `127.0.0.1:9999`.

## 9. Install PM2 globally

Still from the project root:
```powershell
pnpm add -g pm2
```

Confirm the installation:
```powershell
pm2 -v
```

## 10. Launch the services under PM2

Start both processes and record the initial state:
```powershell
pm2 start ecosystem.config.cjs
pm2 save
```

PM2 will keep both services alive, restart them after crashes, and remember them across reboots (once startup is configured in the next step).

## 11. Configure auto-start on Windows boot

Install the PM2 Windows startup helper so the saved processes resume when the PC powers on:
```powershell
pm2 install pm2-windows-startup
```

After running this command once, Windows logs will trigger PM2 and load the saved process list automatically. You can test it with a reboot, or reload manually:
```powershell
pm2 resurrect
```

## 12. Everyday operations

- Check status:
  ```powershell
  pm2 status
  ```
- Tail API logs:
  ```powershell
  pm2 logs takumitex-api
  ```
- Restart after code changes (post-`pnpm build`):
  ```powershell
  pm2 restart takumitex-api takumitex-web
  ```
- Stop everything temporarily:
  ```powershell
  pm2 stop all
  ```
- Remove processes completely:
  ```powershell
  pm2 delete all
  ```

## 13. Updating the application

When you pull new code from Git or copy updated files:

1. Fetch changes:
   ```powershell
   git pull origin main
   ```
2. Install any new dependencies:
   ```powershell
   pnpm install
   ```
3. Rebuild assets:
   ```powershell
   pnpm build
   ```
4. Restart running services:
   ```powershell
   pm2 restart takumitex-api takumitex-web
   ```

## 14. Backing up your data

The SQLite database used in production mode is stored in `apps\api\dev.db` by default. Copy this file periodically to a safe location:
```powershell
Copy-Item apps\api\dev.db D:\Backups\takumitex\dev-$(Get-Date -Format yyyyMMdd).db
```

If you ever switch to Docker or an external LibSQL/Turso database, update the backup strategy accordingly.

## 15. Automate backups with PM2

PM2 can run scheduled jobs using cron syntax. The repository includes `scripts/backup.ps1`, which copies the SQLite file to a timestamped archive. You can keep the backups outside the repo by setting a destination folder.

1. Pick a backup folder (defaults to `./backups` relative to the repo). Optionally set an environment variable so the script writes somewhere else:
   ```powershell
   $env:takumitex_BACKUP_DIR = "D:\Backups\takumitex"
   ```
   To persist this across sessions, run:
   ```powershell
   setx takumitex_BACKUP_DIR "D:\Backups\takumitex"
   ```

2. Test the script once to confirm it works:
   ```powershell
   pwsh -File .\scripts\backup.ps1
   ```
   You should see `Backup created at ...` and a new `.db` file in the backup directory.

3. (Optional) Configure retention. By default the script keeps 30 days of backups. To keep a different number of days (or disable cleanup by setting `0`), set the variable:
   ```powershell
   $env:takumitex_BACKUP_RETENTION_DAYS = "14"
   setx takumitex_BACKUP_RETENTION_DAYS "14"
   ```

4. Register a PM2 cron job that runs the script every day at 2:00 AM:
   ```powershell
   pm2 start .\scripts\backup.ps1 --name takumitex-backup --interpreter pwsh --cron "0 2 * * *" --no-autorestart
   pm2 save
   ```

   - `--cron "0 2 * * *"` schedules the job daily at 02:00.
   - `--no-autorestart` prevents PM2 from immediately rerunning the script after it exits. PM2 will only execute it when the cron expression matches.

5. Verify the schedule:
   ```powershell
   pm2 describe takumitex-backup
   ```
   The output should list the cron expression and the next run time. Backups appear regularly in your chosen directory. Combine this with an external drive or cloud sync for off-site storage.

## 16. Optional enhancements

- **HTTPS front-end**: add a local reverse proxy (e.g., Caddy) with mkcert-generated certificates if you want `https://localhost`.
- **Reverse proxy on LAN**: run Nginx or Caddy on another port and forward to the PM2 processes for devices on the same network.
- **Scheduled tasks**: pair PM2 with Windows Task Scheduler for extra safeguards or regular backups.

---

You now have a repeatable process for running the takumitex continuously on your PC. Bookmark this guide so you can revisit any section when updating or troubleshooting your installation.
