# Music Streaming Platform

A full-stack music streaming platform with AI-based recommendations, built with React and Node.js, featuring social sharing, offline mode, and premium subscriptions.

## 🎵 Features

### Core Features
- **Song Playback**: Play, pause, seek, and control volume
- **Search**: Search for songs, artists, and albums
- **Playlists**: Create and manage personal playlists
- **Artist Following**: Follow your favorite artists
- **Downloads**: Download songs for offline listening (requires authentication)
- **Social Sharing**: Share songs with friends via shareable links

### AI-Powered Features
- **Personalized Recommendations**: AI-based song recommendations based on listening history
- **Trending Songs**: Discover what's popular right now

### User Features
- **Authentication**: JWT-based authentication with secure login/register
- **OAuth Support**: Google OAuth integration ready
- **User Library**: Access your playlists and listening history
- **Premium Subscriptions**: Upgrade to premium for enhanced features

### Premium Features
- Ad-free listening
- Unlimited downloads
- High-quality audio streaming
- Offline playback
- Early access to new releases
- Exclusive content and playlists

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 with Vite
- **Routing**: React Router DOM
- **HTTP Client**: Axios
- **UI**: Custom CSS with modern, responsive design
- **Icons**: React Icons
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js with Express
- **Database**: PostgreSQL for persistent data
- **Cache**: Redis for performance optimization
- **Authentication**: JWT tokens, OAuth 2.0 (Google)
- **Payments**: Stripe integration for subscriptions

### Infrastructure
- **Containerization**: Docker with multi-container setup
- **Reverse Proxy**: Nginx for routing and load balancing
- **CI/CD**: GitHub Actions for automated testing and deployment

## 📁 Project Structure

```
.
├── backend/                  # Node.js backend
│   ├── src/
│   │   ├── config/          # Database and Redis configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── middleware/      # Authentication middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # API routes
│   │   ├── services/        # Business logic
│   │   └── server.js        # Entry point
│   ├── Dockerfile
│   └── package.json
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and auth services
│   │   ├── styles/          # CSS styles
│   │   ├── App.jsx          # Main app component
│   │   └── main.jsx         # Entry point
│   ├── public/
│   ├── Dockerfile
│   └── package.json
│
├── nginx/                    # Nginx configuration
│   └── nginx.conf
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml        # CI/CD pipeline
│
└── docker-compose.yml        # Docker Compose configuration
```

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- PostgreSQL 15+ (for local development)
- Redis 7+ (for local development)

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/2300031147/CI-CD-Project.git
   cd CI-CD-Project
   ```

2. **Start all services**
   ```bash
   docker-compose up -d
   ```

3. **Access the application**
   - Frontend: http://localhost:80
   - Backend API: http://localhost:80/api
   - Health Check: http://localhost:80/health

### Local Development

#### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create .env file**
   ```bash
   cp .env.example .env
   ```

4. **Start PostgreSQL and Redis**
   ```bash
   docker-compose up -d postgres redis
   ```

5. **Initialize database**
   ```bash
   psql -h localhost -U postgres -d musicdb -f src/config/init.sql
   ```

6. **Start backend server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Access the application**
   - Frontend: http://localhost:3000

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Frontend Build
```bash
cd frontend
npm run build
```

### Linting
```bash
# Backend
cd backend
npm run lint

# Frontend
cd frontend
npm run lint
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=postgres
DB_PORT=5432
DB_NAME=musicdb
DB_USER=postgres
DB_PASSWORD=postgres
REDIS_HOST=redis
REDIS_PORT=6379
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
STRIPE_WEBHOOK_SECRET=your-webhook-secret
```

## 📊 Database Schema

The platform uses PostgreSQL with the following main tables:
- **users**: User accounts and authentication
- **artists**: Artist information
- **songs**: Song metadata and statistics
- **playlists**: User-created playlists
- **playlist_songs**: Many-to-many relationship for playlists and songs
- **user_follows**: Artist follow relationships
- **downloads**: Download history for recommendations
- **payments**: Payment transaction records

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcryptjs
- SQL injection protection with parameterized queries
- CORS configuration
- Rate limiting ready
- Environment-based secrets

## 🎨 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Songs
- `GET /api/songs` - Get all songs (with search and pagination)
- `GET /api/songs/:id` - Get song by ID
- `POST /api/songs/:id/play` - Record song play
- `POST /api/songs/:id/download` - Download song (authenticated)

### Playlists
- `GET /api/playlists` - Get user playlists (authenticated)
- `POST /api/playlists` - Create playlist (authenticated)
- `GET /api/playlists/:id` - Get playlist by ID
- `POST /api/playlists/:id/songs` - Add song to playlist (authenticated)
- `DELETE /api/playlists/:id/songs/:songId` - Remove song from playlist (authenticated)

### Artists
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist by ID
- `POST /api/artists/:id/follow` - Follow artist (authenticated)
- `DELETE /api/artists/:id/follow` - Unfollow artist (authenticated)

### Recommendations
- `GET /api/recommendations` - Get personalized recommendations (authenticated)
- `GET /api/recommendations/trending` - Get trending songs

### Payments
- `POST /api/payments/create-payment-intent` - Create payment intent (authenticated)
- `GET /api/payments/subscription` - Get subscription status (authenticated)

### Users
- `GET /api/users/me` - Get user profile (authenticated)
- `PUT /api/users/me` - Update user profile (authenticated)
- `GET /api/users/me/history` - Get listening history (authenticated)

## 🚢 Deployment

The application is containerized and ready for deployment on any platform that supports Docker:

1. **Cloud Platforms**: AWS ECS, Google Cloud Run, Azure Container Instances
2. **Kubernetes**: Deploy with Kubernetes manifests
3. **Traditional VPS**: Use docker-compose on any server

### CI/CD Pipeline

The GitHub Actions workflow automatically:
1. Runs linting on backend and frontend
2. Runs tests
3. Builds Docker images
4. Validates docker-compose configuration
5. Deploys to production (when configured)

## 📝 License

MIT License

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For support, please open an issue in the GitHub repository.