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

For production, use systemd services or process managers:

- **systemd**: Create service files for both frontend and backend
- **pm2**: For Node.js frontend: `pm2 start npm --name "muveo-frontend" -- start`
- **supervisord**: For Python backend

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

