# 🔒 Adding HTTPS to Your Aquarium

## Why You Need HTTPS

**Current Problem:**
- ❌ Passwords sent in **plain text** over HTTP
- ❌ Anyone on the network can see credentials
- ❌ Cookies can be intercepted
- ❌ Not production-ready

**With HTTPS:**
- ✅ All traffic encrypted (passwords, cookies, data)
- ✅ Browser shows padlock 🔒
- ✅ Protection from man-in-the-middle attacks
- ✅ Professional and secure

---

## Prerequisites

1. **Domain name** (e.g., `myaquarium.com`)
   - Cost: $10-15/year
   - Buy from: Namecheap, Google Domains, Cloudflare, etc.

2. **Static IP** (you already have this!)
   - `3.141.232.213`

---

## Step 1: Point Domain to Your Server

### In Your Domain Registrar:

Add an **A Record**:
- **Type:** A
- **Name:** `@` (or leave blank for root domain)
- **Value:** `3.141.232.213`
- **TTL:** 300 (or default)

Optional - Add www subdomain:
- **Type:** A
- **Name:** `www`
- **Value:** `3.141.232.213`
- **TTL:** 300

**Wait 5-60 minutes** for DNS to propagate.

**Test:** Open `http://yourdomain.com` - should show your aquarium!

---

## Step 2: Install Certbot on Lightsail

SSH into your Lightsail instance:

```bash
# Install Certbot
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# Stop nginx container temporarily
cd ~/aquarium
docker-compose -f docker-compose.prod.yml stop nginx
```

---

## Step 3: Get SSL Certificate

```bash
# Get certificate (replace with YOUR domain)
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# Follow prompts:
# - Enter email address (for renewal notifications)
# - Agree to terms
# - Certificates will be saved to: /etc/letsencrypt/live/yourdomain.com/
```

**Certificate files created:**
- `fullchain.pem` - SSL certificate
- `privkey.pem` - Private key

---

## Step 4: Update Nginx Configuration

Copy certificates to your project:

```bash
cd ~/aquarium
mkdir -p certbot/conf
sudo cp -r /etc/letsencrypt/live certbot/conf/
sudo cp -r /etc/letsencrypt/archive certbot/conf/
sudo chown -R ubuntu:ubuntu certbot/
```

Update `nginx/nginx.conf` to enable HTTPS:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream backend {
        server backend:8000;
    }

    # Redirect HTTP to HTTPS
    server {
        listen 80;
        server_name yourdomain.com www.yourdomain.com;
        
        location / {
            return 301 https://$host$request_uri;
        }
    }

    # HTTPS Server
    server {
        listen 443 ssl;
        server_name yourdomain.com www.yourdomain.com;

        ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

        # SSL Security Settings
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

        # Serve frontend
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # Proxy API requests to backend
        location /api/ {
            proxy_pass http://backend/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

---

## Step 5: Update Backend to Enable Secure Cookies

In `backend/app/auth.py`, change:

```python
secure=False  # Set to True when using HTTPS
```

To:

```python
secure=True  # Now using HTTPS!
```

---

## Step 6: Update GitHub Secrets

Update `VITE_API_BASE_URL` to use HTTPS:

**Old:** `http://3.141.232.213/api`

**New:** `https://yourdomain.com/api`

---

## Step 7: Restart and Test

```bash
cd ~/aquarium
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs nginx
```

**Test in browser:**
1. Go to `https://yourdomain.com` (note the `https://`)
2. Should see padlock 🔒 in address bar
3. Register/login - credentials now encrypted!

---

## Step 8: Setup Auto-Renewal

Certbot certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal
sudo certbot renew --dry-run

# Setup cron job to renew automatically
sudo crontab -e

# Add this line (runs daily at 2am):
0 2 * * * certbot renew --quiet --post-hook "cd /home/ubuntu/aquarium && docker-compose -f docker-compose.prod.yml restart nginx"
```

---

## Troubleshooting

### Certificate not found
- Make sure certificates were copied to `certbot/conf/`
- Check nginx volume mount in `docker-compose.prod.yml`

### Nginx won't start
```bash
docker-compose -f docker-compose.prod.yml logs nginx
```

### Domain doesn't resolve
- Wait longer for DNS (can take up to 48 hours)
- Check A record with: `dig yourdomain.com`

### "Your connection is not private"
- Certificate might be for wrong domain
- Check certificate: `sudo certbot certificates`

---

## Cost Summary

| Item | Cost |
|------|------|
| Domain name | $10-15/year |
| SSL Certificate (Let's Encrypt) | **FREE** |
| Lightsail server | $5/month (unchanged) |
| **Total new cost** | **$10-15/year** |

---

## What You Get

✅ **Encrypted traffic** - passwords and data secure
✅ **Professional appearance** - custom domain + padlock
✅ **Better SEO** - Google prefers HTTPS sites
✅ **User trust** - no browser warnings
✅ **Production ready** - safe for real users

---

## Without a Domain (Alternative)

If you don't want to buy a domain, you can't use Let's Encrypt. Options:

1. **Accept HTTP security risks** (current setup)
   - Only use for testing/personal projects
   - Never share password with other sites
   - Change password regularly

2. **Use password manager** (mitigates risk slightly)
   - Generates unique passwords
   - At least if intercepted, won't compromise other accounts

3. **Wait until ready to launch** properly with domain + HTTPS

---

**Bottom line:** For a real deployment with other users, you **need HTTPS**. For personal use or testing, HTTP is acceptable (just be aware of the risks).

