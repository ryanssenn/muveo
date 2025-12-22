# Muveo Deployment Guide

Deploy Muveo on a single VPS with NGINX as a reverse proxy.

## How It Works

```
Browser → NGINX (port 80) → Frontend (port 3000)
                          → Backend (port 8000)
```

NGINX is the only public-facing service. It routes requests to the appropriate internal service.

## Step 1: Install System Packages

```bash
sudo apt update
sudo apt install -y nginx python3-pip python3-venv nodejs npm
```

## Step 2: Get the Code

```bash
cd /root
git clone <your-repo-url> muveo
```

## Step 3: Set Up the Backend

```bash
cd /root/muveo
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn python-multipart
deactivate
```

## Step 4: Set Up the Frontend

```bash
cd /root/muveo/frontend
npm install
npm run build
```

## Step 5: Configure NGINX

```bash
sudo cp /root/muveo/nginx/muveo.conf /etc/nginx/sites-available/muveo
sudo ln -s /etc/nginx/sites-available/muveo /etc/nginx/sites-enabled/muveo
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Create the Backend Service

This keeps the backend running after you log out and restarts it if it crashes.

```bash
sudo tee /etc/systemd/system/muveo-backend.service << 'EOF'
[Unit]
Description=Muveo Backend
After=network.target

[Service]
User=root
WorkingDirectory=/root/muveo/backend
Environment="PATH=/root/muveo/venv/bin"
ExecStart=/root/muveo/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

## Step 7: Create the Frontend Service

```bash
sudo tee /etc/systemd/system/muveo-frontend.service << 'EOF'
[Unit]
Description=Muveo Frontend
After=network.target

[Service]
User=root
WorkingDirectory=/root/muveo/frontend
Environment="NODE_ENV=production"
ExecStart=/root/muveo/frontend/node_modules/.bin/next start -H 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
```

## Step 8: Start Everything

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now muveo-backend muveo-frontend
```

## Step 9: Open the Firewall

```bash
sudo ufw allow 80/tcp
```

## Step 10: Verify

Check both services are running:

```bash
sudo systemctl status muveo-backend
sudo systemctl status muveo-frontend
```

Both should say "active (running)".

Test locally:

```bash
curl http://127.0.0.1:80
```

Should return HTML.

Visit `http://<your-vps-ip>` in your browser.

---

## Useful Commands

### View Logs

```bash
sudo journalctl -u muveo-backend -f
sudo journalctl -u muveo-frontend -f
sudo tail -f /var/log/nginx/muveo_error.log
```

### Restart After Code Changes

```bash
cd /root/muveo
git pull
cd frontend && npm install && npm run build && cd ..
sudo systemctl restart muveo-backend muveo-frontend
```

### Check What's Listening

```bash
sudo ss -tlnp | grep -E ':(80|3000|8000)'
```

---

