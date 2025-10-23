# Docker Deployment Guide

This guide covers deploying the Music Streaming Platform using Docker and Docker Compose.

## Quick Start

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Check service status
docker compose ps

# Stop all services
docker compose down

# Stop and remove volumes (clears database)
docker compose down -v
```

## Architecture

The application consists of 5 Docker containers:

1. **postgres**: PostgreSQL 15 database
2. **redis**: Redis 7 cache
3. **backend**: Node.js Express API
4. **frontend**: React application served by Nginx
5. **nginx**: Reverse proxy for routing

## Container Details

### PostgreSQL (postgres)

- **Image**: postgres:15-alpine
- **Port**: 5432
- **Volume**: postgres_data
- **Environment**:
  - POSTGRES_DB=musicdb
  - POSTGRES_USER=postgres
  - POSTGRES_PASSWORD=postgres
- **Health Check**: pg_isready

The database is automatically initialized with the schema from `backend/src/config/init.sql`.

### Redis (redis)

- **Image**: redis:7-alpine
- **Port**: 6379
- **Volume**: redis_data
- **Health Check**: redis-cli ping

Used for caching song data, recommendations, and trending content.

### Backend (backend)

- **Build Context**: ./backend
- **Port**: 5000
- **Depends On**: postgres (healthy), redis (healthy)
- **Environment**: See docker-compose.yml

The backend starts only after PostgreSQL and Redis are healthy.

### Frontend (frontend)

- **Build Context**: ./frontend
- **Port**: 3000
- **Depends On**: backend

Multi-stage build:
1. Build React app with Vite
2. Serve with Nginx

### Nginx (nginx)

- **Image**: nginx:alpine
- **Port**: 80
- **Config**: ./nginx/nginx.conf
- **Depends On**: frontend, backend

Routes requests to frontend and backend services.

## Building Images

### Build All Images

```bash
docker compose build
```

### Build Specific Image

```bash
docker compose build backend
docker compose build frontend
```

### Build Without Cache

```bash
docker compose build --no-cache
```

## Managing Services

### Start Services

```bash
# Start all
docker compose up -d

# Start specific service
docker compose up -d backend

# Start with logs in foreground
docker compose up
```

### Stop Services

```bash
# Stop all
docker compose stop

# Stop specific service
docker compose stop backend
```

### Restart Services

```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart backend
```

### Remove Services

```bash
# Stop and remove containers
docker compose down

# Also remove volumes
docker compose down -v

# Also remove images
docker compose down --rmi all
```

## Viewing Logs

### All Services

```bash
docker compose logs -f
```

### Specific Service

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```

### Last N Lines

```bash
docker compose logs --tail=100 backend
```

## Executing Commands

### Backend Container

```bash
# Open shell
docker compose exec backend sh

# Run npm command
docker compose exec backend npm test

# Check Node.js version
docker compose exec backend node --version
```

### PostgreSQL Container

```bash
# Open psql
docker compose exec postgres psql -U postgres -d musicdb

# Run SQL file
docker compose exec postgres psql -U postgres -d musicdb -f /path/to/file.sql

# Backup database
docker compose exec postgres pg_dump -U postgres musicdb > backup.sql

# Restore database
docker compose exec -T postgres psql -U postgres -d musicdb < backup.sql
```

### Redis Container

```bash
# Open redis-cli
docker compose exec redis redis-cli

# Check keys
docker compose exec redis redis-cli KEYS '*'

# Flush cache
docker compose exec redis redis-cli FLUSHALL
```

## Environment Variables

### Override in docker-compose.yml

Edit `docker-compose.yml` to change environment variables:

```yaml
backend:
  environment:
    - NODE_ENV=production
    - JWT_SECRET=your-secret-here
```

### Use .env File

Create `.env` in the project root:

```env
DB_PASSWORD=secure_password
JWT_SECRET=your-jwt-secret
STRIPE_SECRET_KEY=sk_test_xxx
```

Reference in docker-compose.yml:

```yaml
backend:
  environment:
    - DB_PASSWORD=${DB_PASSWORD}
    - JWT_SECRET=${JWT_SECRET}
```

## Networking

### Internal Network

All containers are on the `music-network` bridge network and can communicate using service names:

- Backend connects to PostgreSQL at `postgres:5432`
- Backend connects to Redis at `redis:6379`
- Frontend proxies API to `backend:5000`
- Nginx routes to `frontend:3000` and `backend:5000`

### External Access

Only these ports are exposed to the host:

- `80`: Nginx (main entry point)
- `3000`: Frontend (development)
- `5000`: Backend API (development)
- `5432`: PostgreSQL (development)
- `6379`: Redis (development)

For production, only expose port 80.

## Volumes

### Named Volumes

```bash
# List volumes
docker volume ls

# Inspect volume
docker volume inspect ci-cd-project_postgres_data

# Remove unused volumes
docker volume prune
```

### Backup Volumes

```bash
# Backup PostgreSQL data
docker run --rm \
  -v ci-cd-project_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/postgres-backup.tar.gz -C /data .

# Restore PostgreSQL data
docker run --rm \
  -v ci-cd-project_postgres_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/postgres-backup.tar.gz -C /data
```

## Health Checks

### Check Service Health

```bash
docker compose ps
```

Look for "(healthy)" status on postgres and redis.

### Manual Health Checks

```bash
# Backend health
curl http://localhost:5000/health

# PostgreSQL health
docker compose exec postgres pg_isready -U postgres

# Redis health
docker compose exec redis redis-cli ping
```

## Troubleshooting

### Container Won't Start

```bash
# View logs
docker compose logs service-name

# Check if port is in use
sudo lsof -i :80
sudo lsof -i :5432

# Rebuild container
docker compose up -d --build --force-recreate service-name
```

### Database Connection Issues

```bash
# Check if PostgreSQL is healthy
docker compose ps postgres

# View PostgreSQL logs
docker compose logs postgres

# Test connection
docker compose exec postgres psql -U postgres -c "SELECT 1"
```

### Out of Disk Space

```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune

# Remove unused volumes
docker volume prune

# Remove everything unused
docker system prune -a
```

### Performance Issues

```bash
# View container stats
docker stats

# Limit container resources in docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
```

## Production Deployment

### Security Checklist

- [ ] Change default passwords
- [ ] Use secrets for sensitive data
- [ ] Don't expose unnecessary ports
- [ ] Use SSL/TLS certificates
- [ ] Enable security scanning
- [ ] Set up log rotation
- [ ] Configure backups

### Production docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    # ... same as dev
    ports: []  # Don't expose externally
    
  redis:
    # ... same as dev
    ports: []  # Don't expose externally
    
  backend:
    # ... same as dev
    ports: []  # Don't expose externally
    restart: always
    
  frontend:
    # ... same as dev
    ports: []  # Don't expose externally
    restart: always
    
  nginx:
    # ... same as dev
    ports:
      - "80:80"
      - "443:443"  # Add SSL
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro  # SSL certificates
    restart: always
```

### Using Docker Secrets

```yaml
secrets:
  db_password:
    file: ./secrets/db_password.txt
  jwt_secret:
    file: ./secrets/jwt_secret.txt

services:
  backend:
    secrets:
      - db_password
      - jwt_secret
    environment:
      - DB_PASSWORD_FILE=/run/secrets/db_password
      - JWT_SECRET_FILE=/run/secrets/jwt_secret
```

### Monitoring

Add monitoring containers:

```yaml
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    depends_on:
      - prometheus
```

## CI/CD Integration

### GitHub Actions

The project includes a CI/CD pipeline in `.github/workflows/ci-cd.yml` that:

1. Tests backend and frontend
2. Builds Docker images
3. Validates docker-compose.yml
4. (Optional) Pushes to registry
5. (Optional) Deploys to production

### Docker Registry

Push images to Docker Hub or private registry:

```bash
# Tag images
docker tag music-backend:latest your-registry/music-backend:latest
docker tag music-frontend:latest your-registry/music-frontend:latest

# Push images
docker push your-registry/music-backend:latest
docker push your-registry/music-frontend:latest
```

### Update docker-compose.yml

```yaml
services:
  backend:
    image: your-registry/music-backend:latest
    # Remove build section
    
  frontend:
    image: your-registry/music-frontend:latest
    # Remove build section
```

## Scaling

### Horizontal Scaling

Use Docker Swarm or Kubernetes for scaling:

```bash
# Docker Swarm
docker swarm init
docker stack deploy -c docker-compose.yml music

# Scale backend
docker service scale music_backend=3
```

### Load Testing

Test the scaled setup:

```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Run load test
ab -n 1000 -c 10 http://localhost/api/songs
```

## Best Practices

1. **Use specific image tags**: `postgres:15-alpine` not `postgres:latest`
2. **Multi-stage builds**: Keep images small
3. **Health checks**: Ensure dependencies are ready
4. **Named volumes**: Persist important data
5. **Restart policies**: Use `unless-stopped` or `always`
6. **Resource limits**: Prevent containers from consuming all resources
7. **Logging**: Configure log drivers for production
8. **Security**: Scan images regularly with `docker scan`

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Security Best Practices](https://docs.docker.com/engine/security/)
