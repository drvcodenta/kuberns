# Kuberns — Local Setup

## Prerequisites
- Python 3.12+
- Node.js 18+

## Backend (Django)

```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

API runs at `http://127.0.0.1:8000/api/`

## Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173/`

## Quick Test

1. Open `http://localhost:5173`
2. Fill in app details → Set Up Env Variables → Finish my Setup
3. Click **Deploy to AWS** on the status page
4. Watch live deployment logs stream in

> **Note:** Without AWS credentials, deploys run in simulated mode (fake IP, ~15s). To use real EC2, pass `aws_access_key` and `aws_secret_key` in the deploy request body.

### db planned design
<img width="1291" height="679" alt="image" src="https://github.com/user-attachments/assets/d68cbfa6-5455-4f3a-8856-c7025c116855" />

### Design Decision

#### Architecture
- separated environment from webapps, for scalability, since one app could have multiple environments(production, development)
- used appending for logging instead of updating inside a single status field for easier debugging
- used threads for handling multiple simultaneous deployments, 

#### backend
- used nested serializers instead of separate API calls

#### frontend

- used custom dropdown instead of a native select to have consistent styling across different browsers, to have matching hover effects
- used live log polling having 2s interval on /webapp/<id> api and stop when status is terminal

#### infra

- currently handling terminating instances manually.
- used .env instead of aws secrets for easier development, could be used in prod
- the plan type doesn't change instance size because of the free-tier constraint

### Time Taken

| Area | Hours |
|------|-------|
| Frontend (React + Vite + Tailwind) | ~10 hrs |
| Backend (Django + DRF + Services) | ~6 hrs |
| Deployment / Infra (AWS EC2 + boto3) | ~3 hrs |
| Documentation + Testing | ~4 hrs |
| **Total** | **~23 hrs** |

### Limitations
- No user authentication
- Deploy cleanup is manual — no auto-terminate for idle instances
- Plan type (Starter/Pro) doesn't map to different EC2 instance sizes (free-tier constraint)
- Frontend uses polling (2s interval) instead of WebSockets for live logs
- Database connection section in UI is decorative (CTA only, no backend)
