# 📚 NeuroMeet — Study Reference Index

This folder contains your personal reference docs to study NeuroMeet without vibe coding.
Each file explains every dependency: what it is, why it exists, how it's used in THIS project, and where to learn it.

---

## 📂 Files

| File | What's inside |
|---|---|
| [auth-reverse-engineering-guide.md](./auth-reverse-engineering-guide.md) | **Step-by-step master breakdown** of the Authentication system (7-link learning chain, architecture pillars, Q&A) |
| [frontend-dependencies.md](./frontend-dependencies.md) | All 20+ frontend packages: Next.js, React, Tailwind, Zod, LiveKit, SWR, jose, etc. |
| [backend-dependencies.md](./backend-dependencies.md) | All 30+ backend packages: NestJS, Prisma, Fastify, JWT, Passport, googleapis, Resend, etc. |

---

## 🚦 Suggested Learning Order

### Week 1 — Backend Foundations
1. **NestJS DI, Modules, Controllers** — the entire backend is built on this
2. **Prisma ORM** — all data access goes through Prisma
3. **JWT theory** — understand access vs refresh tokens
4. **class-validator DTOs** — how request bodies are validated

### Week 2 — Backend Features
5. **@nestjs/schedule** — cron jobs (cache eviction, ghost meeting cleanup)
6. **@nestjs/event-emitter** — SSE pub/sub for upload progress
7. **livekit-server-sdk** — room management, token generation
8. **googleapis Drive API** — resumable upload pipeline

### Week 3 — Frontend Deepening
9. **Next.js App Router** — Server Components, Server Actions, Edge Middleware
10. **jose** — why it's needed instead of jsonwebtoken in Edge Runtime
11. **SWR** — data fetching pattern used across all dashboards
12. **LiveKit React SDK** — hooks used in MeetingRoom.tsx

### Week 4 — Polish
13. **Zod** — schema validation on forms and API responses
14. **React Hook Form** — form state management
15. **cva + cn()** — how Tailwind variants are structured
16. **recharts** — engagement analytics charts

---

## 📌 Quick Tips for Studying This Codebase

- Start reading `backend/src/auth/auth.service.ts` — it uses Prisma, JWT, bcrypt, email, cron all in one file
- Read `backend/src/utils/cache.service.ts` — only 73 lines, teaches EventEmitter + TTL caching cleanly
- Read `frontend/src/proxy.ts` — only 201 lines, teaches Edge Middleware + jose + cookie handling
- Read `backend/src/common/guards/auth.guard.ts` — only 48 lines, teaches NestJS Guards
- Read `backend/src/Drive/drive.service.ts` — teaches Node.js Streams + resumable uploads
