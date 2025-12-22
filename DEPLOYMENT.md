# Muveo Deployment Guide

This guide covers deploying Muveo with NGINX as a reverse proxy on a single VM.

## Architecture Overview

```
Browser → NGINX (port 80) → Next.js Frontend (port 3000)
                          → Python Backend (port 8000)
```

NGINX acts as the single entry point, routing requests to the appropriate service.

## Prerequisites

- Linux VM (Ubuntu/Debian recommended)
- NGINX installed (`sudo apt-get install nginx`)
- Node.js and npm installed
- Python 3.11+ and pip installed
- Both frontend and backend code deployed to the VM

## Port Configuration

- **NGINX**: Listens on port 80 (public)
- **Next.js Frontend**: Runs on `127.0.0.1:3000` (internal)
- **Python Backend**: Runs on `127.0.0.1:8000` (internal)

## NGINX Setup

### 1. Copy Configuration File

Copy the NGINX configuration file to the sites-available directory:

```bash
sudo cp nginx/muveo.conf /etc/nginx/sites-available/muveo
```

### 2. Enable the Site

Create a symlink to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/muveo /etc/nginx/sites-enabled/muveo
```

### 3. Disable Default Site (if needed)

If the default NGINX site conflicts, disable it:

```bash
sudo rm /etc/nginx/sites-enabled/default
```

### 4. Validate Configuration

Test the NGINX configuration for syntax errors:

```bash
sudo nginx -t
```

You should see:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### 5. Reload NGINX

Apply the new configuration:

```bash
sudo systemctl reload nginx
```

Or restart NGINX if reload doesn't work:

```bash
sudo systemctl restart nginx
```

### 6. Verify NGINX Status

Check that NGINX is running:

```bash
sudo systemctl status nginx
```

## Starting Services

### Backend (Python FastAPI)

Navigate to the backend directory and start the server:

```bash
cd /path/to/muveo/backend
# Activate virtual environment if using one
source ../venv/bin/activate  # or your venv path
# Install dependencies if needed
pip install fastapi uvicorn python-multipart
# Start the server
uvicorn main:app --host 127.0.0.1 --port 8000
```

For production, consider using a process manager like `systemd` or `supervisord` to keep the backend running.

### Frontend (Next.js)

#### Development Mode

```bash
cd /path/to/muveo/frontend
npm install
npm run dev -- -H 127.0.0.1
```

#### Production Mode

```bash
cd /path/to/muveo/frontend
npm install
npm run build
npm start -- -H 127.0.0.1
```

For production, consider using a process manager like `systemd` or `pm2` to keep the frontend running.

## Testing the Setup

1. **Test Frontend**: Open `http://<vm-ip-address>/` in a browser
   - Should display the Muveo frontend UI

2. **Test Backend API**: Test a backend endpoint:
   ```bash
   curl http://<vm-ip-address>/api/backend/status/test
   ```
   - Should return a response (may be 404 if job doesn't exist, but confirms routing works)

3. **Test Upload**: Use the frontend UI to upload an audio file
   - Should successfully route through NGINX to backend

## Troubleshooting

### NGINX Issues

- **Check NGINX logs**: 
  ```bash
  sudo tail -f /var/log/nginx/muveo_error.log
  sudo tail -f /var/log/nginx/muveo_access.log
  ```

- **Verify ports are listening**:
  ```bash
  sudo netstat -tlnp | grep -E ':(80|3000|8000)'
  ```

- **Check firewall**: Ensure port 80 is open:
  ```bash
  sudo ufw allow 80/tcp
  ```

### Backend Issues

- **Verify backend is running**: Check if port 8000 is listening
- **Check backend logs**: Look for errors in the terminal where uvicorn is running
- **Test backend directly**: `curl http://127.0.0.1:8000/status/test`

### Frontend Issues

- **Verify frontend is running**: Check if port 3000 is listening
- **Check browser console**: Look for network errors
- **Test frontend directly**: `curl http://127.0.0.1:3000`

## Production Considerations

### HTTPS/TLS Setup (Future)

When ready to add HTTPS:

1. Install Certbot:
   ```bash
   sudo apt-get install certbot python3-certbot-nginx
   ```

2. Obtain certificate:
   ```bash
   sudo certbot --nginx -d yourdomain.com
   ```

3. Certbot will automatically update the NGINX configuration for HTTPS.

### Process Management

For production, use systemd services or process managers so your processes restart automatically on reboot or failure.

#### Option 1: systemd (recommended on Ubuntu/Debian)

Create a dedicated user (optional but recommended):

```bash
sudo useradd -r -s /bin/false muveo
sudo chown -R muveo:muveo /path/to/muveo
```

##### Backend service (`/etc/systemd/system/muveo-backend.service`)

```ini
[Unit]
Description=Muveo Backend (FastAPI)
After=network.target

[Service]
User=muveo
WorkingDirectory=/path/to/muveo/backend
Environment="PATH=/path/to/muveo/venv/bin"
ExecStart=/path/to/muveo/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

##### Frontend service (`/etc/systemd/system/muveo-frontend.service`)

```ini
[Unit]
Description=Muveo Frontend (Next.js)
After=network.target

[Service]
User=muveo
WorkingDirectory=/path/to/muveo/frontend
Environment="NODE_ENV=production"
ExecStart=/usr/bin/npm start -- -H 127.0.0.1
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start both services:

```bash
sudo systemctl daemon-reload
sudo systemctl enable muveo-backend muveo-frontend
sudo systemctl start muveo-backend muveo-frontend
```

Check status/logs:

```bash
sudo systemctl status muveo-backend muveo-frontend
sudo journalctl -u muveo-backend -f
sudo journalctl -u muveo-frontend -f
```

> Replace `/path/to/muveo` and `/usr/bin/npm` with the actual paths on your server.

#### Option 2: pm2 (Node.js-only for frontend)

Install pm2 globally:

```bash
sudo npm install -g pm2
```

Start the frontend in production mode:

```bash
cd /path/to/muveo/frontend
npm run build
pm2 start npm --name "muveo-frontend" -- start -- -H 127.0.0.1
```

Save the process list and configure pm2 to start on boot:

```bash
pm2 save
pm2 startup
```

pm2 is only for the Node.js frontend; for the Python backend, use systemd or another Python-friendly process manager (e.g., `supervisord` or `gunicorn` with systemd).

### Security Hardening

- Configure firewall rules (UFW or iptables)
- Set up fail2ban for protection against brute force
- Regularly update system packages
- Use non-root user for running services
- Configure proper file permissions

## Environment Variables

### Frontend

The frontend uses relative URLs (`/api/backend`) so no environment variables are needed when using NGINX.

If you need to override, create `.env.local`:
```bash
NEXT_PUBLIC_API_URL=/api/backend
```

### Backend

Backend CORS is configured to allow requests from NGINX. No environment variables required for basic setup.

