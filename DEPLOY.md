# 🚀 Deploy Aquarium to AWS Lightsail ($3.50/month)

Complete step-by-step guide for deploying via GitHub Actions.

---

## 📋 What You Need

- AWS Account
- GitHub Account (code already pushed)
- 15 minutes

**Cost:** $3.50/month on AWS Lightsail

---

## Part 1: AWS Lightsail Setup (8 minutes)

### Step 1: Create Lightsail Instance

1. **Go to AWS Lightsail Console**
   - Visit: https://lightsail.aws.amazon.com/
   - Sign in to your AWS account

2. **Create Instance**
   - Click the orange **"Create instance"** button

3. **Select Instance Location**
   - Choose a region close to you (e.g., "US East (N. Virginia)")
   - Keep availability zone as default

4. **Pick Instance Image**
   - Platform: Select **"Linux/Unix"**
   - Blueprint: Click **"OS Only"**
   - Select **"Ubuntu 22.04 LTS"**

5. **Choose Instance Plan**
   - Scroll down to instance plans
   - Select the **$3.50 USD/month** plan
     - 512 MB RAM
     - 1 vCPU
     - 20 GB SSD
     - 1 TB transfer

6. **Name Your Instance**
   - Name: `aquarium-app` (or your preferred name)

7. **Create Instance**
   - Click **"Create instance"** button
   - Wait 1-2 minutes for instance to start
   - Status will change from "Pending" to "Running"

### Step 2: Configure Firewall

1. **Open Your Instance**
   - Click on your instance name `aquarium-app`

2. **Go to Networking Tab**
   - Click the **"Networking"** tab

3. **Add Firewall Rules**
   - Under "IPv4 Firewall", you'll see SSH (port 22) already exists
   - Click **"+ Add rule"** to add HTTP:
     - Application: **HTTP**
     - Protocol: **TCP**
     - Port: **80**
     - Click **"Create"**
   
   - Click **"+ Add rule"** again to add HTTPS:
     - Application: **HTTPS**
     - Protocol: **TCP**
     - Port: **443**
     - Click **"Create"**

4. **Note Your Public IP**
   - At the top of the page, you'll see **"Public IP"**
   - Copy this IP address (e.g., `54.123.45.67`)
   - **Save this - you'll need it for GitHub Secrets!**

### Step 3: Download SSH Key

1. **Go to Account Page**
   - Click the person icon in top right
   - Select **"Account"**

2. **SSH Keys Tab**
   - Click **"SSH keys"** tab
   - You'll see "Default" key for your region

3. **Download Key**
   - Click **"Download"** next to the default key
   - Save as `lightsail-key.pem` (or remember the filename)
   - **Keep this file safe - you'll need its contents for GitHub!**

### Step 4: Setup Server

1. **Connect to Instance**
   - Go back to your instance page
   - Click **"Connect using SSH"** (orange button)
   - A browser-based terminal will open

2. **Install Docker & Dependencies**
   
   Copy and paste these commands one at a time:

   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   ```

   ```bash
   # Install Docker
   sudo apt install -y apt-transport-https ca-certificates curl software-properties-common
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
   echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
   sudo apt update
   sudo apt install -y docker-ce docker-ce-cli containerd.io
   ```

   ```bash
   # Install Docker Compose
   sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

   ```bash
   # Add user to docker group
   sudo usermod -aG docker ubuntu
   ```

   ```bash
   # Install rsync (needed for deployment)
   sudo apt install -y rsync
   ```

3. **Create App Directory**
   ```bash
   mkdir -p ~/aquarium
   ```

4. **Exit and Reconnect**
   ```bash
   exit
   ```
   - Click **"Connect using SSH"** again (to refresh Docker permissions)

5. **Verify Installation**
   ```bash
   docker --version
   docker-compose --version
   ```
   - You should see version numbers for both

---

## Part 2: GitHub Secrets Setup (5 minutes)

### Step 1: Generate Secure Secrets

1. **Open Terminal on Your Computer** (not AWS)

2. **Generate JWT Secret**
   ```bash
   openssl rand -hex 32
   ```
   - Copy the output (e.g., `9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f8e`)
   - **Save this!**

3. **Generate MongoDB Password**
   ```bash
   openssl rand -hex 16
   ```
   - Copy the output (e.g., `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`)
   - **Save this!**

### Step 2: Add Secrets to GitHub

1. **Go to Your GitHub Repository**
   - Visit: https://github.com/annabel-goldman/aquarium

2. **Open Settings**
   - Click the **"Settings"** tab (top right)

3. **Navigate to Secrets**
   - In left sidebar, expand **"Secrets and variables"**
   - Click **"Actions"**

4. **Add Each Secret**
   
   Click **"New repository secret"** for each of these:

   **Secret 1: LIGHTSAIL_HOST**
   - Name: `LIGHTSAIL_HOST`
   - Value: Your instance public IP (e.g., `54.123.45.67`)
   - Click **"Add secret"**

   **Secret 2: LIGHTSAIL_USER**
   - Name: `LIGHTSAIL_USER`
   - Value: `ubuntu`
   - Click **"Add secret"**

   **Secret 3: LIGHTSAIL_SSH_KEY**
   - Name: `LIGHTSAIL_SSH_KEY`
   - Value: Complete contents of your `lightsail-key.pem` file
   - **How to get it:**
     - On Mac/Linux: `cat ~/Downloads/lightsail-key.pem`
     - Copy EVERYTHING including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`
   - Click **"Add secret"**

   **Secret 4: MONGO_ROOT_USERNAME**
   - Name: `MONGO_ROOT_USERNAME`
   - Value: `aquarium_admin`
   - Click **"Add secret"**

   **Secret 5: MONGO_ROOT_PASSWORD**
   - Name: `MONGO_ROOT_PASSWORD`
   - Value: Your generated MongoDB password from Step 1
   - Click **"Add secret"**

   **Secret 6: JWT_SECRET**
   - Name: `JWT_SECRET`
   - Value: Your generated JWT secret from Step 1
   - Click **"Add secret"**

   **Secret 7: VITE_API_BASE_URL**
   - Name: `VITE_API_BASE_URL`
   - Value: `http://YOUR_IP/api` (replace YOUR_IP with your actual IP)
   - Example: `http://54.123.45.67/api`
   - Click **"Add secret"**

5. **Verify All Secrets**
   - You should now see 7 repository secrets listed
   - They'll show up as `LIGHTSAIL_HOST`, `LIGHTSAIL_USER`, etc.

---

## Part 3: Deploy! (2 minutes)

### Automatic Deployment

Your app will deploy automatically when you push to the `main` branch.

Since this is your first push:

1. **Code is Already Staged**
   - You're ready to commit and push

2. **Push Triggers Deployment**
   - As soon as you push to `main`, GitHub Actions will:
     - Build your Docker containers
     - Deploy to your Lightsail instance
     - Start all services

3. **Watch Deployment Progress**
   - Go to your GitHub repo
   - Click **"Actions"** tab
   - You'll see "Deploy to AWS Lightsail" workflow running
   - Click on it to see live logs
   - Takes about 3-5 minutes

4. **Deployment Complete!**
   - When you see green checkmarks, it's done
   - Your app is live!

---

## Part 4: Access Your App (1 minute)

1. **Open Your Browser**
   - Go to: `http://YOUR_PUBLIC_IP`
   - Example: `http://54.123.45.67`

2. **Create Your Account**
   - Click **"Don't have an account? Register"**
   - Choose a username (lowercase, numbers, underscores only)
   - Create a password (at least 8 characters)
   - Click **"Create Account"**

3. **Start Adding Fish!** 🐠
   - Click **"Create New Tank"** to make your first tank
   - Click **"Add Fish"** to populate it
   - Choose species, color, size, and name
   - Watch your fish swim!

---

## 🎉 You're Live!

Your aquarium app is now running on AWS Lightsail for $3.50/month!

---

## 🔄 Updating Your App

To deploy updates:

1. Make changes to your code locally
2. Commit changes: `git add . && git commit -m "Your update message"`
3. Push to GitHub: `git push origin main`
4. GitHub Actions automatically redeploys (2-3 minutes)
5. Refresh your browser to see changes

---

## 🐛 Troubleshooting

### App Not Loading

**Problem:** Browser shows "Can't connect" or timeout

**Solutions:**
1. Wait 30 seconds after deployment completes (containers need time to start)
2. Check firewall rules in Lightsail (ports 80, 443 should be open)
3. Verify IP address is correct
4. Check if containers are running:
   - SSH into Lightsail: Click "Connect using SSH"
   - Run: `cd ~/aquarium && docker-compose -f docker-compose.prod.yml ps`
   - All 3 services should show "Up"

### GitHub Actions Deployment Failed

**Problem:** Red X on Actions tab

**Solutions:**
1. Click on the failed workflow to see error
2. Common issues:
   - **SSH Permission denied:** 
     - Make sure `LIGHTSAIL_SSH_KEY` includes the full key with BEGIN/END lines
     - Make sure `LIGHTSAIL_USER` is set to `ubuntu`
   - **Connection timeout:**
     - Verify `LIGHTSAIL_HOST` IP is correct
     - Check Lightsail firewall allows SSH (port 22)
   - **Docker build failed:**
     - SSH into server
     - Run: `docker-compose -f ~/aquarium/docker-compose.prod.yml logs`

### Can't Login or Register

**Problem:** "Invalid credentials" or "Username already exists"

**Solutions:**
1. Make sure password is at least 8 characters
2. Username must be lowercase letters, numbers, and underscores only (3-20 chars)
3. If username exists, try a different one
4. Check backend logs:
   - SSH into server
   - Run: `cd ~/aquarium && docker-compose -f docker-compose.prod.yml logs backend`

### View Live Logs

SSH into your Lightsail instance and run:

```bash
cd ~/aquarium

# All services
docker-compose -f docker-compose.prod.yml logs -f

# Just backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Just frontend/nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Just database
docker-compose -f docker-compose.prod.yml logs -f mongodb
```

Press `Ctrl+C` to exit logs.

### Restart Services

If something seems stuck:

```bash
cd ~/aquarium
docker-compose -f docker-compose.prod.yml restart
```

### Full Reset

If you need to start fresh:

```bash
cd ~/aquarium
docker-compose -f docker-compose.prod.yml down -v
# Then push to GitHub again to redeploy
```

---

## 💰 Cost Monitoring

- Log into AWS Console
- Go to Lightsail
- View your bill under "Account" → "Billing"
- Should be $3.50/month flat rate
- Includes 1TB data transfer

---

## 🔒 Security Notes

✅ **What's Secured:**
- Password authentication (bcrypt hashed)
- Rate limiting (5 login attempts/minute)
- Secure session cookies (HttpOnly)
- MongoDB authentication
- Environment variables hidden in GitHub Secrets

⚠️ **Using HTTP (not HTTPS):**
- Currently running on `http://` (unencrypted)
- Passwords are hashed but transmitted over HTTP
- For production with real users, consider adding HTTPS with Let's Encrypt
- Would require a domain name (not covered in this guide)

---

## 📊 What's Running

Your $3.50/month Lightsail instance is running:

- **Nginx** - Web server & reverse proxy (port 80)
- **React Frontend** - Your aquarium interface (built static files)
- **FastAPI Backend** - Python API (port 8000, internal)
- **MongoDB** - Database (port 27017, internal)

All managed by Docker Compose with auto-restart.

---

## 🎓 Next Steps

- Share your aquarium URL with friends!
- Monitor your app via GitHub Actions tab
- Check AWS bill to confirm $3.50/month
- Make updates by pushing to GitHub

---

**Need Help?**
- Check GitHub Actions logs for deployment issues
- SSH into Lightsail to check container logs
- Open an issue on GitHub: https://github.com/annabel-goldman/aquarium/issues

**Enjoy your aquarium! 🐠🐟🦈**

