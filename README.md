# Articul8

A scalable **blog application** built with a **microservices architecture**. It uses **RabbitMQ** for inter‑service events, **Redis** for caching with smart invalidation, **PostgreSQL + MongoDB** for optimized data access patterns, **Google OAuth 2.0** for authentication, and **Docker** for containerization. Services can be deployed on **AWS EC2** (or any VM/containers), and the **Next.js** frontend can be hosted on **Vercel**.

> This repository is a monorepo that contains the frontend and all backend services. Directory names and exact service names may vary; check `/services` and `/frontend` for the current layout.

---

## ✨ Features
- **Microservices**: Independent services for auth, users, posts, comments, etc., communicating via **RabbitMQ** (pub/sub & event‑driven patterns).
- **Polyglot persistence**: **PostgreSQL** for relational/transactional data and **MongoDB** for document/aggregated views.
- **Caching**: **Redis** with **event‑based invalidation** to keep API responses fast and fresh.
- **Auth**: **Google OAuth 2.0** (OpenID Connect) with secure session handling / JWTs (depending on service choice).
- **API Gateway** (or BFF): A single entry point for the frontend, request fan‑out to services.
- **Observability ready**: Structured logs; easy to add metrics/tracing.
- **Dockerized**: Services, databases, and brokers wired via `docker-compose` for local dev.
- **Cloud friendly**: Deploy services to **AWS EC2** (or ECS/Kubernetes); deploy **Next.js** to **Vercel**.

---

## 🧭 Architecture (high‑level)
```
+-------------------+           +--------------------+
|     Next.js       |  HTTPS    |    API Gateway     |
|  (Vercel/Edge)    +---------->+  (REST/GraphQL)    +-----+
+---------+---------+           +---------+----------+     |
          ^                               |                |
          | SSR/CSR                        | REST gRPC     |
          |                                v                v
          |                       +--------+---------+  +---+-----------------+
          |                       |   Auth Service   |  |   Content Services  |
          |                       | (Google OAuth2)  |  | (Posts/Comments/...)|
          |                       +--------+---------+  +---+-----------------+
          |                                |                |
          |                                | events         | events
          |                                v                v
          |                      +---------+-----------------+
          |                      |         RabbitMQ          |
          |                      +---------+-----------------+
          |                                |                |
          |                                |                |
          |                           cache invalidation     |
          |                                |                |
          |                                v                v
          |                       +--------+-----+   +------+--------+
          +-----------------------+   Redis      |   |  PostgreSQL   |
                                      (cache)        |  & MongoDB    |
                                      +--------------+---------------+
```

---

## 📂 Monorepo layout
```
/ Articul8
├─ frontend/               # Next.js app (App Router/Pages Router)
└─ services/               # All backend services
   ├─ auth-service/        # Google OAuth 2.0 login, JWT/session issuance
   ├─ posts-service/       # Create/read/update/delete posts (PostgreSQL or MongoDB)
   ├─ comments-service/    # Comments and replies
   ├─ users-service/       # Profile / follow relationships
   ├─ gateway/             # API gateway / BFF (ingress for the frontend)
   ├─ common/              # Shared libs/types (if present)
   └─ ...                  # Any additional services
```
> Service names can differ—use the `/services` folder as the source of truth.

---

## 🧰 Tech Stack
- **Frontend**: Next.js (React), TypeScript
- **Backend**: Node.js (TypeScript/Express or Fastify), event‑driven via RabbitMQ
- **Datastores**: PostgreSQL, MongoDB
- **Cache**: Redis
- **Auth**: Google OAuth 2.0 (OpenID Connect)
- **Containerization**: Docker + docker‑compose
- **Cloud**: AWS EC2 (services), Vercel (frontend)
- **CI/CD**: GitHub Actions (example provided below—adapt as needed)

---

## 🚀 Quick start (local, Docker)

### 1) Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)
- Node.js 18+ and pnpm/npm/yarn (for local builds)
- Google OAuth client credentials (for auth service)

### 2) Clone
```bash
git clone https://github.com/rajayush16/Articul8.git
cd Articul8
```

### 3) Environment variables
Create a `.env` (or per‑service `.env`) with values for each service. **Examples** (rename to match your services):

**`/services/auth-service/.env`**
```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OAUTH_REDIRECT_URI=http://localhost:3000/api/auth/callback
JWT_SECRET=supersecret
SESSION_SECRET=anothersecret
RABBITMQ_URL=amqp://rabbitmq:5672
REDIS_URL=redis://redis:6379
POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/articul8
MONGO_URL=mongodb://mongo:27017/articul8
```

**`/services/posts-service/.env`**
```
RABBITMQ_URL=amqp://rabbitmq:5672
REDIS_URL=redis://redis:6379
POSTGRES_URL=postgresql://postgres:postgres@postgres:5432/articul8
MONGO_URL=mongodb://mongo:27017/articul8
PORT=4001
```

**`/frontend/.env.local`**
```
NEXT_PUBLIC_API_BASE=http://localhost:8080
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

> Adjust variable names/ports to match actual service configs. If a service uses Prisma/TypeORM/Mongoose, also provide those URLs.

### 4) Start the stack
If the repo contains a root `docker-compose.yml`, simply run:
```bash
docker compose up --build
```
If compose files live inside folders, start the infra first, then services, for example:
```bash
# infra
docker compose -f docker/docker-compose.infra.yml up -d

# services
docker compose -f services/docker-compose.services.yml up --build

# frontend (local dev)
cd frontend && pnpm i && pnpm dev  # or npm/yarn
```

### 5) Access the app
- Frontend: `http://localhost:3000`
- Gateway/API: `http://localhost:8080`
- RabbitMQ Management (if exposed): `http://localhost:15672`
- Redis CLI (in container): `docker exec -it redis redis-cli`
- PostgreSQL: `localhost:5432`  |  MongoDB: `localhost:27017`

---

## 📨 Eventing & Cache Invalidation
- Services publish domain events to **RabbitMQ** (e.g., `post.created`, `post.updated`, `comment.created`).
- **Redis** stores popular/read‑heavy responses (e.g., post lists, timelines). On relevant events, cache keys are **invalidated** to keep data consistent.
- Suggested cache keying:
  - `post:{id}` for single resource reads
  - `feed:user:{id}:page:{n}` for timelines/feeds

---

## 🔐 Authentication (Google OAuth 2.0)
- Frontend initiates Google login → **Auth Service** exchanges code for tokens → issues app session/JWT.
- `id_token` claims are validated; refresh token handling recommended where applicable.
- Gateway uses JWT/session to authorize downstream requests.

---

## 🧪 Testing (suggested)
- Unit tests per service (Vitest/Jest)
- Contract tests for message payloads (e.g., using JSON Schemas)
- Integration tests with docker‑compose

---

## 📦 Deployment
### Backend (AWS EC2 example)
1. Provision a VPC + EC2 instance(s) (Ubuntu 22.04+).
2. Install Docker Engine & Compose; open required security‑group ports.
3. Create `.env` files on each instance (or use SSM Parameter Store/Secrets Manager).
4. Pull images from GHCR/Docker Hub; `docker compose up -d`.
5. Put Nginx/ALB in front of gateway; enable HTTPS (Let’s Encrypt/ACM).

### Frontend (Vercel)
1. Import `frontend` into Vercel.
2. Add env vars (`NEXT_PUBLIC_API_BASE`, OAuth client id, etc.).
3. Set build command (`pnpm build`/`next build`) and output.

---

## 🛠️ Useful scripts (examples)
```json
// package.json (root or per service)
{
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc -p .",
    "start": "node dist/index.js",
    "lint": "eslint .",
    "test": "vitest run"
  }
}
```

---

## 📑 API (illustrative)
```
GET    /api/posts                 # list posts (cached)
POST   /api/posts                 # create post (auth)
GET    /api/posts/:id             # get post by id (cached)
POST   /api/posts/:id/comments    # add comment (auth)
GET    /api/users/:id             # profile
GET    /api/me                    # current user (auth)
```
> See the gateway/service routes for the actual API.

---

## 🗺️ Roadmap ideas
- Rate limiting per route/user
- Background workers for heavy tasks (image processing, feeds)
- Full text search (Postgres `tsvector` or Meili/Elastic)
- Metrics/Tracing (OpenTelemetry + Prometheus/Grafana)
- CI/CD per‑service builds (path filters)

---

## 🤝 Contributing
1. Fork the repo and create a feature branch
2. Make your changes with tests
3. Ensure `lint` and `test` pass
4. Open a PR with a clear description

---

## 📝 License
MIT License © 2025 [Ayush Raj](https://github.com/rajayush16)

---

## 🙏 Acknowledgments
- Inspired by common microservice patterns: event‑driven architecture, polyglot persistence, and BFF gateways.

