Here is a complete, copy-paste-ready prompt designed for another instance of Antigravity. It contains all the necessary architectural context, server credentials/access method, resource constraints, and safety guidelines:

```markdown
You are task-assigned to deploy and host the self-hosted WhatsApp automation platform **WhatsFlow** to our production cloud server.

### 🎯 Primary Objective
Safely package, deploy, and host the **WhatsFlow** platform located at `D:\Project files\ML Projects\Whatsapp` onto our live DigitalOcean server (`146.190.11.227`), ensuring zero disruption to our existing production fintech services running on that same host.

---

### 💻 Target Server Environment & SSH Access
- **Host IP:** `146.190.11.227`
- **SSH User:** `root`
- **SSH Connectivity:** Configured and working from this Windows machine using:
  `ssh -o StrictHostKeyChecking=no root@146.190.11.227 "<command>"`
- **Hardware Profile:**
  - 1 vCPU (DO-Regular @ 2.0 GHz)
  - 1.92 GiB Total RAM (~980 MiB currently free/available, 2.0 GiB swap)
  - 48 GiB Disk (~35 GiB available)
- **Active Co-Hosted Production Services:**
  - `nakshatra-backend` (NestJS API for NBFC fixed-income orders)
  - `nakshatra-postgres` (PostgreSQL 15 — double-entry ledger)
  - `nakshatra-redis` (Redis 7 — concurrency mutex locks)
  - `nakshatra-frontend` (Nginx static reverse proxy)
  *Existing containers consume ~124 MB RAM combined.*

---

### 📦 Source Application Details (`D:\Project files\ML Projects\Whatsapp`)
1. **Backend Engine (`evolution-goo/`):**
   - High-performance WhatsApp multi-device companion daemon written in Go (Gin + GORM + `go.mau.fi/whatsmeow`).
   - Uses zero-overhead WebSocket protocols (NO headless Chromium/Puppeteer).
   - Supports embedded SQLite (`POSTGRES_USERS_DB=sqlite://dbdata/evolution.db`) or PostgreSQL.
   - Existing Dockerfile: `D:\Project files\ML Projects\Whatsapp\evolution-goo\Dockerfile`
   - Config file: `D:\Project files\ML Projects\Whatsapp\evolution-goo\.env`
   - Default port: `8080` (or `4000`).

2. **Frontend Dashboard (`web/`):**
   - React 18 + Vite + Tailwind CSS dashboard.
   - Communicates with the backend via `VITE_API_URL`.
   - Can be served via Nginx on the host or deployed to Vercel/Cloudflare.

---

### ⚠️ Critical Constraints & Safety Rules (STRICT)
1. **DO NOT BUILD IMAGES OR COMPILE GO ON THE SERVER:**
   Because the server only has 1 vCPU and 2GB RAM, running `docker build` or `go build` directly on the droplet will spike CPU to 100% and risk triggering the Linux OOM-killer against our financial Postgres/NestJS services.
   *Always build the Docker image locally on this Windows machine and stream it via pipeline:*
   ```powershell
   docker build -t whatsflow-backend:latest -f "D:\Project files\ML Projects\Whatsapp\evolution-goo\Dockerfile" "D:\Project files\ML Projects\Whatsapp\evolution-goo"
   docker save whatsflow-backend:latest | ssh -o StrictHostKeyChecking=no root@146.190.11.227 "docker load"
   ```
   *(Or cross-compile the Linux Go binary locally if deploying as a standalone systemd service).*

2. **ENFORCE HARD DOCKER RESOURCE LIMITS:**
   WhatsFlow's container must be capped so it never starves the server:
   - `cpus: '0.40'`
   - `memory: 250M`

3. **PERSISTENCE & STORAGE:**
   - Mount persistent host volumes for SQLite data and session auth tokens (e.g., `/var/lib/whatsflow/dbdata` -> `/app/dbdata` and `/var/lib/whatsflow/logs` -> `/app/logs`).

---

### 📋 Action Plan for You to Execute
1. **Inspect Local Setup:**
   - Read `D:\Project files\ML Projects\Whatsapp\evolution-goo\.env` and `web/package.json`.
   - Decide on port mapping (e.g. Host `8080` or `4000` to avoid conflicts with Nakshatra's port `3000`/`80`/`443`).

2. **Build & Stream Artifacts:**
   - Build the backend Docker image locally and pipe it directly to `root@146.190.11.227`.
   - Build the frontend (`npm run build` inside `web/`) if hosting on server Nginx, or prepare it for edge deployment.

3. **Deploy & Configure on Server:**
   - Create remote directories: `/var/www/whatsflow` and data volume paths.
   - Create a clean `docker-compose.yml` with restart policies, resource caps (`250M`), and volume bindings.
   - Start the container: `docker compose up -d`.

4. **Web & Reverse Proxy Setup:**
   - Configure Nginx reverse proxy (or add a server block) with SSL/Certbot if mapping to a subdomain (e.g. `whatsapp.nakshtraventures.in`), or expose the chosen API port with proper API Key headers.

5. **Verification & Diagnostics:**
   - Verify container health via `docker ps` and `docker stats --no-stream`.
   - Test the HTTP health/API endpoint (e.g., `curl -I http://146.190.11.227:<PORT>/`).
   - Confirm Nakshatra core services (`nakshatra-backend`, `nakshatra-postgres`) remain completely healthy and unaffected.

Please review the codebase, confirm the configuration plan, and proceed with the deployment.
```