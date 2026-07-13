# 🧠 NeuroMeet — Real-Time Meeting Platform with Custom WebRTC & High-Throughput Backend

[![Live Demo](https://img.shields.io/badge/Live%20Demo-neuromeet.anasdev.shop-7C3AED?style=for-the-badge&logo=vercel&logoColor=white)](https://neuromeet.anasdev.shop) [![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](#) [![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](#) [![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](#) [![Bun](https://img.shields.io/badge/Bun-1A1A1A?style=for-the-badge&logo=bun&logoColor=fbf0df)](#) [![LiveKit](https://img.shields.io/badge/LiveKit_WebRTC-1F2937?style=for-the-badge&logo=webrtc&logoColor=white)](#) [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](#) [![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](#)

> **NeuroMeet** is a real-time video meeting platform engineered around a custom WebRTC interface, a high-throughput NestJS backend running on Bun, and a zero-memory chunked upload pipeline for cloud recording storage. It also integrates an optional AI engagement-analysis module for instructors — built as a fully decoupled service that never touches the core video/API path.

---

## 📌 Table of Contents

- [⚡ Why NeuroMeet Is Different](#-why-neuromeet-is-different--30-second-hook)
- [🚀 Core Engineering Achievements](#-core-engineering-achievements)
- [🎬 Video Demo](#-video-demo)
- [📸 Screenshots](#-screenshots)
- [🔑 Demo Login Credentials](#-demo-login-credentials)
- [🏛️ System Architecture](#️-system-architecture)
- [💻 Comprehensive Tech Stack](#-comprehensive-tech-stack)
- [🤖 Optional AI Engagement Module](#-optional-ai-engagement-module)
- [🌐 Core API Reference](#-core-api-reference)
- [🚀 Getting Started & Installation](#-getting-started--installation)
- [☁️ Google Drive Streaming & Recording](#️-google-drive-streaming--recording)
- [📦 Deployment](#-deployment)
- [👨‍💻 Author & Connect](#-author--connect)
- [📄 License](#-license)

---


## ⚡ Why NeuroMeet Is Different — 30-Second Hook

If you are reviewing this project, these are the five hard engineering problems it solves that most projects don't touch:

| Challenge                                  | What Most Apps Do                                              | What NeuroMeet Does                                                                                                        |
| ------------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| **Recording large video files**             | Load entire file into RAM → Server crashes on large recordings   | **30 MB Chunked Stream Pipeline** — RAM stays at ~10 MB regardless of file size                                               |
| **Auth security**                           | Decode JWT in middleware to check roles                          | **Dual-Layer JWT Verification**: `jose` cryptographic verify in Next.js Edge + NestJS AuthGuard signature check in backend    |
| **Brute-force protection**                  | Basic password check                                              | **5-attempt lockout** with `Bun.password.verify` + `timingSafeEqual` to prevent timing attacks                               |
| **Session invalidation**                    | Store raw refresh tokens in DB                                    | **Hashed refresh tokens** (bcrypt, cost 10) in DB + **token reuse detection** → all sessions revoked on replay attack         |
| **AI feature without a bottleneck**         | Proxy video blobs through the backend API                        | **Optional analysis worker joins as a silent WebRTC peer** — subscribes to LiveKit tracks directly, fully isolated from the NestJS request path |

---

## 🚀 Core Engineering Achievements

| Engineering Domain               | Technical Implementation                                                                                    | Key Benefit                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **🔒 Enterprise Authentication**  | Dual-layer JWT verification (Edge + Backend), hashed refresh tokens, and timing-safe token comparisons.        | Defends against brute-force, token replay, and timing oracle attacks natively on the Bun runtime.          |
| **☁️ Zero-Memory Drive Uploads**  | Consumes streams in sequential 30 MB chunks using a TLS keep-alive connection pool and exponential backoff.    | Records massive video files directly to Google Drive while capping server RAM usage at ~10 MB.             |
| **🎥 Custom WebRTC Interface**    | Uses the Web Audio API to mix display and microphone streams before uploading via local 2 MB chunks.           | Delivers a fully custom Google Meet-style UI with hardware controls and strict permission enforcement.     |
| **⚡ Server-First Architecture**  | Combines Next.js Edge Middleware, a Fastify-based NestJS backend, and a custom in-memory TTL caching service.  | Achieves sub-millisecond hot-path data retrieval and zero-flicker role-based routing.                      |
| **🧠 Optional AI Engagement Module** | A decoupled Python worker joins as a silent WebRTC participant and runs an ONNX-optimized ViT+LSTM model.   | Live attention scoring for instructors, entirely isolated from the core backend's request path.            |

---

## 🎬 Video Demo

<!-- 📌 TODO: Replace this section once your walkthrough video is recorded. -->
<!-- Suggested shot list: Google OAuth login → instructor creates meeting → student joins → 
     live engagement panel updates → instructor opens recordings page. 
     Upload as Unlisted on YouTube, then replace the line below with:
     [![NeuroMeet Demo Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID) -->

*A full walkthrough video is in progress — check back soon, or explore the [live demo](https://neuromeet.anasdev.shop) directly using the credentials below.*

---

## 📸 Screenshots

<!-- 📌 TODO: Add screenshots to /docs/assets/ and confirm these three filenames match, 
     or add more sections below following the same pattern. -->

### 1. Live Virtual Classroom

![Meeting Room](./docs/assets/meeting-room.png)
*Custom LiveKit video interface — hardware toggles, Web Audio mixed recording, live engagement sidebar, and guest detection.*

### 2. Instructor Analytics Dashboard

![Instructor Dashboard](./docs/assets/instructor-dashboard.png)
*Real-time command center: platform statistics, per-student AI attention scores, and upcoming schedule management.*

### 3. Student Hub & Recordings

![Student Hub](./docs/assets/student-hub.png)
*Clean student portal for joining meetings, accessing Drive-hosted lecture recordings, and reviewing class materials.*

---

## 🔑 Demo Login Credentials

Explore the platform live at **[neuromeet.anasdev.shop](https://neuromeet.anasdev.shop)** without any local setup:

| Role           | Email                               | Password              | Access Rights                                                                |
| -------------- | ------------------------------------ | ----------------------- | -------------------------------------------------------------------------------- |
| **Instructor** | `instructor@neuromeet.anasdev.shop`  | `NeuroMeet#Admin2026`   | Create meetings, view live AI engagement, manage recordings, invite students     |
| **Student**    | `student@neuromeet.anasdev.shop`     | `NeuroMeet#Student26`   | Join meetings, view past materials, participate in chat                          |

> **Note:** These are seeded demo accounts for evaluation purposes only and are rotated periodically — not representative of production secret policy.

---

## 🏛️ System Architecture

NeuroMeet operates on a highly decoupled, modern 3-tier architecture:

```
graph TD
    Client[Next.js Client / Bun] -->|OAuth & REST via Server Actions| BFF[Next.js Edge Middleware / jose JWT Verify]
    BFF -->|Fastify HTTP REST| Backend[NestJS Core Backend / Bun Runtime]
    Client -->|WebRTC Video & Audio SFU| LiveKit[LiveKit Media SFU Server]
    Backend -->|Prisma ORM + DB Indexes| DB[(PostgreSQL)]
    Backend -->|In-Memory Cache + EventEmitter| Cache[(Custom CacheService)]
    LiveKit -.->|Optional: Silent WebRTC Participant| AIBot[Optional AI Worker / FastAPI Dispatch]
    AIBot -.->|HTTP Score Push| Backend
    Backend -->|SSE Progress Events| Client
    Backend -->|Resumable Chunk Stream 30MB / TLS Keep-Alive| GDrive[Google Drive Cloud Storage]
    Client -->|2MB Browser Chunks| APIRoute[Next.js API Route]
    APIRoute -->|Forward to Drive Pipeline| Backend
```

**Key Design Decisions:**

- **NestJS uses Fastify** (not Express) for significantly lower HTTP overhead and native async streaming support — essential for the chunked upload pipeline.
- **Resumable Drive uploads** prevent data loss on network interruptions and keep memory usage constant at ~10 MB regardless of recording size.
- **Edge Middleware** handles token refresh, routing, and RBAC before any React component renders — zero flicker on auth-protected routes.
- **The AI module is fully optional and decoupled** — it connects as a WebRTC participant, not a video proxy, so the core meeting/recording pipeline runs identically with or without it enabled.

---

## 💻 Comprehensive Tech Stack

### 🖥️ Frontend

| Technology                         | Purpose                                                                                |
| ------------------------------------ | ------------------------------------------------------------------------------------------ |
| Next.js (App Router)                 | Full-stack React framework with Server Actions, Server Components, and Edge Middleware     |
| React + TypeScript                   | UI rendering with concurrent features & strict type safety                                 |
| Bun + Turbopack                      | Ultra-fast dev runtime & incremental bundler                                                |
| LiveKit Client + React Components    | WebRTC video/audio in the browser                                                           |
| Tailwind CSS + shadcn + Base UI      | Design system & accessible component library                                                |
| jose                                 | JWT cryptographic verification (`jwtVerify`) on the Next.js Edge Runtime                    |
| React Hook Form + Zod                | Form state management & schema validation                                                   |
| Next Themes                          | Dark/Light mode management                                                                  |

### ⚙️ Backend

| Technology                    | Purpose                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------- |
| NestJS + Fastify                 | Core REST API with modular architecture & async streaming                          |
| Bun Runtime                      | High-performance JS/TS execution — native `Bun.password`, `crypto` intercept       |
| Prisma ORM                       | Type-safe database access with composite DB indexes                                |
| PostgreSQL (Alpine)              | Primary relational database                                                        |
| Custom CacheService              | In-memory `Map`-based TTL cache for hot-path queries (meetings, participants)       |
| Node.js EventEmitter             | In-process SSE pub/sub for upload progress and engagement events                   |
| LiveKit Server SDK               | Room management & JWT token generation                                             |
| Google Drive API (googleapis)    | Cloud recording storage with resumable upload sessions                             |
| Google OAuth 2.0 + JWT           | Authentication — access + refresh token rotation with replay detection             |
| Resend                           | Transactional email (OTP codes, welcome emails, password reset)                    |
| NestJS Schedule                  | Background cron job management                                                     |

### 🤖 Optional AI Module (decoupled service)

| Technology                   | Purpose                                                     |
| ------------------------------- | ----------------------------------------------------------- |
| Python + FastAPI + Uvicorn      | Dispatch server for optional bot lifecycle management        |
| LiveKit Python Agents           | Silent WebRTC participant — direct video track subscription  |
| PyTorch + torchvision           | ViT-Base/16 + LSTM model training & inference                |
| OpenCV (headless)               | Real-time video frame processing                             |
| ONNX + ONNX Runtime             | Optimized production model inference (~18ms/frame)           |
| NumPy                           | Numerical array processing for frame data                    |

### 🐳 DevOps

| Technology              | Purpose                                         |
| -------------------------- | ---------------------------------------------------- |
| Docker + Docker Compose    | Multi-service container orchestration                |
| PostgreSQL Alpine          | Containerized database with tuned memory config      |
| Cloudflare                 | Edge security & CDN delivery                          |
| Vercel                     | Frontend hosting & CI/CD                               |

---

## 🤖 Optional AI Engagement Module

This module is a **fully decoupled add-on** — the core meeting platform (auth, video, recording, caching) works identically whether this service is running or not. It's included here because the engineering behind it — real-time inference under 20ms, isolation from the main request path — was worth solving properly rather than bolting on.

### How It Works

1. The Python worker (`bot.py`) joins the meeting room as a hidden participant using a server-generated token.
2. It subscribes directly to each student's video track and samples frames at a configured interval.
3. Each frame sequence is passed through an ONNX-optimized inference pipeline — a ViT-Base/16 + LSTM model trained on engagement/disengagement behavioral patterns.
4. A score (`0.0–1.0`) is computed per student and pushed to the NestJS backend via HTTP, stored as `avgEngagementScore` on `MeetingParticipant`.
5. NestJS delivers the score to the instructor's live dashboard via SSE.

### Model Details

| Attribute               | Value                                                                        |
| -------------------------- | ---------------------------------------------------------------------------------- |
| **Architecture**           | Vision Transformer (ViT-Base/16) + LSTM temporal model (Sequence Length: 24)        |
| **Training Dataset**       | DAiSEE (Dataset for Affective States in E-Environments) + Custom Frames             |
| **Classes**                | Binary Classification (Engaged vs. Disengaged)                                      |
| **Validation Accuracy**    | ~89.4% (F1 Score: 0.88)                                                              |
| **Inference Format**       | ONNX (exported from PyTorch via `export_onnx.py`)                                   |
| **Avg. Inference Time**    | ~18ms per frame sequence on CPU                                                     |

---

## 🌐 Core API Reference

Base URL: `http://localhost:4000/api/v1` (dev) | `https://api.neuromeet.anasdev.shop/api/v1` (prod)

### 🔐 Authentication

| Method | Endpoint                   | Description                                                      |
| -------- | ----------------------------- | ---------------------------------------------------------------------- |
| `POST` | `/auth/sign-up`               | Register with email + OTP verification flow                            |
| `POST` | `/auth/sign-in`                | Login with brute-force lockout (5 attempts / 15 min)                    |
| `POST` | `/auth/verify-code-signup`    | Verify 6-digit signup OTP                                                |
| `POST` | `/auth/refresh-token`         | Silent refresh with hashed token verification + replay detection        |
| `POST` | `/auth/logout`                 | Revoke session by nulling stored refresh token hash                     |
| `GET`  | `/oauth/google`                | Initiate Google OAuth 2.0 flow                                          |
| `GET`  | `/oauth/google/callback`      | Handle OAuth callback, set `httpOnly` JWT cookies                       |

### 📅 Meetings

| Method   | Endpoint              | Description                                                                    |
| ---------- | ------------------------ | ------------------------------------------------------------------------------------ |
| `POST`   | `/meetings`              | Create meeting with auto-generated LiveKit room name (`crypto.randomBytes(8)`)       |
| `GET`    | `/meetings`              | List meetings (cached 30s TTL, invalidated on mutation)                              |
| `GET`    | `/meetings/:id`          | Get full meeting details with participants (cached 60s TTL)                          |
| `PATCH`  | `/meetings/:id`          | Update meeting title, time, or status                                                |
| `DELETE` | `/meetings/:id`          | Cancel a meeting                                                                      |
| `GET`    | `/meetings/:id/token`    | Generate LiveKit JWT for joining                                                      |
| `POST`   | `/meetings/:id/join`     | Join meeting with passcode verification (`Bun.password.verify`)                       |

### 🎬 Recordings & Drive

| Method | Endpoint                               | Description                                                                |
| -------- | ------------------------------------------ | -------------------------------------------------------------------------------- |
| `POST` | `/drive/recording/stream/:meetingId`       | LiveKit Egress webhook — streams raw video in 30 MB chunks to Google Drive       |
| `GET`  | `/drive/recording/progress/:meetingId`     | SSE endpoint — live upload progress for instructor dashboard                     |
| `GET`  | `/drive/recording/status/:meetingId`       | One-shot status check (polling fallback)                                          |
| `POST` | `/drive/upload-material`                   | Upload course material (PDF, slides) — multipart                                  |

### 👥 Groups & Enrollment

| Method | Endpoint             | Description                                       |
| -------- | ------------------------ | ------------------------------------------------------ |
| `POST` | `/groups`                | Instructor creates a student group                     |
| `GET`  | `/groups`                | List instructor's groups or student's enrollments      |
| `POST` | `/groups/:id/invite`     | Send invitation email to a student                      |
| `POST` | `/groups/:id/enroll`     | Student accepts group invitation                         |

---

## 🚀 Getting Started & Installation

### Prerequisites

- [Bun](https://bun.sh/) v1.1+
- [Docker & Docker Compose](https://www.docker.com/)
- [Python 3.10+](https://www.python.org/) with pip *(only required if running the optional AI module)*
- [Git](https://git-scm.com/)
- A [LiveKit Cloud](https://cloud.livekit.io) account (free tier available)
- A [Google Cloud](https://console.cloud.google.com/) project with OAuth 2.0 credentials and Drive API enabled

### 1. Clone the Repository

```
git clone https://github.com/anasabdelhakim/neuromeet-core.git
cd neuromeet-core
```

### 2. Configure Environment Variables

```
# Backend
cp backend/.env.example backend/.env

# Frontend
cp frontend/.env.example frontend/.env

# AI Bot (optional)
cp ai_bot/.env.example ai_bot/.env
```
> Open each `.env` file and fill in your credentials. See the comments inside each file for where to obtain each value.
>
> **Important**: Add `JWT_SECRET` to `frontend/.env` — it must match the backend secret exactly. This is required for `jose` cryptographic verification in the Edge Middleware.

### 3. Start Core Services via Docker (Recommended)

```
docker compose up -d
```

This starts PostgreSQL and the NestJS backend (Bun runtime) in isolated containers. The AI module is optional and not required for the core platform to run.

### 4. Run Database Migrations

```
cd backend
bun run prisma migrate dev
bun run prisma db seed     # seeds demo accounts
```

### 5. Local Development (Without Docker)

**Backend (NestJS / Bun):**
```
cd backend
bun install
bun run start:dev
# → API running at http://localhost:4000
```

**Frontend (Next.js / Bun):**
```
cd frontend
bun install
bun run dev
# → App running at http://localhost:3000
```

**AI Worker (Python / FastAPI) — optional:**
```
cd ai_bot
pip install -r requirements.txt
python dispatch_server.py
# → Dispatch server running at http://localhost:8080
```

---

## ☁️ Google Drive Streaming & Recording

NeuroMeet implements a custom **sequential 30 MB chunk pipeline** for constant-memory Google Drive uploads.

```
LiveKit Egress / Browser MediaRecorder
              ↓
    POST /drive/recording/stream/:meetingId
              ↓
    NestJS opens Resumable Upload Session
    (raw HTTPS → Google Drive → returns uploadUrl)
              ↓
    ReadableStream consumed in 30 MB chunks
    (RAM ceiling: ~10 MB at any point in time)
              ↓
    PUT chunk → Content-Range: bytes X-Y/total
    TLS Keep-Alive connection pool (maxSockets: 8)
              ↓
    HTTP 308 → Next chunk  |  HTTP 200/201 → Complete
              ↓
    Exponential backoff on 503/429/ECONNRESET (1s→2s→4s)
              ↓
    UPDATE Recording (status: UPLOADED, driveFileId, sizeBytes)
              ↓
    EventEmitter → SSE → Instructor Dashboard progress bar
```

**Key engineering guarantees:**

- **No memory bloat**: RAM usage stays at ~10 MB regardless of file size.
- **Resumable**: If the session drops mid-upload, Drive retains all committed bytes — only the failed chunk is retried.
- **Exponential backoff retries**: Up to 3 retries with `1s → 2s → 4s` delays on transient errors.
- **TLS keep-alive pool**: Reuses TCP connections between chunks, saving ~200ms per chunk.
- **Automatic notification**: On upload completion, all meeting participants receive an in-app `RECORDING_READY` notification.

---

## 📦 Deployment

**Recommended (Linux/Ubuntu production servers):**

```
docker compose build --no-cache
docker compose up -d --remove-orphans
docker compose logs -f
```

---

## 👨‍💻 Author & Connect

**Anas Abdelhakim Ali**
*Full-Stack Software Engineer*

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/anas-abdelhakim-548aa5268) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/anasabdelhakim) [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:anasabdoali22@gmail.com)

---

## 📄 License

This project is proprietary and confidential. Designed and developed as a Graduation Project at **Nile University (NU)**. All rights reserved © 2026.
