# ft_transcendence

A full-stack multiplayer Pong web application built as a Single Page Application. Players can compete in real-time matches (2-player and 4-player modes), participate in tournaments, chat with friends, and track their stats -- all served over HTTPS with WebSocket-powered real-time communication.

This is a [42 School](https://42.fr/) project.

## Team

| Member   | GitHub                                   |
| -------- | ---------------------------------------- |
| jramondo | [@jramondo](https://github.com/JacquesNethow) |
| kmatos-s | [@kmatos-s](https://github.com/kaio-matos) |
| macarval | [@macarval](https://github.com/MayaraMCarvalho) |
| matcardo | [@matcardo](https://github.com/EngMateusCardoso) |
| thabeck- | [@thabeck-](https://github.com/Thayhabeck) |

## Tech Stack

| Layer            | Technology                                             |
| ---------------- | ------------------------------------------------------ |
| Backend          | Django 4.2 (Python)                                    |
| Real-time        | Django Channels 3.0.4 (WebSockets)                     |
| Frontend         | Vanilla JavaScript (ES Modules), Custom Web Components |
| Game Rendering   | HTML5 Canvas 2D                                        |
| Database         | PostgreSQL                                             |
| Message Broker   | Redis (Channels layer)                                 |
| Reverse Proxy    | Nginx (Alpine) with TLS termination                    |
| CSS Framework    | Bootstrap 5.3.3 (dark theme)                           |
| Containerization | Docker Compose (4 services)                            |

## Architecture

```
                    ┌────────────┐
                    │   Client   │
                    │  (Browser) │
                    └─────┬──────┘
                          │ HTTPS / WSS
                    ┌─────▼──────┐
                    │   Nginx    │
                    │  (TLS 1.2+ │
                    │   proxy)   │
                    └─────┬──────┘
                          │
                    ┌─────▼──────┐       ┌───────────┐
                    │   Django   │◄─────►│   Redis   │
                    │  Channels  │       │ (channel  │
                    │  (ASGI)    │       │   layer)  │
                    └─────┬──────┘       └───────────┘
                          │
                    ┌─────▼──────┐
                    │ PostgreSQL │
                    └────────────┘
```

**Backend:** Django serves a single HTML page and exposes a REST API under `/api/pong/`. The ASGI server handles both HTTP requests and WebSocket connections. The game engine runs server-side in dedicated threads (~60fps per match), broadcasting state to clients via WebSocket.

**Frontend:** A custom SPA built with vanilla JavaScript ES modules and Web Components. Routing is handled via `history.pushState` with Back/Forward button support. The Pong game is rendered on an HTML5 Canvas using a percentage-based coordinate system (VCW/VCH units). All UI components use Shadow DOM with Bootstrap injected per component.

**WebSocket Channels:**

| Endpoint         | Purpose                                                        |
| ---------------- | -------------------------------------------------------------- |
| `/ws/player/`    | Player notifications (match/tournament invites, friend status) |
| `/ws/chat/<id>`  | Real-time chat messaging                                       |
| `/ws/match/<id>` | Game state updates and player input                            |

## Features

### Pong Game

- Server-authoritative game engine running at ~60fps in a dedicated thread per match
- 2-player mode (left/right paddles) and 4-player mode (all four sides)
- Local multiplayer on the same keyboard (Arrow keys + WASD)
- Remote multiplayer via WebSocket with real-time state synchronization
- Ball physics with angle-based paddle collision (normalized intersection point)
- First to 5 points wins
- Canvas-based rendering with real-time score display and player info panels

### Tournaments

- 4-player single-elimination bracket (2 semi-finals + 1 final)
- Auto-generated binary match tree with sequential progression
- Accept/reject invitation flow for all participants
- Champion tracking and tournament history

### Matchmaking

- Automatic opponent finding among online players (prioritizes non-friends)
- Manual match creation with player selection (online/local, 2 or 4 players)
- Accept/reject confirmation flow with real-time notifications

### User Management

- Registration with name, email, and password (server-side validation)
- Session-based authentication (Django sessions)
- Player profiles with editable name and avatar (JPEG upload)
- Player statistics: total score, total play time
- Match and tournament history with win/loss tracking

### Friends & Social

- Add friends by email
- Real-time online/offline status via WebSocket
- Direct challenge (create a 1v1 match from friends list)
- View friend profiles

### Live Chat

- Private messaging between friends (auto-created on friend add)
- Real-time message delivery via WebSocket
- Block/unblock contacts (suppresses message delivery)
- Auto-scrolling message list with sent/received styling

### Security

- HTTPS enforced via Nginx with TLS 1.2/1.3
- WebSocket Secure (WSS) for all real-time connections
- Passwords hashed with Django's PBKDF2
- Django ORM for SQL injection protection
- Server-side form validation on all endpoints
- UUID-based public identifiers (no sequential IDs exposed)
- XFrameOptions middleware for clickjacking protection

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Setup

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd 42_ft__transcendence
   ```

2. Create the environment file:

   ```bash
   cp .env.example .env
   ```

3. Build and start all services:

   ```bash
   docker compose up --build
   ```

   Or using the Makefile:

   ```bash
   make all
   ```

4. Open your browser and navigate to:

   ```
   https://localhost
   ```

   > The application uses a self-signed SSL certificate generated at startup. You will need to accept the browser security warning on first access.

### Environment Variables

| Variable            | Description                   | Default              |
| ------------------- | ----------------------------- | -------------------- |
| `API_SECRET_KEY`    | Django secret key             | _(see .env.example)_ |
| `API_PORT`          | Django server port            | `8000`               |
| `API_ALLOWED_HOSTS` | Comma-separated allowed hosts | `localhost`          |
| `API_DEBUG`         | Django debug mode             | `true`               |
| `DATABASE_NAME`     | PostgreSQL database name      | `pong`               |
| `DATABASE_HOST`     | PostgreSQL host               | `db`                 |
| `DATABASE_USER`     | PostgreSQL user               | `pong`               |
| `DATABASE_PASS`     | PostgreSQL password           | `password`           |
| `DATABASE_PORT`     | PostgreSQL port               | `5432`               |
| `REDIS_HOST`        | Redis host                    | `redis`              |
| `REDIS_PORT`        | Redis port                    | `6379`               |

### Useful Commands

```bash
# Run database migrations
docker compose exec api python manage.py migrate

# Create new migrations after model changes
docker compose exec api python manage.py makemigrations pong

# Reset the database
docker compose exec api python manage.py flush

# Open Django shell
docker compose exec api python manage.py shell
```

## API Reference

### Player

| Method | Endpoint                       | Description                              |
| ------ | ------------------------------ | ---------------------------------------- |
| `GET`  | `/api/pong/player`             | List players (filter by activity status) |
| `POST` | `/api/pong/player/create`      | Register a new player                    |
| `POST` | `/api/pong/player/login`       | Authenticate (email + password)          |
| `POST` | `/api/pong/player/logout`      | End session                              |
| `PUT`  | `/api/pong/player/update`      | Update player name                       |
| `POST` | `/api/pong/player/avatar`      | Upload avatar image                      |
| `GET`  | `/api/pong/player/friends`     | Get friends list                         |
| `POST` | `/api/pong/player/friends/add` | Add friend by email                      |
| `GET`  | `/api/pong/player/<public_id>` | Get player profile                       |

### Match

| Method | Endpoint                      | Description                         |
| ------ | ----------------------------- | ----------------------------------- |
| `GET`  | `/api/pong/match`             | List matches for a player           |
| `GET`  | `/api/pong/match/matchmaking` | Auto-find opponent and create match |
| `POST` | `/api/pong/match/create`      | Create a custom match               |
| `GET`  | `/api/pong/match/get`         | Get current active match            |
| `GET`  | `/api/pong/match/accept`      | Accept a match invitation           |
| `GET`  | `/api/pong/match/reject`      | Reject a match invitation           |

### Tournament

| Method | Endpoint                      | Description                     |
| ------ | ----------------------------- | ------------------------------- |
| `GET`  | `/api/pong/tournament`        | List tournaments for a player   |
| `POST` | `/api/pong/tournament/create` | Create a tournament (4 players) |
| `GET`  | `/api/pong/tournament/get`    | Get current active tournament   |
| `GET`  | `/api/pong/tournament/accept` | Accept a tournament invitation  |
| `GET`  | `/api/pong/tournament/reject` | Reject a tournament invitation  |

### Chat

| Method | Endpoint                      | Description                   |
| ------ | ----------------------------- | ----------------------------- |
| `GET`  | `/api/pong/chat`              | List all chats                |
| `POST` | `/api/pong/chat/create`       | Create a chat room            |
| `POST` | `/api/pong/chat/<id>/message` | Send a message                |
| `GET`  | `/api/pong/chat/block/<id>`   | Block a chat                  |
| `GET`  | `/api/pong/chat/unblock/<id>` | Unblock a chat                |
| `GET`  | `/api/pong/chat/<id>`         | Get chat details and messages |

## Project Structure

```
.
├── .docker/
│   ├── api/
│   │   ├── Dockerfile              # Python container build
│   │   └── entrypoint.sh           # SSL cert generation, migrations, server start
│   └── nginx/
│       └── nginx.conf              # TLS termination, WebSocket proxy, static files
├── backend/
│   ├── ft_transcendence/           # Django project configuration
│   │   ├── settings.py             # Database, Redis, Channels, middleware config
│   │   ├── urls.py                 # Root URL routing (API + SPA catch-all)
│   │   ├── asgi.py                 # ASGI entry (HTTP + WebSocket routing)
│   │   └── http/                   # Custom HTTP/WS response helpers
│   ├── pong/                       # Main Django application
│   │   ├── models/                 # Player, Match, Tournament, Chat, Message
│   │   ├── controllers/            # Request handlers (Player, Match, Tournament, Chat)
│   │   ├── communication/          # WebSocket consumers (Player, Match, Chat)
│   │   ├── game/                   # Server-side Pong engine (game loop, ball, paddle, physics)
│   │   ├── forms/                  # Input validation (Django Forms)
│   │   ├── resources/              # Response serialization helpers
│   │   ├── factories/              # Test data generation
│   │   ├── urls.py                 # REST API route definitions
│   │   └── routing.py              # WebSocket route definitions
│   ├── templates/
│   │   └── index.html              # SPA entry point (single HTML page)
│   ├── static/
│   │   ├── css/styles.css          # Custom styles
│   │   └── js/                     # Frontend SPA
│   │       ├── index.mjs           # App entry, route definitions, auth guards
│   │       ├── router/             # Custom SPA router with EventBus
│   │       ├── components/         # Web Components (Button, Input, Modal, Chat, PongCanvas...)
│   │       ├── pages/              # Page modules (Login, Register, Home, Game, Profile)
│   │       ├── services/           # REST API client layer
│   │       ├── communication/      # WebSocket client layer
│   │       ├── state/              # Session management (localStorage)
│   │       └── utils/              # EventBus pub/sub system
│   └── media/                      # User uploads and default assets
├── docker-compose.yml              # 4 services: api, db, redis, nginx
├── Makefile                        # Build and git workflow automation
├── .env.example                    # Environment variable template
└── docs/
    └── migrations.md               # Database migration commands
```

## Requirements Checklist

### Minimal Requirements

- [x] Website is a single-page application. The user is able to use the Back and Forward buttons of the browser.
- [x] Website is compatible with the latest stable version of Google Chrome.
- [x] The user encounters no unhandled errors and no warnings when browsing the website.
- [x] Everything is launched with a single command line using Docker. (`docker compose up --build`)
- [x] Users have the ability to participate in a live Pong game against another player directly on the website. Both players can use the same keyboard. The Remote players module enhances this with remote play.
- [x] A player can play against another player, and it is also possible to propose a tournament. The tournament consists of multiple players who take turns playing against each other, with clear display of matchups and player order.
- [x] A registration system is implemented: players input their alias name. Standard User Management module is used for persistent accounts.
- [x] There is a matchmaking system: the tournament system organizes the matchmaking of the participants and announces the next fight.
- [x] All players adhere to the same rules, including identical paddle speed. The server-side game engine enforces this uniformly.
- [x] The game is developed with vanilla JavaScript and HTML5 Canvas, capturing the essence of the original Pong (1972).
- [x] Passwords stored in the database are hashed (Django PBKDF2).
- [x] Website is protected against SQL injections/XSS (Django ORM, server-side form validation).
- [x] HTTPS connection is enabled for all aspects, including WSS for WebSockets.
- [x] Form validation and user input validation is implemented on the server side.

### Modules

**Major Modules:**

- [x] Use a Framework as backend. _(Django 4.2)_
- [ ] Implement Two-Factor Authentication (2FA) and JWT.
- [x] Standard user management, authentication, users across tournaments.
- [x] Replacing Basic Pong with Server-Side Pong and Implementing an API.
- [x] Multiplayers (more than 2 in the same game). _(4-player mode with TOP/BOTTOM/LEFT/RIGHT placements)_
- [x] Remote players. _(WebSocket-based real-time multiplayer)_
- [x] Live chat. _(Private messaging with real-time delivery via WebSocket, block/unblock)_

**Minor Modules:**

- [x] Support on all devices. _(Bootstrap 5.3.3 responsive design)_
- [ ] Multiple language supports.
- [ ] Expanding Browser Compatibility.
- [x] Use a database for the backend. _(PostgreSQL)_
- [ ] Implementing a remote authentication. _(OAuth/SSO)_
