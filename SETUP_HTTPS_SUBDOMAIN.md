# 🔒 Setup HTTPS for aquarium.annabelgoldman.com

## Quick Overview

We're setting up your aquarium at `https://aquarium.annabelgoldman.com` with:
- ✅ Free SSL certificate (Let's Encrypt)
- ✅ Automatic HTTP → HTTPS redirect
- ✅ Secure encrypted passwords
- ✅ Professional subdomain

**Total time:** ~15-20 minutes
**Cost:** $0 (you already own the domain!)

---

## Step 1: Add DNS Record (Do This First!)

Go to your DNS provider for `annabelgoldman.com`:

**Add an A Record:**
- **Type:** A
- **Name:** `aquarium`
- **Value:** `3.141.232.213`
- **TTL:** 300 or Auto

**Save and wait 5-15 minutes** for DNS to propagate.

**Test it (from your computer):**
```bash
ping aquarium.annabelgoldman.com
```

Should show: `3.141.232.213`

**Also test in browser:**
```
http://aquarium.annabelgoldman.com
```

Should show your aquarium (currently via HTTP).

⚠️ **Don't proceed until DNS is working!**

---

## Step 2: SSH Into Lightsail and Get SSL Certificate

```bash
# SSH into your server
ssh -i ~/Downloads/LightsailDefaultKey-us-east-2.pem ubuntu@3.141.232.213

# Install Certbot if not already installed
sudo apt update
sudo apt install -y certbot

# Stop nginx temporarily
cd ~/aquarium
docker-compose -f docker-compose.prod.yml stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d aquarium.annabelgoldman.com

# Follow prompts:
# - Enter your email (for renewal notifications)
# - Agree to terms of service
# - Choose not to share email with EFF (optional)
```

**You should see:**
```
Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/aquarium.annabelgoldman.com/fullchain.pem
Key is saved at:         /etc/letsencrypt/live/aquarium.annabelgoldman.com/privkey.pem
```

---

## Step 3: Copy Certificates to Project

```bash
cd ~/aquarium

# Create directories
mkdir -p certbot/conf

# Copy certificates (preserving symlinks structure)
sudo cp -rL /etc/letsencrypt/live certbot/conf/
sudo cp -rL /etc/letsencrypt/archive certbot/conf/
sudo cp -rL /etc/letsencrypt/renewal certbot/conf/

# Fix permissions
sudo chown -R ubuntu:ubuntu certbot/

# Verify files exist
ls -la certbot/conf/live/aquarium.annabelgoldman.com/
```

Should show: `fullchain.pem` and `privkey.pem`

---

## Step 4: Pull Latest Code (Has HTTPS Config)

```bash
cd ~/aquarium
git pull origin main
```

This pulls the updated:
- ✅ nginx config with HTTPS
- ✅ Backend with secure cookies

---

## Step 5: Update GitHub Secrets

**Go to:** https://github.com/annabel-goldman/aquarium/settings/secrets/actions

**Update `VITE_API_BASE_URL`:**
- Click on `VITE_API_BASE_URL`
- Click "Update"
- Change from: `http://3.141.232.213/api`
- Change to: `https://aquarium.annabelgoldman.com/api`
- Click "Update secret"

---

## Step 6: Deploy with HTTPS!

**Option A: Trigger GitHub Actions deployment**
1. Go to: https://github.com/annabel-goldman/aquarium/actions
2. Click "Deploy to AWS Lightsail"
3. Click "Run workflow" → Select `main` → Click "Run workflow"
4. Wait for green checkmark (~5 minutes)

**Option B: Manual deployment on server**
```bash
cd ~/aquarium

# Rebuild frontend with new API URL
docker-compose -f docker-compose.prod.yml down
docker pull ghcr.io/annabel-goldman/aquarium-backend:latest
docker pull ghcr.io/annabel-goldman/aquarium-nginx:latest
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs nginx --tail 30
```

---

## Step 7: Test HTTPS!

**Open browser and go to:**
```
https://aquarium.annabelgoldman.com
```

**You should see:**
- ✅ 🔒 Padlock icon in address bar
- ✅ "Connection is secure"
- ✅ Your aquarium login page

**Try HTTP (should auto-redirect to HTTPS):**
```
http://aquarium.annabelgoldman.com
```

Should automatically redirect to `https://...`

---

## Step 8: Test Registration & Login

1. **Register a new account**
   - Username: `securetestuser`
   - Password: `password123`
2. **Should work and stay logged in!** ✅
3. **Create a tank and add fish!** 🐠

**Check browser dev tools:**
- Network tab → Click on register request
- Request shows `https://` (encrypted!)
- Password is transmitted securely ✅

---

## Step 9: Setup Auto-Renewal (Important!)

Let's Encrypt certificates expire every 90 days. Set up auto-renewal:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# If successful, setup cron job
sudo crontab -e

# Add this line (renews daily, restarts nginx if renewed):
0 3 * * * certbot renew --quiet --post-hook "cd /home/ubuntu/aquarium && docker-compose -f docker-compose.prod.yml restart nginx"
```

This checks for renewal daily at 3 AM and restarts nginx if cert was renewed.

---

## Troubleshooting

### DNS not resolving
```bash
# Check DNS propagation
dig aquarium.annabelgoldman.com

# Or use online tool:
# https://dnschecker.org
```

Wait longer (up to 48 hours max, usually 5-15 minutes).

### Certbot fails with "Connection refused"
- Make sure nginx is stopped: `docker-compose -f docker-compose.prod.yml stop nginx`
- Check port 80 is free: `sudo netstat -tuln | grep :80`

### Nginx won't start
```bash
# Check logs
docker-compose -f docker-compose.prod.yml logs nginx

# Common issue: Certificate files not found
ls -la ~/aquarium/certbot/conf/live/aquarium.annabelgoldman.com/
```

Make sure `fullchain.pem` and `privkey.pem` exist.

### Browser shows "Not Secure" or certificate error
- Clear browser cache
- Check certificate: `sudo certbot certificates`
- Make sure certificate is for `aquarium.annabelgoldman.com`

### Login still fails
- Make sure you updated `VITE_API_BASE_URL` in GitHub Secrets
- Clear browser cookies
- Rebuild frontend: GitHub Actions deployment or manual pull

---

## Success Checklist

- ✅ DNS resolves to `3.141.232.213`
- ✅ SSL certificate obtained
- ✅ Certificates copied to project
- ✅ GitHub secret updated
- ✅ Deployed new code
- ✅ HTTPS works (padlock shows)
- ✅ HTTP redirects to HTTPS
- ✅ Registration and login work
- ✅ Auto-renewal configured

---

## What You've Achieved! 🎉

✅ **Fully encrypted** - All passwords and data secure
✅ **Professional URL** - `aquarium.annabelgoldman.com`
✅ **Production ready** - Safe for real users
✅ **Auto-renewing** - Certificate renews automatically
✅ **No extra cost** - Free SSL with your existing domain

**Your aquarium is now enterprise-grade secure!** 🔒🐠

---

## Sharing Your Aquarium

You can now safely share your aquarium:
- **URL:** https://aquarium.annabelgoldman.com
- **Safe for friends/family** to create accounts
- **Passwords encrypted** in transit
- **Professional appearance** with custom domain

Enjoy your secure aquarium! 🐟🦈🐠

