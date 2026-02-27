# Kuberns — Full-Stack Assignment Plan

> **Goal**: Build a cloud deployment platform UI + API. React frontend, Django backend, AWS EC2 provisioning, deployed on Kuberns.
>
> **Companion doc**: See [DATABASE_DESIGN.md](file:///C:/Users/acer/Desktop/kuberns/DATABASE_DESIGN.md) for the full ER diagram and scalability walkthrough.

---

## Overview

The app lets users "deploy" a web app by:
1. Connecting a GitHub repo (mocked)
2. Configuring app details (name, region, framework, plan)
3. Setting up environment variables and port
4. Backend stores everything and optionally provisions an EC2 instance

---

## Phase 1: Backend (Django + DRF)

> Do this first — the frontend needs APIs to talk to.

### 1.1 Project Setup
- [ ] Create Django project: `kuberns_backend`
- [ ] Create app: `apps/deployments`
- [ ] Install & configure: `djangorestframework`, `django-cors-headers`
- [ ] Basic settings: CORS, installed apps, DB (SQLite is fine for dev)

### 1.2 Models (`deployments/models.py`)

> **Full design + ER diagram**: See [DATABASE_DESIGN.md](file:///C:/Users/acer/Desktop/kuberns/DATABASE_DESIGN.md)

Scalable design with 8 models:

| Model | Key Fields |
|-------|-----------|
| **Organization** | `name`, `github_org_name`, `created_at` |
| **WebApp** | `FK(Organization)`, `name`, `owner`, `region`, `framework`, `plan_type`, `repo_url`, `repo_name`, `branch` |
| **Environment** | `FK(WebApp)`, `name` (dev/staging/prod), `branch`, `port`, `is_active` |
| **EnvVariable** | `FK(Environment)`, `key`, `value`, `is_secret` — individual rows, not JSONField |
| **Deployment** | `FK(Environment)`, `status`, `triggered_by`, `started_at`, `finished_at` |
| **Instance** | `OneToOne(Deployment)`, `instance_type`, `cpu`, `ram`, `storage`, `public_ip`, `ec2_instance_id` |
| **DeploymentLog** | `FK(Deployment)`, `message`, `log_level`, `timestamp` |
| **DatabaseConfig** | `OneToOne(WebApp)`, `db_type`, `db_name`, `db_host`, `db_port`, `db_user`, `db_password` |

### 1.3 Serializers (`deployments/serializers.py`)
- `WebAppSerializer` — nested write for Environment + Instance in one POST
- `EnvironmentSerializer`
- `InstanceSerializer`
- `DeploymentLogSerializer` (read-only)
- Keep validation simple: required fields, choices for `region`/`plan_type`/`status`

### 1.4 Views & URLs
| Method | Endpoint | What it does |
|--------|----------|-------------|
| `POST` | `/api/webapps/` | Create WebApp + Environment + Instance in one request |
| `GET` | `/api/webapps/` | List all webapps (filter by owner later) |
| `GET` | `/api/webapps/<id>/` | Detail view |
| `POST` | `/api/webapps/<id>/deploy/` | Trigger deployment (mocked or real EC2) |
| `GET` | `/api/webapps/<id>/logs/` | Get deployment logs |

### 1.5 Deployment Simulation (Bonus)
- On `deploy/` call → create a background task (use Django signals or a simple thread)
- Status transitions: `pending` → `deploying` → `active` (with ~5s delays)
- Each transition writes a `DeploymentLog` entry with timestamp

### 1.6 AWS EC2 Provisioning (Required — Free Tier)
- Accept `aws_access_key` and `aws_secret_key` via the deploy API
- Use `boto3` to launch EC2 in the selected region:
  - **All plans** → `t2.micro` (1 vCPU, 1GB RAM) — Free Tier eligible
  - Plan type (Starter/Pro) stored in DB but both use `t2.micro` to stay within free tier
- Return `public_ip` and `ec2_instance_id`, update Instance status
- Log each step to `DeploymentLog`
- Status flow: `pending` → `deploying` → `active` (or `failed`)
- **Free Tier limits**: 750 hrs/month of t2.micro, remember to terminate instances after demo

---

## Phase 2: Frontend (React + Vite)

### 2.1 Project Setup
- [ ] Create React app with Vite: `npx -y create-vite@latest ./ -- --template react`
- [ ] Install: `axios`, `react-router-dom`
- [ ] Install & configure Tailwind CSS v4
- [ ] Clean up boilerplate

### 2.2 Page Structure (2 pages only)

**Page 1 — App Setup** (`/`)
```
┌─────────────────────────────────────────┐
│  Sidebar (static nav)                   │
│  ┌───────────────────────────────────┐  │
│  │ Connect GitHub (mock button)      │  │
│  │ Select Org / Repo / Branch        │  │
│  │ App Name                          │  │
│  │ Region (dropdown)                 │  │
│  │ Framework (Vue, React, etc.)      │  │
│  │ Plan Type (Starter/Pro) + specs   │  │
│  │ Database Setup (toggle)           │  │
│  │ [Set Up Env Variables →]          │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

**Page 2 — Environment Setup** (`/env-setup`)
```
┌─────────────────────────────────────────┐
│  Port Configuration (random/custom)     │
│  Environment Variables (key-value list) │
│  [+ Add Variable]                       │
│  [Finish My Setup →]                    │
└─────────────────────────────────────────┘
```

### 2.3 Components Breakdown
```
src/
├── components/
│   ├── Sidebar.jsx          # Static navigation sidebar
│   ├── GitHubConnect.jsx    # Mock GitHub connection button
│   ├── AppDetailsForm.jsx   # Name, region, framework, plan
│   ├── PlanSelector.jsx     # Starter/Pro with RAM/CPU info
│   ├── DatabaseToggle.jsx   # Optional DB setup toggle
│   ├── PortConfig.jsx       # Random/custom port picker
│   ├── EnvVariables.jsx     # Key-value pair editor
│   └── common/
│       ├── Dropdown.jsx
│       ├── TextInput.jsx
│       └── Button.jsx
├── pages/
│   ├── AppSetup.jsx         # Page 1
│   └── EnvSetup.jsx         # Page 2
├── api/
│   └── webapps.js           # Axios calls to backend
├── App.jsx
├── main.jsx
└── index.css
```

### 2.4 State Management
- Use `useState` + lift state to `App.jsx` (or use context if needed)
- Pass form data between Page 1 → Page 2 via React Router state or context
- No Redux — keep it simple

### 2.5 Styling (Tailwind CSS)
- Tailwind CSS for utility-first styling
- Dark theme (matches the Figma screenshots — typical cloud platform look)
- Clean, minimal — no over-styling
- Use Tailwind's built-in dark mode, spacing, and typography utilities

### 2.6 Form Validation
- Required fields: app name, region, framework, plan
- Show inline errors below fields
- Disable CTA button until form is valid

---

## Phase 3: Integration & Polish

### 3.1 Connect Frontend → Backend
- [ ] Wire up Page 2 "Finish My Setup" → `POST /api/webapps/`
- [ ] Wire up a dashboard/list view → `GET /api/webapps/`
- [ ] Show deployment status after submission

### 3.2 Deployment Status Page (Bonus)
- After form submission, show a simple status page
- Poll `GET /api/webapps/<id>/` every 3s to update status
- Show logs from `DeploymentLog`

---

## Phase 4: Documentation & Deliverables

### 4.1 README.md
- [ ] Setup instructions (backend + frontend)
- [ ] Design decisions (why SQLite, why Vite, why no Redux, etc.)
- [ ] API structure with request/response payloads
- [ ] Time taken & limitations

### 4.2 ER Diagram
- [ ] Simple diagram using Mermaid or draw.io
- [ ] Include in README or as separate image

### 4.3 API Docs
- [ ] Add Swagger via `drf-yasg` or `drf-spectacular`
- [ ] Or export a Postman collection

### 4.4 Deploy on Kuberns
- [ ] Follow Kuberns deployment process
- [ ] Document the deployment steps

---

## Execution Order (Chat-by-Chat)

| Chat # | Task | Estimated Time |
|--------|------|---------------|
| 1 | Backend: Django project setup + models + migrations | 20 min |
| 2 | Backend: Serializers + Views + URLs | 30 min |
| 3 | Backend: Deployment simulation + DeploymentLog | 20 min |
| 4 | Frontend: Vite setup + Page 1 UI | 40 min |
| 5 | Frontend: Page 2 UI + form state management | 30 min |
| 6 | Integration: Connect frontend to backend APIs | 20 min |
| 7 | AWS EC2 provisioning (required) | 30 min |
| 8 | Documentation: README, ER diagram, Swagger | 30 min |
| 9 | Deploy on Kuberns + final testing | 20 min |

---

## Key Principles

- **No over-engineering** — SQLite, no Redux, no Docker (unless needed for deploy)
- **Readable code** — clear variable names, comments where non-obvious
- **One concern per file** — models.py, serializers.py, views.py stay focused
- **Nested serializers for create** — one POST creates WebApp + Environment + Instance
- **Scalable DB design** — separate tables for env vars, deployments, instances (see DATABASE_DESIGN.md)
- **Real AWS** — actually provision EC2, don't mock it

---

## Tech Stack Summary

| Layer | Choice | Why |
|-------|--------|-----|
| Frontend | React + Vite | Fast setup, assignment says React preferred |
| Styling | Tailwind CSS | Utility-first, fast to build, production-quality |
| State | useState/Context | No Redux overhead for 2 pages |
| Backend | Django + DRF | Assignment says Django preferred |
| Database | SQLite | Dev simplicity, zero config |
| API Docs | drf-spectacular / Swagger | Auto-generated from serializers |
| AWS | boto3 | Real EC2 provisioning |
