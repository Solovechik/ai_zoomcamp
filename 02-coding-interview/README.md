# Real-Time Coding Interview Platform

A collaborative coding interview platform with real-time editing, Python execution in the browser, and session persistence.

## Quick Start

### Option 1: Docker (Recommended for Production)

```bash
# Build and start all services (PostgreSQL + App)
docker-compose up -d --build

# Access the application at http://localhost:3001
```

**📖 For detailed Docker deployment instructions, see [DOCKER.md](./DOCKER.md)**

### Option 2: Local Development

```bash
# 1. Start PostgreSQL
docker-compose up -d postgres

# 2. Start Backend (Terminal 1)
cd server
npm install
npm run dev

# 3. Start Frontend (Terminal 2)
cd client
npm install
npm run dev

# 4. Open browser
# Navigate to http://localhost:5173
# Click "Create New Session" and start coding!
```

## Features

- **Real-time Collaborative Editing**: Multiple users can edit code simultaneously with instant updates
- **Multi-Language Support**: Switch between Python and JavaScript with live syntax highlighting
- **Browser-based Code Execution**:
  - Python: Run safely using Pyodide (WebAssembly)
  - JavaScript: Native execution with console output capture
- **Session Persistence**: All sessions are saved to PostgreSQL database
- **Anonymous Access**: No signup required - just share the link
- **Participant Tracking**: See how many users are in the session
- **Shareable Links**: Easy-to-share session URLs
- **Language Synchronization**: When one user switches languages, all participants see the change

## Tech Stack

### Frontend
- React 19
- Vite
- Monaco Editor (@monaco-editor/react)
- Socket.io Client
- Pyodide (Python in WebAssembly)
- React Router
- Axios

### Backend
- Node.js + Express
- Socket.io
- PostgreSQL
- nanoid (session ID generation)

## Prerequisites

- Node.js 18+
- Docker and Docker Compose (for PostgreSQL)
- npm or yarn

## Installation & Setup

### 1. Start PostgreSQL Database

```bash
# From the project root
docker-compose up -d
```

This will start PostgreSQL on port 5432 with the database `coding_interview`.

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Run Database Migration

The migration will run automatically when PostgreSQL starts (via Docker Compose).
Alternatively, you can run it manually:

```bash
cd server
npm run migrate
```

### 4. Start Backend Server

```bash
cd server
npm run dev
```

The backend will start on `http://localhost:3001`

### 5. Install Frontend Dependencies

```bash
cd client
npm install
```

### 6. Start Frontend Development Server

```bash
cd client
npm run dev
```

The frontend will start on `http://localhost:5173`

## Usage

1. Open `http://localhost:5173` in your browser
2. Click "Create New Session"
3. Share the session URL with others
4. Start coding together in real-time!
5. Switch between Python and JavaScript using the language selector
6. Click "Run Code" to execute code in the browser
   - Python code runs via Pyodide (WebAssembly)
   - JavaScript code runs natively with console output capture

## Project Structure

```
02-coding-interview/
├── client/                    # Frontend (React + Vite)
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── CodeEditor.jsx
│   │   │   ├── ExecutionPanel.jsx
│   │   │   ├── SessionHeader.jsx
│   │   │   └── LanguageSelector.jsx
│   │   ├── hooks/            # Custom React hooks
│   │   │   ├── useSocket.js
│   │   │   └── usePyodide.js
│   │   ├── services/         # API and Socket.io services
│   │   │   ├── api.js
│   │   │   ├── socket.js
│   │   │   └── jsExecutor.js
│   │   ├── pages/            # Page components
│   │   │   ├── Home.jsx
│   │   │   └── Session.jsx
│   │   └── App.jsx
│   └── package.json
│
├── server/                    # Backend (Express + Socket.io)
│   ├── src/
│   │   ├── config/           # Configuration files
│   │   │   ├── database.js
│   │   │   └── socket.js
│   │   ├── models/           # Database models
│   │   │   └── Session.js
│   │   ├── routes/           # REST API routes
│   │   │   └── sessions.js
│   │   ├── controllers/      # Route controllers
│   │   │   └── sessionController.js
│   │   ├── socket/           # Socket.io handlers
│   │   │   ├── handlers.js
│   │   │   └── sessionManager.js
│   │   ├── utils/            # Utilities
│   │   │   └── sessionIdGenerator.js
│   │   └── app.js
│   ├── server.js
│   └── package.json
│
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql
│
├── docker-compose.yml
└── README.md
```

## API Endpoints

### REST API

- `POST /api/sessions` - Create a new session
- `GET /api/sessions/:id` - Get session by ID
- `PUT /api/sessions/:id/code` - Update session code
- `GET /api/sessions` - Get all sessions (admin)
- `DELETE /api/sessions/:id` - Delete a session

### WebSocket Events

#### Client → Server
- `join_session` - Join a coding session
- `code_change` - Broadcast code changes
- `execute_code` - Notify execution started
- `execution_result` - Share execution results
- `language_change` - Notify language switch (Python/JavaScript)

#### Server → Client
- `session_joined` - Confirmation with current code
- `code_update` - Remote code changes
- `participants_changed` - User joined/left
- `execution_started` - Code execution started
- `execution_result` - Execution output/error
- `language_changed` - Language switched by another user

## Environment Variables

### Backend (.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=coding_interview
DB_USER=devuser
DB_PASSWORD=devpass
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
VITE_SOCKET_URL=http://localhost:3001
```

## Development Workflow

### Backend Development
```bash
cd server
npm run dev  # Starts with nodemon for hot-reload
```

### Frontend Development
```bash
cd client
npm run dev  # Starts Vite dev server with hot-reload
```

### Database Management

**View Database**:
```bash
docker exec -it coding-interview-db psql -U devuser -d coding_interview
```

**Stop Database**:
```bash
docker-compose down
```

**Reset Database** (removes all data):
```bash
docker-compose down -v
docker-compose up -d
```

## Testing

### Automated Integration Tests

The project includes comprehensive integration tests that verify the interaction between client and server.

#### Running Tests

**Prerequisites**: Make sure the backend server and database are running.

```bash
# Terminal 1: Start PostgreSQL
docker-compose up -d

# Terminal 2: Start backend server
cd server
npm run dev

# Terminal 3: Run tests
cd server
npm test
```

#### Test Coverage

The integration tests cover:

1. **REST API Tests**
   - Session creation
   - Session retrieval
   - Code updates
   - Error handling (404s, invalid data)

2. **WebSocket Tests**
   - Client connections
   - Joining sessions
   - Real-time code synchronization
   - Execution event broadcasting
   - Participant tracking
   - Disconnection handling

3. **End-to-End Flow Tests**
   - Complete collaboration workflow
   - Multiple users editing simultaneously
   - Code persistence verification
   - Execution result broadcasting

4. **Stress Tests**
   - Rapid code changes (50 updates)
   - Multiple concurrent sessions (5 sessions, 10 users)
   - Debounced save verification

#### Running Specific Test Suites

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- integration.test.js

# Run tests matching pattern
npm test -- --testNamePattern="REST API"
```

#### Test Output Example

```
PASS  src/tests/integration.test.js (28.4 s)
  Integration Tests: REST API + WebSocket
    REST API - Session Management
      ✓ should create a new session (127 ms)
      ✓ should retrieve an existing session (45 ms)
      ✓ should return 404 for non-existent session (38 ms)
      ✓ should update session code (89 ms)
      ✓ should list all sessions (42 ms)
    WebSocket - Real-time Collaboration
      ✓ should connect two clients via WebSocket (156 ms)
      ✓ should allow users to join a session (234 ms)
      ✓ should broadcast code changes between users (178 ms)
      ✓ should broadcast execution events (267 ms)
      ✓ should handle user disconnect (143 ms)
      ✓ should reject invalid session ID (189 ms)
    End-to-End Flow
      ✓ should complete full collaboration workflow (3456 ms)
    Stress Tests
      ✓ should handle rapid code changes (3892 ms)
      ✓ should handle multiple concurrent sessions (4567 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
Snapshots:   0 total
Time:        28.455 s
```

### Manual Testing Steps

For manual UI testing:

1. **Create Session**: Open http://localhost:5173, click "Create New Session"
2. **Code Editing**: Type Python code in the Monaco editor
3. **Real-time Sync**: Open session link in another tab, verify instant code updates
4. **Code Execution**: Click "▶ Run Code", wait for Pyodide to load, verify output
5. **Multi-user**: Edit code in both tabs simultaneously, verify synchronization
6. **Participant Count**: Verify count updates when users join/leave
7. **Copy Link**: Test "Copy Link" button functionality
8. **Session Persistence**: Reload page, verify code persists

### Test Python Code Examples

**Simple Output**:
```python
print("Hello, World!")
```

**Fibonacci**:
```python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

for i in range(10):
    print(fibonacci(i))
```

**Error Handling**:
```python
# This should show an error
print(undefined_variable)
```

**List Comprehension**:
```python
squares = [x**2 for x in range(10)]
print(squares)
```

## Troubleshooting

### PostgreSQL Connection Issues
```bash
# Check if PostgreSQL is running
docker ps

# View logs
docker logs coding-interview-db

# Restart database
docker-compose restart
```

### Port Already in Use
```bash
# Kill process on port 3001 (backend)
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173 (frontend)
lsof -ti:5173 | xargs kill -9
```

### Pyodide Loading Issues
- Check browser console for errors
- Ensure internet connection (Pyodide loads from CDN)
- Try clearing browser cache

### Socket.io Connection Issues
- Check that backend is running on port 3001
- Verify CORS_ORIGIN in .env matches frontend URL
- Check browser console for Socket.io errors

## Production Deployment

### Option 1: Docker Deployment (Recommended)

The application is containerized with both frontend and backend in a single Docker image.

**Build and Run with Docker Compose:**
```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up -d --build app
```

**Docker Image Details:**
- **Base Image**: `node:20-alpine` (lightweight, production-ready)
- **Multi-stage Build**: Frontend built separately, then served by backend
- **Size**: ~150-200 MB (optimized)
- **Architecture**: Frontend static files served by Express from `/app/public`
- **Port**: 3001 (single port for entire application)

**Environment Configuration:**
```bash
# Copy and edit production environment
cp .env.production.example .env.production

# Update docker-compose.yml with secure values
# - Change DB_PASSWORD
# - Set CORS_ORIGIN if needed
```

**Health Checks:**
- Application: `http://localhost:3001/health`
- Database: PostgreSQL health check via `pg_isready`

### Option 2: Cloud Deployment

#### Deploy to Railway/Render
1. Push code to GitHub
2. Connect repository to Railway/Render
3. Set environment variables in platform UI
4. Deploy using the Dockerfile

#### Deploy Backend + Frontend Separately
**Backend:**
1. Set `NODE_ENV=production`
2. Use production PostgreSQL instance (Railway, Supabase, AWS RDS)
3. Update `CORS_ORIGIN` to production frontend URL
4. Deploy to Railway, Render, or Heroku

**Frontend:**
1. Build production bundle: `npm run build`
2. Deploy to Vercel, Netlify, or Cloudflare Pages
3. Update environment variables to production backend URL

## Future Enhancements

- [x] Multiple language support (Python, JavaScript) ✅
- [ ] Additional languages (Java, C++, Go)
- [ ] Video/audio chat integration
- [ ] Drawing board for system design
- [ ] Session history and replay
- [ ] Code templates
- [ ] AI-powered code suggestions
- [ ] User authentication
- [ ] Session analytics

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
