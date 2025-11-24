
#  Rookie Al‑Bahith  | Research 

## Overview
Research Rookie (Rookie Al‑Bahith) is a lightweight platform for newcomers to AI research to ask questions, get answers, and connect with mentors and peers. The repository contains a static frontend and simple scaffolding for authentication and forms. The project is intentionally simple so you can run the frontend locally and wire a backend later. The visual design uses a warm yellow/orange palette inspired by the provided reference screenshots.

## Key Features
- Landing / About page (hero + "For researchers" section)
- Signup (username, email, password) and Login (email, password) HTML forms
- Client-side form validation and password visibility toggle (JS)
- Responsive CSS matching the landing theme
- Clean, semantic HTML scaffolding ready to be connected to a backend

## Demo
- Add a demo video link here when available.

---

## Local Setup & Running (Frontend-only quick preview)

1. Clone the repository:

```powershell
git clone https://github.com/Eelaf-Adam/Rookie-Al-Bahith.git
cd Rookie-Al-Bahith
```

2. Serve the static frontend for local testing:

```powershell
cd frontend
python -m http.server 8000
# Open http://localhost:8000 in your browser
```

Open pages:
- `http://localhost:8000/index.html` — landing page
- `http://localhost:8000/signup.html` — sign up
- `http://localhost:8000/login.html` — log in

If you prefer a simple static server with Node:

```powershell
npm install -g http-server
cd frontend
http-server -p 8000
```


## Deployment Example (two web nodes behind HAProxy)

On each web node (`web01`, `web02`):

```bash
docker pull yourdockerhubusername/rookie-al-bahith:v1
docker run -d --name rookie-app --restart unless-stopped -p 8080:8080 yourdockerhubusername/rookie-al-bahith:v1
```

HAProxy backend snippet (example):

```
backend webapps
	balance roundrobin
	server web01 172.20.0.11:8080 check
	server web02 172.20.0.12:8080 check
```

Reload HAProxy (container example):

```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

Test load-balancing (from host):

```bash
curl http://localhost
# repeat requests; responses should alternate between web01 and web02
```

---

## Security & API Key Handling

- Do NOT commit API keys or secrets to the repository.
- Pass keys as environment variables to containers:

```powershell
docker run -d -p 8080:8080 -e RAPIDAPI_KEY="your_actual_rapidapi_key" yourdockerhubusername/rookie-al-bahith:v1
```
- Use `.env` files for local development and add `.env` to `.gitignore`.




---

## Project Structure

```
Rookie-Al-Bahith/
│
├── backend/                   # Optional backend API source (FastAPI or similar)
│   ├── app/                   # Application modules
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/                  # Static frontend files
│   ├── index.html
│   ├── signup.html
│   ├── login.html
│   ├── assets/
│   │   ├── css/
│   │   │   ├── about.css
│   │   │   ├── signup.css
│   │   │   └── auth.css
│   │   └── js/
│   │       └── auth.js
│
├── docker-compose.yml         # Optional compose file
├── README.md
└── LICENSE
```


---

## Contact

- Repository: https://github.com/Eelaf-Adam/Rookie-Al-Bahith
