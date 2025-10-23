# Setup Guide

## Prerequisites

Before starting, ensure you have the following installed:
- Docker Desktop (for Mac/Windows) or Docker Engine (for Linux)
- Docker Compose v2.0+
- Node.js 18+ and npm (for local development)
- Git

## Installation Methods

### Method 1: Docker Compose (Recommended)

This is the easiest way to get the entire platform running.

1. **Clone the Repository**
   ```bash
   git clone https://github.com/2300031147/CI-CD-Project.git
   cd CI-CD-Project
   ```

2. **Start All Services**
   ```bash
   docker compose up -d
   ```

   This will start:
   - PostgreSQL database on port 5432
   - Redis cache on port 6379
   - Backend API on port 5000
   - Frontend React app on port 3000
   - Nginx reverse proxy on port 80

3. **Check Service Status**
   ```bash
   docker compose ps
   ```

4. **View Logs**
   ```bash
   docker compose logs -f
   ```

5. **Access the Application**
   - Web UI: http://localhost:80
   - Backend API: http://localhost:80/api
   - Health Check: http://localhost:80/health

6. **Stop All Services**
   ```bash
   docker compose down
   ```

7. **Stop and Remove Data**
   ```bash
   docker compose down -v
   ```

### Method 2: Local Development

For development with hot reloading.

#### Backend Setup

1. **Navigate to Backend**
   ```bash
   cd backend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Database Services**
   ```bash
   docker compose up -d postgres redis
   ```

4. **Initialize Database**
   ```bash
   # Install PostgreSQL client if not already installed
   # On Ubuntu: sudo apt-get install postgresql-client
   # On Mac: brew install postgresql
   
   psql -h localhost -U postgres -d musicdb -f src/config/init.sql
   ```

5. **Create Environment File**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and update the values as needed.

6. **Start Backend Server**
   ```bash
   npm run dev
   ```
   
   The backend will be available at http://localhost:5000

#### Frontend Setup

1. **Navigate to Frontend** (in a new terminal)
   ```bash
   cd frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The frontend will be available at http://localhost:3000

## Testing the Application

### Create a Test Account

1. Open http://localhost:80 in your browser
2. Click "Login" in the header
3. Click "Sign Up" to create a new account
4. Fill in the form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
5. Click "Sign Up"

### Explore Features

1. **Browse Songs**: The home page shows trending songs
2. **Search**: Click "Search" in the header to find songs and artists
3. **Play Music**: Click on any song card to start playing
4. **Create Playlist**: Go to "Library" and click "Create Playlist"
5. **Follow Artists**: Search for an artist and click "Follow"
6. **Premium Features**: Click "Go Premium" to see subscription options

## Testing

### Run Backend Tests

```bash
cd backend
npm test
```

### Run Backend Linter

```bash
cd backend
npm run lint
```

### Build Frontend

```bash
cd frontend
npm run build
```

### Run Frontend Linter

```bash
cd frontend
npm run lint
```

## Troubleshooting

### Port Already in Use

If you get an error about ports already in use:

1. Check what's using the port:
   ```bash
   # On Linux/Mac
   lsof -i :80
   lsof -i :5432
   
   # On Windows
   netstat -ano | findstr :80
   netstat -ano | findstr :5432
   ```

2. Stop the conflicting service or change the port in `docker-compose.yml`

### Database Connection Issues

If the backend can't connect to the database:

1. Check if PostgreSQL is running:
   ```bash
   docker compose ps postgres
   ```

2. Check PostgreSQL logs:
   ```bash
   docker compose logs postgres
   ```

3. Verify the database exists:
   ```bash
   docker compose exec postgres psql -U postgres -l
   ```

### Redis Connection Issues

If the backend can't connect to Redis:

1. Check if Redis is running:
   ```bash
   docker compose ps redis
   ```

2. Test Redis connection:
   ```bash
   docker compose exec redis redis-cli ping
   ```

### Frontend Build Issues

If the frontend fails to build:

1. Clear npm cache:
   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm cache clean --force
   npm install
   ```

2. Check Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

### Container Issues

If containers are failing to start:

1. Check Docker logs:
   ```bash
   docker compose logs
   ```

2. Rebuild containers:
   ```bash
   docker compose down
   docker compose build --no-cache
   docker compose up -d
   ```

## Development Tips

### Hot Reloading

- Backend: The dev server uses `nodemon` for hot reloading
- Frontend: Vite provides hot module replacement (HMR)

### Database Management

View database contents:
```bash
docker compose exec postgres psql -U postgres -d musicdb

# Example queries:
SELECT * FROM users;
SELECT * FROM songs;
SELECT * FROM playlists;
```

### Redis Cache Management

Clear Redis cache:
```bash
docker compose exec redis redis-cli FLUSHALL
```

View Redis keys:
```bash
docker compose exec redis redis-cli KEYS '*'
```

### API Testing

Use curl or tools like Postman/Insomnia:

```bash
# Health check
curl http://localhost:5000/health

# Get trending songs
curl http://localhost:5000/api/recommendations/trending

# Login (get token)
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get user profile (with token)
curl http://localhost:5000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Production Deployment

### Environment Variables

Before deploying to production, update these environment variables:

1. `JWT_SECRET`: Use a strong, random secret
2. `STRIPE_SECRET_KEY`: Your Stripe API key
3. `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
4. `DB_PASSWORD`: Use a strong database password

### Security Checklist

- [ ] Change default database passwords
- [ ] Set strong JWT secret
- [ ] Enable HTTPS with SSL certificates
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable database backups
- [ ] Configure monitoring and logging
- [ ] Set up error tracking (e.g., Sentry)

### Deployment Platforms

The application can be deployed to:
- AWS (ECS, Elastic Beanstalk, or EC2)
- Google Cloud (Cloud Run, GKE, or Compute Engine)
- Azure (Container Instances or AKS)
- DigitalOcean (App Platform or Droplets)
- Heroku (with Docker)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the logs: `docker compose logs`
3. Open an issue on GitHub

## Next Steps

1. Explore the codebase
2. Read the API documentation in README.md
3. Try building new features
4. Set up your own payment integration
5. Deploy to production

Happy coding! 🎵
