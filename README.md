# WhatsFlow — Self-Hosted WhatsApp Multi-Account & Automation Platform

<p align="center">
  <img src="evolution-goo/public/hover-evolution.png" alt="WhatsFlow Platform" width="120" />
</p>

<p align="center">
  <b>High-performance, multi-account WhatsApp management, instant QR pairing, rule-based automations, and CRM dashboard.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Engine-Go%201.25+-00ADD8?style=flat&logo=go" alt="Go Engine" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-61DAFB?style=flat&logo=react" alt="React Vite" />
  <img src="https://img.shields.io/badge/Protocol-whatsmeow-25D366?style=flat&logo=whatsapp" alt="whatsmeow" />
  <img src="https://img.shields.io/badge/Database-PostgreSQL%20%2F%20SQLite-4169E1?style=flat&logo=postgresql" alt="Database" />
  <img src="https://img.shields.io/badge/Deployment-Vercel%20%2B%20Docker-000000?style=flat&logo=vercel" alt="Vercel & Docker" />
  <img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg" alt="License" />
</p>

---

## 🚀 Overview

**WhatsFlow** is a complete, self-hosted WhatsApp Web management and automation platform. Built as a modular architecture with **Evolution Go** (`whatsmeow`) as the underlying multi-device connectivity engine, it provides a clean, modern SaaS-style web interface to manage multiple WhatsApp accounts, schedule messaging, run auto-reply workflows, and maintain contact consent lists.

### Why WhatsFlow?
- **Multi-Device Support**: Connect multiple WhatsApp numbers simultaneously using genuine WhatsApp Web companion pairing.
- **Zero-Dependency Local Dev**: Supports pure-Go embedded SQLite out of the box — start testing immediately without installing or configuring external database servers.
- **Production PostgreSQL Ready**: Seamlessly switch to PostgreSQL for high-throughput enterprise deployments with Docker Compose.
- **Hybrid Vercel Architecture**: Deploy the blazing-fast React SPA dashboard to **Vercel** while running the Go WhatsApp engine on a persistent background host (Railway, Render, Fly.io, or VPS).

---

## ✨ Key Features

| Feature | Description |
| :--- | :--- |
| **Multi-Instance Manager** | Create, view, reconnect, disconnect, or delete individual WhatsApp instances with isolated sessions. |
| **Live QR Pairing** | Real-time pairing modal with automatic QR refresh and instant detection of successful device linking — no page refreshes needed. |
| **Direct Messenger** | Dispatch formatted text, media, documents, and polls to any international WhatsApp number directly from your browser. |
| **Rule-Based Automations** | Visual trigger-condition-action engine: set keyword matchers (e.g. `PRICE`, `SUPPORT`, `DEMO`) that reply automatically with customizable response delays. |
| **Contact CRM & Consent** | Address book with tagging, customer segmentation, opt-in tracking, and anti-spam suppression lists. |
| **Realtime WebSockets** | Listen to live connection changes, message receipts, and incoming events via `/ws`. |
| **Developer API & Swagger** | Full RESTful OpenAPI documentation available at `/swagger/index.html` with scoped API tokens. |

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────┐
│             WhatsFlow React Dashboard (web/)           │
│   (Instances | Live QR | Automations | CRM | Messenger)│
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS / WebSockets
┌──────────────────────────▼─────────────────────────────┐
│             Evolution Go API Gateway (evolution-goo/)   │
│   - License runtime & GORM Database abstraction        │
│   - WhatsApp Multi-Device Companion Protocol (whatsmeow)│
│   - Event Producers (WebSocket, Webhook, AMQP, NATS)   │
└──────────────────────────┬─────────────────────────────┘
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐
│ Embedded Local SQLite │       │ Enterprise PostgreSQL │
│ (dbdata/evolution.db) │  OR   │ (evogo_auth & users)  │
└───────────────────────┘       └───────────────────────┘
```

---

## 🛠️ Tech Stack

- **Backend**: Go (Gin Gonic, GORM, `go.mau.fi/whatsmeow`)
- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v4, Lucide Icons
- **Storage**: SQLite (`github.com/glebarez/sqlite`) / PostgreSQL 15+ / MinIO S3
- **Networking**: REST API, WebSockets (`gorilla/websocket`), Webhooks

---

## 🏁 Quick Start (Local Development)

### 1. Prerequisites
- **Go 1.25+** (Installed: Go 1.27)
- **Node.js 18+** & **npm**

### 2. Configure Environment
A ready-to-run `.env` file is located in `evolution-goo/.env`:
```env
SERVER_PORT=8080
CLIENT_NAME=evolution
GLOBAL_API_KEY=429683C4C977415CAAFCCE10F7D57E11
POSTGRES_AUTH_DB=
POSTGRES_USERS_DB=sqlite://dbdata/evolution.db
DATABASE_SAVE_MESSAGES=true
WADEBUG=INFO
CONNECT_ON_STARTUP=true
```

### 3. Run the Backend Engine
```bash
cd evolution-goo
go run cmd/evolution-go/main.go -dev
```
*The backend starts on `http://localhost:8080`.*

### 4. Run the Web Dashboard
```bash
cd web
npm install
npm run dev
```
*Open `http://localhost:3333` in your browser.*

---

## ☁️ Deployment Guide

### Deploying the Dashboard on Vercel
1. Push your project to **GitHub**.
2. In the [Vercel Dashboard](https://vercel.com/new), import your repository.
3. Configure the project:
   - **Root Directory**: `web`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, set:
   ```env
   VITE_API_URL=https://your-backend-domain.com
   ```
5. Click **Deploy**. Vercel will build and serve your frontend globally via edge CDN!

### Deploying the Backend Engine (Docker / VPS / Railway)
Because WhatsApp multi-device connections require a **persistent 24/7 background TCP daemon**, host `evolution-goo` on a VPS (Ubuntu, Debian) or a container host like Railway / Render:

```bash
cd evolution-goo
# Run with Docker Compose
docker compose -f docker/examples/docker-compose.yml up -d
```

---

## 🛡️ Anti-Spam & Responsible Use

This platform uses unofficial WhatsApp Web companion multi-device protocols via `whatsmeow`.
- **Always respect user consent**: Ensure all recipients have explicitly opted in to receive communication.
- **Honor opt-outs**: Immediately suppress contacts who request to stop receiving messages.
- **Rate Limiting**: Space out automated message bursts with reasonable delays (2–5 seconds) to avoid WhatsApp account flags.
- For high-volume transactional notifications, consider pairing with the official WhatsApp Business Cloud API.

---

## 📄 License & Attribution

- Built on the open-source **Evolution Go** project by the [Evolution Foundation](https://evolutionfoundation.com.br).
- Licensed under the **Apache License 2.0**.
- WhatsApp is a trademark of Meta Platforms, Inc. This project is not affiliated with, funded, or endorsed by Meta or WhatsApp.

