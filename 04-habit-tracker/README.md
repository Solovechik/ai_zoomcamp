# Habit Tracker

A full-stack habit tracking application that helps users build and maintain positive daily habits through streak tracking, calendar visualizations, and progress analytics.

## Problem Description

### The Challenge

Building consistent habits is one of the most effective ways to achieve long-term goals, yet most people struggle with:
- **Forgetting to track habits** due to lack of a centralized system
- **Losing motivation** when they can't see their progress
- **Breaking streaks** without understanding patterns in their behavior
- **Lack of accountability** from not having visual progress indicators

### The Solution

This Habit Tracker application addresses these challenges by providing:

1. **Simple Daily Tracking**: One-click completion toggle for each habit
2. **Streak Visualization**: Real-time streak counters with milestone celebrations
3. **Calendar History**: Monthly view showing completion patterns over time
4. **Progress Analytics**: Completion rates, longest streaks, and trend analysis
5. **Flexible Scheduling**: Support for daily, weekday, weekend, or custom schedules
6. **Customization**: Personalize habits with colors and icons for quick recognition

### Expected Functionality

| Feature | Description |
|---------|-------------|
| Create Habits | Add new habits with name, description, color, icon, and schedule |
| Daily Check-in | Mark habits complete/incomplete for any date |
| Streak Tracking | Automatic calculation of current and longest streaks |
| Calendar View | Visual history of completions for each habit |
| Statistics | Dashboard showing overall progress and individual habit analytics |
| Archive | Soft-delete habits while preserving historical data |

---

## AI System Development

This project was developed using AI-assisted development tools and MCP (Model Context Protocol) integration. For detailed documentation, see [AGENTS.md](./AGENTS.md).

### AI Tools Used

- **Claude Code** (Anthropic): Primary AI assistant for architecture design, code generation, testing, and documentation
- **MCP Integration**: File system operations, bash execution, and code search capabilities

### Development Workflow

```
Planning → Backend Development → Frontend Development → Testing → Deployment
    │            │                     │                 │           │
    └──────────── AI-Assisted at Every Stage ───────────────────────┘
```

### MCP Tools Utilized

| Tool | Purpose |
|------|---------|
| File Operations | Reading patterns, writing code, editing files |
| Bash Execution | npm commands, Docker, testing |
| Search | Finding code patterns, exploring codebase |
| Explore Agent | Understanding existing project structure |
| Plan Agent | Designing implementation approach |

---

## Technologies and System Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | React 19 + Vite | Modern SPA with fast HMR development |
| **Routing** | React Router v7 | Client-side navigation |
| **State** | React Hooks | Local state management |
| **HTTP Client** | Axios | API communication |
| **UI Feedback** | React Hot Toast | User notifications |
| **Backend** | Node.js + Express | RESTful API server |
| **Database** | PostgreSQL 16 | Persistent data storage |
| **Testing** | Jest (backend) + Vitest (frontend) | Unit and integration tests |
| **Containerization** | Docker + Docker Compose | Consistent environments |
| **CI/CD** | GitHub Actions | Automated testing and deployment |
| **Deployment** | Render.com | Cloud hosting |

### System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Browser                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    React Application                     │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌───────────┐  │    │
│  │  │Dashboard│  │ Detail  │  │  Stats  │  │  Calendar │  │    │
│  │  │  Page   │  │  Page   │  │  Page   │  │   View    │  │    │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └─────┬─────┘  │    │
│  │       └────────────┴────────────┴─────────────┘        │    │
│  │                         │                               │    │
│  │              ┌──────────┴──────────┐                   │    │
│  │              │    API Service      │                   │    │
│  │              │   (Centralized)     │                   │    │
│  │              └──────────┬──────────┘                   │    │
│  └─────────────────────────┼───────────────────────────────┘    │
└────────────────────────────┼────────────────────────────────────┘
                             │ HTTP/REST
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Express.js Backend                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                      API Routes                           │   │
│  │  /api/habits  │  /api/completions  │  /api/stats         │   │
│  └───────┬───────────────┬────────────────────┬─────────────┘   │
│          │               │                    │                  │
│  ┌───────┴───────┐ ┌─────┴─────┐ ┌───────────┴───────────┐     │
│  │  Controllers  │ │Controllers│ │     Controllers       │     │
│  └───────┬───────┘ └─────┬─────┘ └───────────┬───────────┘     │
│          │               │                    │                  │
│  ┌───────┴───────────────┴────────────────────┴──────────┐     │
│  │                      Models Layer                      │     │
│  │   Habit.js  │  Completion.js  │  Streak Calculations   │     │
│  └──────────────────────────┬────────────────────────────┘     │
└─────────────────────────────┼───────────────────────────────────┘
                              │ SQL
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       PostgreSQL Database                        │
│  ┌─────────────────┐    ┌─────────────────┐                     │
│  │     habits      │    │   completions   │                     │
│  │  - id           │    │  - id           │                     │
│  │  - name         │◄───│  - habit_id     │                     │
│  │  - description  │    │  - completed_   │                     │
│  │  - color        │    │    date         │                     │
│  │  - icon         │    │  - created_at   │                     │
│  │  - frequency    │    └─────────────────┘                     │
│  │  - target_days  │                                            │
│  │  - is_active    │                                            │
│  └─────────────────┘                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## API Contract (OpenAPI Specification)

The complete OpenAPI 3.0 specification is available at [`docs/openapi.yaml`](./docs/openapi.yaml).

### API Endpoints Summary

#### Habits
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/habits` | List all habits with today's completion status |
| `POST` | `/api/habits` | Create a new habit |
| `GET` | `/api/habits/:id` | Get habit with detailed statistics |
| `PUT` | `/api/habits/:id` | Update a habit |
| `DELETE` | `/api/habits/:id` | Archive or delete a habit |

#### Completions
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/completions` | Mark habit completed for a date |
| `DELETE` | `/api/completions` | Remove a completion |
| `GET` | `/api/completions/:habitId` | Get completion history |

#### Statistics
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats/overview` | Get overall statistics |
| `GET` | `/api/stats/habits/:id` | Get habit-specific statistics |

#### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check endpoint |

### Example API Usage

```bash
# Create a habit
curl -X POST http://localhost:3001/api/habits \
  -H "Content-Type: application/json" \
  -d '{"name": "Morning Exercise", "color": "#22c55e", "icon": "fire"}'

# Mark habit completed
curl -X POST http://localhost:3001/api/completions \
  -H "Content-Type: application/json" \
  -d '{"habitId": 1, "date": "2024-01-20"}'

# Get statistics
curl http://localhost:3001/api/stats/overview
```

---

## Project Structure

```
04-habit-tracker/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable UI components
│   │   │   ├── CalendarView.jsx     # Monthly calendar visualization
│   │   │   ├── HabitCard.jsx        # Individual habit display
│   │   │   ├── HabitForm.jsx        # Create/edit habit modal
│   │   │   ├── HabitList.jsx        # List container
│   │   │   ├── Header.jsx           # Navigation header
│   │   │   ├── StatsPanel.jsx       # Statistics display
│   │   │   └── StreakBadge.jsx      # Streak indicator
│   │   ├── pages/                   # Route pages
│   │   │   ├── Dashboard.jsx        # Main dashboard
│   │   │   ├── HabitDetail.jsx      # Single habit view
│   │   │   └── Statistics.jsx       # Overall stats page
│   │   ├── services/
│   │   │   └── api.js               # Centralized API client
│   │   ├── hooks/
│   │   │   └── useHabits.js         # Habit state management
│   │   ├── utils/
│   │   │   ├── constants.js         # App constants
│   │   │   └── dateUtils.js         # Date formatting helpers
│   │   └── test/                    # Frontend tests
│   │       ├── setup.js
│   │       ├── utils.test.js
│   │       └── components.test.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # PostgreSQL connection pool
│   │   ├── models/
│   │   │   ├── Habit.js             # Habit CRUD operations
│   │   │   └── Completion.js        # Completion & streak logic
│   │   ├── controllers/
│   │   │   ├── habitController.js
│   │   │   ├── completionController.js
│   │   │   └── statsController.js
│   │   ├── routes/
│   │   │   ├── habits.js
│   │   │   ├── completions.js
│   │   │   └── stats.js
│   │   ├── tests/
│   │   │   └── integration.test.js  # API integration tests
│   │   └── app.js                   # Express app setup
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── jest.config.js
│
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql   # Database schema
│
├── docs/
│   └── openapi.yaml                 # API specification
│
├── .github/
│   └── workflows/
│       └── ci-cd.yml                # CI/CD pipeline
│
├── Dockerfile                       # Multi-stage Docker build
├── docker-compose.yml               # Local development setup
├── render.yaml                      # Render.com deployment
├── AGENTS.md                        # AI development documentation
├── package.json                     # Root scripts
└── README.md                        # This file
```

---

## Setup and Installation

### Prerequisites

- **Node.js** 20.x or higher
- **Docker** and **Docker Compose** (for containerized setup)
- **PostgreSQL** 16 (or use Docker)

### Quick Start (Docker - Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd 04-habit-tracker

# Start everything with Docker
docker-compose up -d

# Application available at:
# - Frontend: http://localhost:3002
# - API: http://localhost:3002/api
```

### Local Development Setup

```bash
# 1. Install all dependencies
npm run install:all

# 2. Start PostgreSQL database
npm run db:start

# 3. Wait for database to be ready (check with docker ps)
docker ps

# 4. Start development servers (frontend + backend)
npm run dev
```

**Development URLs:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

### Environment Variables

**Server (`server/.env`):**
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5434
DB_NAME=habit_tracker
DB_USER=devuser
DB_PASSWORD=devpass
CORS_ORIGIN=http://localhost:5173
```

**Client (`client/.env`):**
```env
VITE_API_URL=http://localhost:3001
```

---

## Testing

### Running Backend Tests

```bash
# Ensure database is running
npm run db:start

# Start server in one terminal
cd server && npm run dev

# Run tests in another terminal
npm test

# Or run with coverage
cd server && npm test -- --coverage
```

**Backend Test Coverage:**
- Habits CRUD operations
- Completion toggle (create/delete)
- Streak calculations (current, longest, with gaps)
- Statistics endpoints
- Validation and error handling

### Running Frontend Tests

```bash
cd client

# Run tests once
npm test -- --run

# Run tests in watch mode
npm test

# Run with coverage
npm run test:coverage
```

**Frontend Test Coverage:**
- Utility functions (date formatting, calculations)
- Component rendering (StreakBadge, HabitCard, HabitList, StatsPanel)
- User interactions (toggle completion, navigation)
- Edge cases (empty states, null values)

### Test Summary

| Test Suite | Framework | Tests | Coverage |
|------------|-----------|-------|----------|
| Backend Integration | Jest | 28 | API endpoints, database |
| Frontend Unit | Vitest | 25+ | Components, utilities |

---

## Containerization

### Docker Architecture

The project uses a multi-stage Docker build for optimal image size:

```dockerfile
# Stage 1: Build React frontend
FROM node:20-alpine AS frontend-builder
# Builds production-optimized frontend bundle

# Stage 2: Production image
FROM node:20-alpine
# Includes backend + frontend static files
# ~150MB final image size
```

### Docker Commands

```bash
# Build and run everything
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset database
docker-compose down -v && docker-compose up -d
```

### Docker Compose Services

| Service | Image | Port | Purpose |
|---------|-------|------|---------|
| `postgres` | postgres:16-alpine | 5434 | Database |
| `app` | habit-tracker | 3002 | Application |

---

## Deployment

### Render.com Deployment

The application is configured for Render.com deployment via `render.yaml`:

1. **Create Render Account**: Sign up at https://render.com
2. **Connect Repository**: Link your GitHub repository
3. **Create Blueprint**: Use "New Blueprint" and select the repository
4. **Deploy**: Render automatically provisions:
   - PostgreSQL database (free tier)
   - Web service with Docker build

**Production URL**: https://habit-tracker-app-tagb.onrender.com

### Manual Deployment

```bash
# Build Docker image
docker build -t habit-tracker .

# Push to registry (example: Docker Hub)
docker tag habit-tracker username/habit-tracker:latest
docker push username/habit-tracker:latest

# Deploy to any Docker-compatible host
docker run -d \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_NAME=habit_tracker \
  -e DB_USER=user \
  -e DB_PASSWORD=password \
  -p 3001:3001 \
  habit-tracker
```

---

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that:

### Pipeline Stages

1. **Backend Tests**
   - Spins up PostgreSQL service container
   - Runs database migrations
   - Executes Jest integration tests

2. **Frontend Tests & Build**
   - Runs Vitest component tests
   - Builds production frontend bundle
   - Uploads build artifacts

3. **Docker Build**
   - Builds complete Docker image
   - Verifies image runs correctly

4. **Deploy** (on main/master push)
   - Triggers Render.com deployment webhook
   - Automatic production deployment

### Pipeline Configuration

```yaml
on:
  push:
    branches: [main, master]
  pull_request:
    branches: [main, master]
```

---

## Reproducibility

### Complete Setup from Scratch

```bash
# 1. Clone repository
git clone <repository-url>
cd 04-habit-tracker

# 2. Install dependencies
npm run install:all

# 3. Start database
npm run db:start

# 4. Verify database is healthy
docker ps
# Should show: habit-tracker-db ... Up (healthy)

# 5. Run backend tests
cd server && npm test

# 6. Run frontend tests
cd ../client && npm test -- --run

# 7. Start development servers
cd .. && npm run dev

# 8. Access application
# Open http://localhost:5173 in browser
```

### Docker-Only Setup

```bash
# Single command to run everything
docker-compose up -d --build

# Verify services
docker-compose ps

# Access at http://localhost:3002
```

### Troubleshooting

| Issue | Solution |
|-------|----------|
| Database connection failed | Ensure Docker is running: `docker ps` |
| Port already in use | Change ports in `.env` or `docker-compose.yml` |
| Tests fail with timeout | Increase timeout in `jest.config.js` |
| Frontend can't reach API | Check `VITE_API_URL` in `client/.env` |

---

## License

MIT License - see LICENSE file for details.

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request
