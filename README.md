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
<img width="1321" height="675" alt="image" src="https://github.com/user-attachments/assets/509319dc-a59b-46d1-b4bf-5f5a20efde29" />
