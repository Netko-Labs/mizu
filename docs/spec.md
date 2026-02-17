# Mizu Specification

> **Status:** Draft v0.1
> **Last Updated:** 2025-02-04

---

## 1. Overview

**Mizu** (水) is a self-hosting platform for macOS home labs. It provides a visual canvas interface for deploying and managing containerized applications on Apple hardware.

### 1.1 Target Users

- **Developers** who want to self-host side projects without cloud bills
- **Hobbyists** running home labs on spare Mac hardware
- **Technical level:** Familiar with containers but tired of YAML/CLI-heavy workflows

### 1.2 Design Principles

| Principle | Description |
|-----------|-------------|
| **Visual-first** | The canvas is the primary interface; everything happens in the GUI |
| **Opinionated defaults** | Works out of the box; escape hatches when needed |
| **Self-contained** | Mizu runs as Docker containers; no native installation required |
| **macOS-native** | Built for Apple hardware, not a Linux port |

---

## 2. Architecture

### 2.1 Deployment Model

**Mizu runs as a group of Docker containers** (Docker-in-Docker pattern). This provides:

- **Easy installation** — Single curl command to get started
- **Self-contained** — All dependencies packaged together
- **Portable** — Same setup across different macOS versions
- **Upgradeable** — Pull new images to update

### 2.2 Installation

**Coolify-style install script:**

```bash
curl -fsSL https://get.mizu.dev | bash
```

The script:
1. Checks Docker is installed and running
2. Creates `~/.mizu` directory for configuration
3. Pulls Mizu container images
4. Starts the Mizu stack
5. Opens the web UI in browser

### 2.3 Container Stack

Mizu itself consists of these containers:

```
┌─────────────────────────────────────────────────────────────┐
│                      mizu-network                           │
│  ┌──────────────────────────────────────────────────────┐  │
│  │                   mizu-proxy (Caddy)                 │  │
│  │              Reverse proxy for all services          │  │
│  │                    Ports: 80, 443                    │  │
│  └──────────────────────────────────────────────────────┘  │
│                              │                              │
│         ┌────────────────────┼────────────────────┐        │
│         ▼                    ▼                    ▼        │
│  ┌────────────┐      ┌────────────┐      ┌────────────┐   │
│  │ mizu-app   │      │ mizu-db    │      │ mizu-      │   │
│  │ (Web UI +  │      │ (Postgres) │      │ registry   │   │
│  │  API)      │      │            │      │ (local     │   │
│  │            │      │            │      │  images)   │   │
│  └────────────┘      └────────────┘      └────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Docker socket mount
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Host Docker Daemon                       │
│         (User-deployed projects run here)                   │
└─────────────────────────────────────────────────────────────┘
```

| Container | Purpose |
|-----------|---------|
| `mizu-proxy` | Caddy reverse proxy; routes traffic to Mizu and user services |
| `mizu-app` | TanStack Start app; Web UI + tRPC API |
| `mizu-db` | PostgreSQL; Mizu's internal database |
| `mizu-registry` | Local Docker registry for built images |

### 2.4 Docker Socket Access

Mizu mounts the host's Docker socket (`/var/run/docker.sock`) to manage user containers. This allows:

- Creating/starting/stopping user service containers
- Building images from Git repositories
- Inspecting container logs and status

**Security note:** Docker socket access grants significant privileges. Mizu should only be run on trusted machines.

### 2.5 Container Runtime

| Phase | Runtime | Notes |
|-------|---------|-------|
| **Now** | Docker | Assume Docker Desktop/OrbStack installed |
| **Future** | Apple Containers | macOS-native, exclusive support planned |

**Prerequisites:** Users must have Docker installed before running the install script.

### 2.6 Local Docker Registry

Mizu runs a local Docker registry (`mizu-registry`) for:

- Storing images built from Git repositories
- Faster local deployments (no round-trip to Docker Hub)
- Offline capability for previously built images

The registry is accessible at `localhost:5000` from the host.

---

## 3. Core Concepts

### 3.1 Entity Hierarchy

```
Account (User)
    └── Project
            ├── Service (container)
            │       ├── Environment Variables
            │       ├── Volumes
            │       └── Domain/Port mappings
            ├── Database (managed service)
            │       └── Connection credentials
            └── Resource (shared infrastructure)
                    └── Volumes, Networks, Secrets
```

### 3.2 Projects

A **Project** is a collection of related services that form a deployable stack.

| Property | Description |
|----------|-------------|
| `name` | Human-readable identifier |
| `slug` | URL-safe identifier (auto-generated from name) |
| `network` | Isolated Docker network (`mizu-{slug}`) |

**Domain pattern:** Services are accessible at `{service}.{project-slug}.{base-domain}`

**Network Isolation:**
- Each project gets its own Docker network
- Services within a project can communicate by service name
- Cross-project communication requires explicit configuration

### 3.3 Services

A **Service** is a deployable container.

**Deployment Sources:**

| Source | Description | Priority |
|--------|-------------|----------|
| Docker Image | Pull from registry (Docker Hub, GHCR, etc.) | v1 |
| Git Repository | Clone, build, push to local registry | v1 |
| One-Click App | Pre-configured templates | v1 |

**Service Properties:**

```typescript
interface Service {
  id: string
  projectId: string
  name: string

  // Deployment source (one of)
  source:
    | { type: 'image'; image: string; tag: string }
    | { type: 'git'; repo: string; branch: string; dockerfile?: string }
    | { type: 'template'; templateId: string }

  // Configuration
  env: Record<string, string>
  volumes: Volume[]
  ports: PortMapping[]

  // Domain & Networking
  domain: string           // e.g., "api.myproject.mizu.example.com"
  // Domain is auto-generated: {name}.{project}.{base-domain}

  // Runtime
  status: 'stopped' | 'starting' | 'running' | 'error'
  containerId?: string
}
```

### 3.4 Databases (Managed Services)

Pre-configured database services with automatic credential management.

**Supported Databases:**

| Database | Image | Default Port |
|----------|-------|--------------|
| PostgreSQL | `postgres:16-alpine` | 5432 |
| MySQL | `mysql:8` | 3306 |
| MariaDB | `mariadb:11` | 3306 |
| Redis | `redis:7-alpine` | 6379 |
| MongoDB | `mongo:7` | 27017 |

**Auto-generated:**
- Database name
- Username/password
- Connection string (injected as env var to linked services)

### 3.5 Resources

Shared infrastructure components:

| Resource | Description |
|----------|-------------|
| **Volume** | Persistent storage mounted to services |
| **Secret** | Encrypted key-value pairs |
| **Network** | Custom Docker networks (beyond project default) |

---

## 4. The Canvas

The canvas is a visual representation of a project's stack. It is **the primary interface** for designing and managing deployments.

### 4.1 Inspiration

- [Railway](https://railway.com) — Canvas-based project visualization
- [Sevalla](https://sevalla.com) — Clean service topology
- [n8n](https://n8n.io) — Node-based workflow editor

### 4.2 Node Types

| Node | Visual | Represents |
|------|--------|------------|
| **Service** | Rectangle with icon | Docker container |
| **Database** | Cylinder | Managed database |
| **Volume** | Folder icon | Persistent storage |
| **External** | Cloud icon | External URL/API |

### 4.3 Edges (Connections)

Edges represent **relationships** between nodes:

| Edge Type | Meaning | Visual |
|-----------|---------|--------|
| **Depends On** | Service A needs Service B running first | Solid arrow |
| **Connects To** | Network link (can communicate) | Dashed line |
| **Mounts** | Service uses this volume | Dotted line to volume |
| **References** | Uses environment variable from | Subtle connector |

### 4.4 Canvas Behavior

- **Drag & Drop:** Add new services/databases from sidebar
- **Connect:** Draw edges between nodes to establish relationships
- **Select:** Click node to open detail panel
- **Context Menu:** Right-click for actions (start, stop, logs, delete)
- **Auto-layout:** Automatic arrangement with manual override

### 4.5 Canvas as Source of Truth?

**No.** The canvas is a **visualization** of the project state stored in the database.

```
Database (source of truth) → Canvas (visualization) → User edits → Database updated
```

The canvas renders from project data and dispatches mutations back.

---

## 5. Networking & Domains

### 5.1 Philosophy

**Public exposure is the primary mode.** Mizu assumes:

- User has a domain pointed at their machine
- User has configured port forwarding or tunneling
- Services should be accessible from the internet

This matches the typical home lab use case: you want to access your services from anywhere, not just your local network.

### 5.2 Reverse Proxy

**Caddy** (`mizu-proxy`) handles all HTTP routing:

- Automatic HTTPS via Let's Encrypt
- Per-service domain routing
- WebSocket support
- Automatic configuration updates when services change
- Wildcard certificate support

### 5.3 Domain Strategy

Every service gets a domain under the user's configured base domain:

```
{service}.{project}.{base-domain}
```

**Examples:**
- Base domain: `mizu.example.com`
- Project: `my-app`
- Services: `api`, `web`, `db-admin`
- Result:
  - `api.my-app.mizu.example.com`
  - `web.my-app.mizu.example.com`
  - `db-admin.my-app.mizu.example.com`

### 5.4 DNS Configuration

**User responsibility.** Mizu does not manage DNS. Users must:

1. Own a domain (e.g., `example.com`)
2. Create a wildcard DNS record pointing to their machine:
   ```
   *.mizu.example.com → [your IP or tunnel]
   ```
3. Configure their network (port forwarding, Cloudflare Tunnel, Tailscale, etc.)

### 5.5 First-Run Domain Setup

On first run, Mizu prompts for:

| Setting | Example | Purpose |
|---------|---------|---------|
| **Base Domain** | `mizu.example.com` | Root for all service domains |
| **Admin Email** | `admin@example.com` | For Let's Encrypt certificates |

### 5.6 Network Exposure Options

Users handle their own network setup. Common approaches:

| Method | How It Works |
|--------|--------------|
| **Port Forwarding** | Router forwards 80/443 to Mizu host |
| **Cloudflare Tunnel** | `cloudflared` tunnel to CF edge |
| **Tailscale Funnel** | Expose via Tailscale network |
| **Ngrok** | Persistent tunnel (paid for custom domains) |

**Mizu documentation should include guides for each method.**

### 5.7 Local-Only Mode (Optional)

For users who don't want public exposure:

- Use `localhost` as base domain
- Access services via `http://localhost:{port}`
- Or set up local DNS (dnsmasq, /etc/hosts) manually

This is a secondary use case, not the default.

---

## 6. One-Click Apps

Pre-configured application templates for common self-hosted software.

### 6.1 Template Structure

```typescript
interface AppTemplate {
  id: string
  name: string
  description: string
  icon: string
  category: 'database' | 'cms' | 'analytics' | 'devtools' | 'media' | 'other'

  // What to deploy
  services: ServiceTemplate[]
  databases?: DatabaseTemplate[]
  volumes?: VolumeTemplate[]

  // Post-deploy
  setupInstructions?: string
  defaultCredentials?: Record<string, string>
}
```

### 6.2 Priority Templates (v1)

| App | Category | Description |
|-----|----------|-------------|
| **Adminer** | devtools | Lightweight database management UI |
| **pgAdmin** | devtools | PostgreSQL administration |
| **Plausible** | analytics | Privacy-friendly analytics |
| **Umami** | analytics | Simple website analytics |
| **Ghost** | cms | Modern publishing platform |
| **WordPress** | cms | Classic CMS |

### 6.3 Future Templates

- Gitea (self-hosted Git)
- Uptime Kuma (monitoring)
- Vaultwarden (password manager)
- Jellyfin (media server)
- Nextcloud (file sync)
- n8n (workflow automation)

---

## 7. Authentication & Users

### 7.1 Auth Provider

**better-auth** — Modern TypeScript authentication library.

### 7.2 Auth Methods

| Method | v1 | Future |
|--------|:--:|:------:|
| Email/Password | ✅ | ✅ |
| Magic Link | ❌ | ✅ |
| OAuth (GitHub, Google) | ❌ | ✅ |

### 7.3 User Model

```typescript
interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user'
  createdAt: Date
}
```

### 7.4 Permissions

| Role | Capabilities |
|------|--------------|
| **Admin** | Full access, user management, system settings |
| **User** | Manage own projects, view shared projects |

### 7.5 First-Run Setup

On first launch:
1. Prompt to create admin account
2. Configure base domain
3. Optional: set up public exposure method

---

## 8. Data Model

### 8.1 Database

**PostgreSQL** for Mizu's internal data.

### 8.2 Schema Overview

```
users
  ├── id (uuid, pk)
  ├── email (unique)
  ├── name
  ├── password_hash
  ├── role
  └── timestamps

projects
  ├── id (uuid, pk)
  ├── user_id (fk → users)
  ├── name
  ├── slug (unique)
  ├── settings (jsonb)
  └── timestamps

services
  ├── id (uuid, pk)
  ├── project_id (fk → projects)
  ├── name
  ├── source_type ('image' | 'git' | 'template')
  ├── source_config (jsonb)
  ├── env_vars (jsonb, encrypted)
  ├── status
  ├── container_id
  └── timestamps

databases
  ├── id (uuid, pk)
  ├── project_id (fk → projects)
  ├── type ('postgres' | 'mysql' | 'redis' | ...)
  ├── name
  ├── credentials (jsonb, encrypted)
  ├── container_id
  └── timestamps

volumes
  ├── id (uuid, pk)
  ├── project_id (fk → projects)
  ├── name
  ├── path
  └── timestamps

service_connections
  ├── id (uuid, pk)
  ├── from_service_id (fk → services)
  ├── to_service_id (fk → services | databases)
  ├── connection_type ('depends_on' | 'network' | 'env_ref')
  └── timestamps
```

---

## 9. Build Pipeline

For Git-based deployments:

### 9.1 Build Flow

```
1. User adds Git repo URL + branch
2. Mizu clones repository (inside mizu-app container)
3. Detect or use specified Dockerfile
4. Build image via Docker socket
5. Tag and push to local registry (mizu-registry:5000)
6. Deploy container from local registry
```

### 9.2 Build Configuration

```typescript
interface BuildConfig {
  repo: string
  branch: string
  dockerfile: string      // Default: "Dockerfile"
  context: string         // Default: "."
  buildArgs?: Record<string, string>

  // Auto-detection
  detectDockerfile: boolean  // Look for Dockerfile
  detectNixpacks: boolean    // Use Nixpacks if no Dockerfile
}
```

### 9.3 Rebuild Triggers

| Trigger | Description |
|---------|-------------|
| **Manual** | User clicks "Rebuild" |
| **Webhook** | GitHub/GitLab push webhook |
| **Schedule** | Cron-based rebuild (future) |

---

## 10. Minimum Viable Product (MVP)

### 10.1 MVP Scope

The smallest useful version of Mizu:

| Feature | Included |
|---------|:--------:|
| Install script (`curl \| bash`) | ✅ |
| User authentication (email/password) | ✅ |
| Configure base domain | ✅ |
| Create project | ✅ |
| Deploy from Docker image | ✅ |
| Deploy from Git repo | ✅ |
| Add managed PostgreSQL | ✅ |
| Canvas visualization (React Flow) | ✅ |
| Connect services (env var injection) | ✅ |
| View container logs | ✅ |
| Public domains with HTTPS | ✅ |
| Start/stop/restart services | ✅ |
| One-click app: Adminer | ✅ |
| --- | --- |
| Multiple one-click apps | ❌ (post-MVP) |
| Backup system | ❌ (post-MVP) |
| Resource monitoring | ❌ (post-MVP) |
| Multi-machine | ❌ (future) |

### 10.2 MVP User Journey

**Prerequisites:**
- Docker installed and running
- Domain with wildcard DNS pointed at machine (e.g., `*.mizu.example.com`)
- Ports 80/443 accessible (port forward, tunnel, etc.)

**Journey:**

```
1. Run install script
   $ curl -fsSL https://get.mizu.dev | bash

2. Script pulls images, starts Mizu containers
   → Opens browser to setup wizard

3. First-run setup:
   - Create admin account (email/password)
   - Configure base domain (mizu.example.com)
   - Provide email for Let's Encrypt

4. Mizu dashboard opens
   - Empty project list
   - "Create Project" button

5. Create new project "my-app"
   - Canvas view opens with empty canvas

6. Add PostgreSQL database
   - Drag "Database" from sidebar
   - Select PostgreSQL
   - Node appears on canvas

7. Add service from Docker image
   - Drag "Service" from sidebar
   - Enter image: my-api:latest
   - Configure env vars
   - Node appears on canvas

8. Connect service to database
   - Draw edge from service to database
   - Mizu auto-generates DATABASE_URL
   - Edge shows on canvas

9. Deploy project
   - Click "Deploy" button
   - Watch containers start
   - Nodes turn green when healthy

10. Access service
    - https://my-api.my-app.mizu.example.com
    - HTTPS works (Let's Encrypt)

11. View logs
    - Click service node
    - Open logs panel
    - Real-time log streaming
```

---

## 11. Decisions Made

### 11.1 Installation & Distribution

**Decision: curl | bash install script** (Coolify-style)

```bash
curl -fsSL https://get.mizu.dev | bash
```

Rationale:
- Familiar pattern for self-hosted tools
- No need to maintain Homebrew tap or native app
- Easy to version and update

### 11.2 Mizu Process Model

**Decision: Docker-in-Docker**

Mizu runs as a group of Docker containers that manage other Docker containers via socket mount.

| Container | Purpose |
|-----------|---------|
| `mizu-app` | Web UI + API |
| `mizu-db` | PostgreSQL |
| `mizu-proxy` | Caddy reverse proxy |
| `mizu-registry` | Local image registry |

Rationale:
- Self-contained; no native dependencies
- Easy to upgrade (pull new images)
- Consistent environment

### 11.3 Canvas Library

**Decision: React Flow**

Rationale:
- Well-documented, large community
- Fast to implement
- Can customize styling to match Mizu's aesthetic
- Proven at scale (Railway uses similar approach)

### 11.4 Domain & DNS Strategy

**Decision: User-managed DNS, public-first**

- User configures their own domain and DNS
- Mizu only needs to know the base domain
- Caddy handles HTTPS via Let's Encrypt
- No local DNS magic needed

Rationale:
- Simpler for Mizu (no OS-level DNS manipulation)
- More flexible for users (any DNS provider, any tunnel solution)
- Matches typical home lab setup (public access desired)

---

### 11.5 Update Mechanism

**Decision: In-app update via GitHub Releases**

- Mizu checks GitHub releases for new versions
- User clicks "Update" in settings
- Mizu pulls new images and restarts containers

Flow:
```
1. Mizu periodically checks GitHub API for releases
2. If new version available, show notification in UI
3. User clicks "Update Now"
4. Mizu pulls new container images
5. Gracefully restarts the stack
6. User is redirected back to dashboard
```

### 11.6 Configuration Storage

**Decision: Host filesystem at `~/.mizu/`**

```
~/.mizu/
├── config.yaml          # Base domain, email, settings
├── docker-compose.yaml  # Generated compose file for Mizu stack
└── data/
    └── registry/        # Local registry storage (optional)
```

Rationale:
- Easy to backup
- Survives container recreation
- User can inspect/edit if needed

**Note:** Mizu's PostgreSQL database still uses a Docker volume (`mizu-db-data`) for performance.

### 11.7 Git Authentication

**Decision: Personal Access Token (PAT)**

For private repositories, users provide a PAT with repo access:

1. User adds private repo URL
2. Mizu prompts for PAT
3. PAT stored encrypted in Mizu DB
4. Used for clone operations

Rationale:
- Simplest to implement
- Works with GitHub, GitLab, Bitbucket
- User controls token scope and expiration

**Future:** Could add SSH key support or GitHub App integration.

---

## 13. Future Considerations

### 13.1 Apple Containers

When Apple Containers (macOS 26+?) becomes stable:
- Replace Docker as the only supported runtime
- Tighter macOS integration
- Better performance/security

### 13.2 Multi-Machine

Orchestrating across multiple Macs:
- Agent installed on each machine
- Central control plane
- Service placement decisions

### 13.3 Backup & Restore

- Scheduled volume backups
- Export project as portable archive
- Disaster recovery

### 13.4 Marketplace

Community-contributed templates:
- One-click apps
- Starter stacks
- Configuration presets

---

## Appendix A: Glossary

| Term | Definition |
|------|------------|
| **Project** | A collection of related services forming a deployable stack |
| **Service** | A single containerized application |
| **Database** | A managed database service (Postgres, MySQL, etc.) |
| **Resource** | Shared infrastructure (volumes, secrets, networks) |
| **Canvas** | Visual editor for designing project topology |
| **Stack** | Synonym for Project; all services/databases in a project |
| **Template** | Pre-configured one-click application |

---

## Appendix B: References

- [Coolify](https://coolify.io) — Self-hosting platform
- [Railway](https://railway.com) — Canvas-based deployments
- [Dokku](https://dokku.com) — Git-push PaaS
- [CapRover](https://caprover.com) — One-click apps
- [better-auth](https://better-auth.com) — Auth library
- [React Flow](https://reactflow.dev) — Canvas library
- [Caddy](https://caddyserver.com) — Reverse proxy

---

*This document is a living spec. Update as decisions are made.*
