# 🐠 Aquarium App V2

A beautiful virtual aquarium with multi-tank support, user authentication, and animated fish. Deploy to AWS Lightsail for just $3.50/month!

## Features

- 🐟 Multiple fish species with animated tails (Angelfish, Clownfish, Dolphin, Seahorse, Evilfish)
- 🎨 Custom colors and sizes for each fish
- 🏠 Multiple tank support - create and manage different aquariums
- 🔐 Password authentication with bcrypt hashing
- 🚦 Rate limiting for security
- 🐳 Fully Dockerized for easy deployment
- ☁️ Deploy to AWS Lightsail for $3.50/month with automated GitHub Actions

## Tech Stack

- **Frontend:** React, Vite, TailwindCSS, React Router
- **Backend:** FastAPI (Python), Motor (async MongoDB)
- **Database:** MongoDB
- **Deployment:** Docker, Nginx, AWS Lightsail, GitHub Actions

---

## Prerequisites

- Docker and Docker Compose
- Git

## Quick Start

1. Clone the repository:
```bash
git clone <your-repo-url>
cd aquarium
```

2. Start the application:
```bash
docker-compose up
```

3. Open your browser and navigate to:
```
http://localhost:5173
```

The application will automatically create the necessary database and start both the frontend and backend services.

4. Create your account:
   - Click "Register" and create an account (use any password in dev mode)
   - Start adding fish to your tanks! 🐠

---

## Production Deployment ($3.50/month)

Deploy to AWS Lightsail with automatic GitHub Actions:

### Quick Setup (10 minutes)

1. **Generate secrets:**
   ```bash
   openssl rand -hex 32  # JWT_SECRET
   openssl rand -hex 16  # MongoDB password
   ```

2. **Create AWS Lightsail instance:**
   - Go to [AWS Lightsail](https://lightsail.aws.amazon.com/)
   - Create Ubuntu 22.04 instance ($3.50/month plan)
   - Configure firewall: ports 22, 80, 443
   - Download SSH key

3. **Setup server:**
   ```bash
   scp -i lightsail-key.pem scripts/setup-lightsail.sh ubuntu@YOUR_IP:~/
   ssh -i lightsail-key.pem ubuntu@YOUR_IP
   bash setup-lightsail.sh
   ```

4. **Configure GitHub Secrets:**
   - Go to your repo → Settings → Secrets → Actions
   - Add these 7 secrets:
     - `LIGHTSAIL_HOST` - Your instance IP
     - `LIGHTSAIL_USER` - `ubuntu`
     - `LIGHTSAIL_SSH_KEY` - Contents of `lightsail-key.pem`
     - `MONGO_ROOT_USERNAME` - `aquarium_admin`
     - `MONGO_ROOT_PASSWORD` - Generated password
     - `JWT_SECRET` - Generated secret
     - `VITE_API_BASE_URL` - `http://YOUR_IP/api`

5. **Deploy:**
   ```bash
   git push origin main  # Automatic deployment!
   ```

That's it! GitHub Actions will automatically deploy your app to AWS Lightsail.

---

## Development Commands

### Stop the Application
```bash
# Stop containers
docker-compose down

# Stop and remove volumes (fresh start)
docker-compose down -v
```

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Rebuild After Changes
```bash
# Rebuild and restart
docker-compose up --build
```

---

## Project Structure

```
aquarium/
├── backend/              # FastAPI backend
│   ├── app/
│   │   ├── main.py      # Application entry point
│   │   ├── models.py    # Pydantic models & password hashing
│   │   ├── auth.py      # JWT authentication
│   │   ├── database.py  # MongoDB connection
│   │   └── routers/     # API route handlers
│   ├── Dockerfile       # Development container
│   └── Dockerfile.prod  # Production container
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   └── api/         # API client
│   ├── Dockerfile       # Development container
│   └── Dockerfile.prod  # Production container
├── nginx/               # Nginx configuration
├── scripts/             # Deployment scripts
├── .github/workflows/   # GitHub Actions CI/CD
├── docker-compose.yml   # Development setup
└── docker-compose.prod.yml  # Production setup
```

---

## API Endpoints

### Authentication
- `POST /api/sessions` - Login
- `POST /api/sessions/register` - Register new user
- `GET /api/sessions/me` - Get current session
- `DELETE /api/sessions` - Logout

### Tanks
- `GET /api/tanks` - List all tanks
- `POST /api/tanks` - Create new tank
- `GET /api/tanks/{tankId}` - Get tank details
- `DELETE /api/tanks/{tankId}` - Delete tank

### Fish
- `POST /api/tanks/{tankId}/fish` - Add fish to tank
- `DELETE /api/tanks/{tankId}/fish/{fishId}` - Remove fish

---

## Security Features

- ✅ **Password Authentication:** Bcrypt hashed passwords
- ✅ **Rate Limiting:** 5 login attempts/minute, 100 API calls/minute
- ✅ **Secure Sessions:** HttpOnly cookies with JWT tokens
- ✅ **MongoDB Auth:** Username/password protection
- ✅ **HTTPS Ready:** Let's Encrypt SSL support
- ✅ **Input Validation:** Pydantic models with strict validation

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `docker-compose up`
5. Submit a pull request

---

## License

MIT License - feel free to use this project for your own aquariums!

---

## Support

- 🐛 [Report Issues](https://github.com/annabel-goldman/aquarium/issues)

## Cost

- **AWS Lightsail:** $3.50/month (512MB, 1TB transfer, 20GB SSD)
- **GitHub Actions:** Free (< 2000 min/month)
- **Let's Encrypt SSL:** Free
- **Total: $3.50/month**

---

**Happy Fish Keeping! 🐠🐟🦈**
