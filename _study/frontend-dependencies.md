# 📚 Frontend Dependencies — Study Reference
> **Project:** NeuroMeet  
> **Runtime:** Bun + Next.js 16 (App Router)  
> **Language:** TypeScript  
> **Purpose:** Every package explained — what it is, why it exists, how it's used HERE, minimal example, and where to learn it.

---

## 🗂️ Dependency Groups

1. [Framework & Runtime](#1-framework--runtime)
2. [UI & Styling](#2-ui--styling)
3. [Forms & Validation](#3-forms--validation)
4. [Authentication Client-Side](#4-authentication-client-side)
5. [Real-Time Video WebRTC](#5-real-time-video-webrtc)
6. [Data Fetching & State](#6-data-fetching--state)
7. [Charts & Dates](#7-charts--dates)
8. [Dev Tools](#8-dev-tools)

---

## 1. Framework & Runtime

---

### `next` — v16.2.4
**What it is:** The full-stack React framework. Not just a frontend library — it handles routing, server rendering, API routes, edge functions, and build optimization all in one.

**The mental model:**
```
Next.js App Router
├── Server Components (default) → render on server, zero JS sent to browser
├── Client Components ("use client") → run in browser, can use state/effects
├── Server Actions ("use server") → functions that run on server, called from browser
├── Edge Middleware (proxy.ts) → runs before any page, on CDN edge
└── API Routes (/app/api/) → traditional HTTP endpoints
```

**How it's used in NeuroMeet:**
- `app/` folder = all pages and routes
- `proxy.ts` = Edge Middleware for JWT verification and RBAC routing
- Server Actions = calling the NestJS API from the server (tokens never exposed to browser)
- Server Components = dashboards load data server-side, no loading spinners

**Minimal example:**
```typescript
// Server Component (default — no "use client")
// This fetches data on the SERVER before sending HTML to browser
export default async function DashboardPage() {
  const meetings = await fetch('http://api/meetings').then(r => r.json());
  return <MeetingList meetings={meetings} />;
}
```

**📖 Learn:** https://nextjs.org/docs — Start with "App Router" section

---

### `react` + `react-dom` — v19.2.4
**What it is:** The UI library. React builds your UI as a tree of components. `react-dom` is the bridge between React and the actual browser DOM.

**Key concepts you need:**
- `useState` — local state inside a component
- `useEffect` — run code when component mounts or values change
- `useRef` — hold a value that doesn't cause re-renders (e.g., a timer ID)
- `useContext` — share data without passing props through every level
- Concurrent features (React 19) — `useTransition`, `Suspense`

**How it's used:** Everything rendered in the browser is React. `MeetingRoom.tsx`, `EngagementDashboard.tsx`, all forms — all React components.

**📖 Learn:** https://react.dev — Do the full tutorial, then "Hooks" reference

---

### `typescript` — v5
**What it is:** A superset of JavaScript that adds static types. The compiler checks your types before the code runs.

**Why it matters here:**
```typescript
// Without TypeScript — you'd only find this bug at runtime:
function joinMeeting(id) { ... }
joinMeeting(undefined); // crashes

// With TypeScript — caught at compile time:
function joinMeeting(id: string) { ... }
joinMeeting(undefined); // ❌ Error: Argument of type 'undefined' is not assignable to type 'string'
```

**📖 Learn:** https://www.typescriptlang.org/docs/handbook/intro.html

---

### `server-only` — v0.0.1
**What it is:** A tiny package with one job — it throws an error if you accidentally import a server-side file into a Client Component.

**How it's used in NeuroMeet:**
```typescript
// At the top of any file that should NEVER run in the browser:
import 'server-only';

// This file contains secret keys or server-only logic
export async function getSecretData() { ... }
```

If someone imports this into a `"use client"` component, the build fails immediately. It's a safety guardrail.

**📖 Learn:** https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns

---

## 2. UI & Styling

---

### `tailwindcss` — v4
**What it is:** A CSS framework where instead of writing CSS files, you apply utility classes directly in your HTML/JSX.

```tsx
// Old way:
<div className="card"> → needs .card { padding: 16px; background: white; ... } in CSS

// Tailwind way:
<div className="p-4 bg-white rounded-lg shadow-md flex items-center gap-2">
//              padding bg-color  border  shadow  flexbox align  gap
```

**How it's used:** Every single UI element in NeuroMeet uses Tailwind. The `globals.css` file defines CSS variables (colors, spacing) that Tailwind reads.

**Tailwind v4 key change:** Config is now in `postcss.config.mjs` + `globals.css` instead of `tailwind.config.js`.

**📖 Learn:** https://tailwindcss.com/docs — Do "Utility-First Fundamentals" first

---

### `shadcn` — v4.6.0
**What it is:** NOT a component library you install. It's a CLI tool that copies component source code into your project. You own the code — you can edit it freely.

```bash
# This downloads the Button component source into your /components/ui/button.tsx
npx shadcn@latest add button
```

**What's inside:** Pre-built accessible components (Button, Dialog, Card, Input, etc.) built on top of Radix UI primitives + Tailwind. The `components.json` file in the frontend root is shadcn's config.

**How it's used:** All basic UI (dialogs, inputs, dropdowns) come from shadcn. The files live in `frontend/src/components/ui/`.

**📖 Learn:** https://ui.shadcn.com/docs

---

### `@base-ui/react` — v1.4.1
**What it is:** An unstyled, highly accessible component library from the MUI team. "Unstyled" means it gives you behavior and accessibility without any visual CSS. You bring your own styles.

**Why use this alongside shadcn?**
- shadcn: pre-styled components for standard UI
- Base UI: for components that need more control over accessibility behavior (e.g., custom modals, complex popovers)

**How it's used in NeuroMeet:** The recording player modal uses Base UI's Dialog component with `disablePointerDismissal` — a feature shadcn's dialog doesn't have.

```tsx
import * as Dialog from '@base-ui/react/dialog';

<Dialog.Root>
  <Dialog.Trigger>Open</Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Backdrop />
    <Dialog.Popup>Content here</Dialog.Popup>
  </Dialog.Portal>
</Dialog.Root>
```

**📖 Learn:** https://base-ui.com/react/overview

---

### `class-variance-authority` (cva) — v0.7.1
**What it is:** A utility to manage Tailwind class variants in a structured way. Solves the problem of conditionally applying classes.

```typescript
import { cva } from "class-variance-authority";

const button = cva(
  "rounded-full font-semibold transition-all", // base classes
  {
    variants: {
      intent: {
        primary: "bg-primary text-white hover:bg-primary/90",
        danger:  "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        sm: "px-3 py-1 text-sm",
        lg: "px-6 py-3 text-lg",
      },
    },
    defaultVariants: { intent: "primary", size: "sm" },
  }
);

// Usage:
<button className={button({ intent: "danger", size: "lg" })}>Delete</button>
```

**How it's used:** All reusable components (Button, Badge, etc.) use `cva` to define their variants cleanly.

**📖 Learn:** https://cva.style/docs

---

### `clsx` + `tailwind-merge` — v2.1.1 / v3.5.0
**What they are:** Two tiny utilities almost always used together.

- `clsx` — merges class names conditionally
- `tailwind-merge` — when you merge Tailwind classes, resolves conflicts (e.g., `p-4` + `p-2` → keeps only `p-2`)

```typescript
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// In NeuroMeet this is combined into a single cn() utility:
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// Usage:
<div className={cn("p-4 text-white", isActive && "bg-primary", className)} />
```

The `cn()` function is used **everywhere** in the codebase.

**📖 Learn:** https://github.com/lukeed/clsx and https://github.com/dcastil/tailwind-merge

---

### `lucide-react` — v1.14.0
**What it is:** A library of ~1400 clean SVG icons as React components.

```tsx
import { Mic, MicOff, Video, PhoneOff } from "lucide-react";

<Mic size={20} className="text-white" />
<MicOff size={20} strokeWidth={1.5} />
```

**How it's used:** Every icon in the meeting controls, dashboard sidebars, buttons — all from Lucide.

**📖 Learn:** https://lucide.dev/icons — search and copy import

---

### `cmdk` — v1.1.1
**What it is:** A fast, accessible command palette component. The "cmd+k" modal that pops up on many apps.

```tsx
import { Command } from "cmdk";

<Command>
  <Command.Input placeholder="Search meetings..." />
  <Command.List>
    <Command.Item onSelect={() => router.push('/meeting/123')}>
      Math Lecture 5
    </Command.Item>
  </Command.List>
</Command>
```

**📖 Learn:** https://cmdk.paco.me

---

## 3. Forms & Validation

---

### `react-hook-form` + `@hookform/resolvers` — v5.2.2
**What it is:** The standard for form management in React. Handles the full form lifecycle with zero re-renders on typing.

**Why not just useState?**
- 10-field form = 10 `useState` calls + 10 `onChange` handlers = bloated
- React Hook Form: 0 re-renders on typing (uses uncontrolled inputs internally)
- Built-in validation, error handling, submission state

**How it's used:**
```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function SignInForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema), // Zod validates the data
  });

  const onSubmit = async (data) => {
    await signIn(data); // data is already validated
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register("email")} />
      {errors.email && <p>{errors.email.message}</p>}
      <button disabled={isSubmitting}>Sign In</button>
    </form>
  );
}
```

**📖 Learn:** https://react-hook-form.com/get-started

---

### `zod` — v4.4.3
**What it is:** A schema validation library. You define the shape of your data with types + rules, then validate any value against it.

**Used in two places in NeuroMeet:**
1. Frontend forms — validates input before submit (via hookform/resolvers)
2. API response parsing — ensures backend returned the shape you expect

```typescript
import { z } from "zod";

const MeetingSchema = z.object({
  id: z.string().cuid(),
  title: z.string().min(1).max(100),
  scheduledAt: z.string().datetime().optional(),
  status: z.enum(["SCHEDULED", "LIVE", "ENDED"]),
});

// Type is automatically inferred — no need to write the type manually:
type Meeting = z.infer<typeof MeetingSchema>;
```

**📖 Learn:** https://zod.dev — Read "Basic Usage" then "Primitives"

---

### `react-day-picker` — v9.14.0
**What it is:** A flexible, accessible date picker component for React.

**How it's used:** Scheduling meetings — the instructor picks a date and time.

```tsx
import { DayPicker } from "react-day-picker";

<DayPicker
  mode="single"
  selected={selectedDate}
  onSelect={setSelectedDate}
  disabled={{ before: new Date() }}
/>
```

**📖 Learn:** https://daypicker.dev

---

## 4. Authentication (Client-Side)

---

### `jose` — v6.2.3
**What it is:** JavaScript Object Signing and Encryption — a library for JWT operations that works in Web Standard environments (browsers, Edge workers, Cloudflare Workers, Bun).

**Why not `jsonwebtoken`?** Because `jsonwebtoken` uses Node.js's `crypto` module which is NOT available in Next.js Edge Runtime. `jose` uses the browser's native `crypto.subtle` API instead.

**How it's used — this is critical:**
```typescript
// frontend/src/proxy.ts — runs on Cloudflare/Vercel edge
import { jwtVerify } from "jose";

async function verifyToken(token: string) {
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload; // { id, email, role, exp }
}
```

This is the FIRST of the two JWT verification layers. Before any React code runs.

**📖 Learn:** https://github.com/panva/jose — Read "JWT Verification" section

---

## 5. Real-Time Video (WebRTC)

---

### `livekit-client` + `@livekit/components-react` + `@livekit/components-styles`

**What is LiveKit?**
LiveKit is a real-time video infrastructure service. It acts as an SFU (Selective Forwarding Unit) — a server that routes video/audio streams between participants.

```
Without SFU (mesh): Each browser connects to every other browser
  A ←→ B
  A ←→ C   = 6 connections for 4 people, exponential growth
  B ←→ C

With SFU (LiveKit): Everyone connects to ONE server
  A → LiveKit → B
  A → LiveKit → C   = 3 connections regardless of room size
```

**Three packages, three roles:**

| Package | Role |
|---|---|
| `livekit-client` | Low-level SDK: Room, Track, Participant objects. You control everything. |
| `@livekit/components-react` | High-level React hooks wrapping livekit-client. useLocalParticipant(), useRoomContext() |
| `@livekit/components-styles` | CSS styles for LiveKit's default video tiles |

**How they're used in NeuroMeet:**
```typescript
// Connect to a room:
import { Room } from "livekit-client";
const room = new Room();
await room.connect(livekitUrl, accessToken);

// In React components (hooks):
import { useLocalParticipant, useRoomContext, useParticipants } from "@livekit/components-react";

function MeetingControls() {
  const { localParticipant } = useLocalParticipant();
  const room = useRoomContext();

  const toggleMic = () =>
    localParticipant.setMicrophoneEnabled(!localParticipant.isMicrophoneEnabled);
  
  // Receive engagement data from AI bot via LiveKit data channel:
  room.on("dataReceived", (data, participant, _, topic) => {
    if (topic === "engagement") {
      const score = JSON.parse(new TextDecoder().decode(data));
      updateEngagementUI(score);
    }
  });
}
```

**📖 Learn:**
- https://docs.livekit.io/realtime/client/connect/
- https://docs.livekit.io/realtime/client/react-components/
- Watch "WebRTC explained" on YouTube first to understand the concept

---

## 6. Data Fetching & State

---

### `swr` — v2.4.2
**What it is:** A React data fetching library. SWR = stale-while-revalidate — shows cached data immediately, then refetches in background.

**Why not just useEffect + fetch?**
```typescript
// The useEffect way — verbose, no caching, no deduplication:
const [data, setData] = useState(null);
const [loading, setLoading] = useState(true);
useEffect(() => {
  fetch('/api/meetings').then(r => r.json()).then(d => {
    setData(d);
    setLoading(false);
  });
}, []);

// The SWR way — automatic caching, deduplication, revalidation:
const { data, error, isLoading, mutate } = useSWR('/api/meetings', fetcher);
```

**SWR features used in NeuroMeet:**
- `mutate()` — manually refresh data after creating a meeting
- Automatic revalidation on window focus
- Request deduplication (multiple components = 1 request)

```typescript
function useMeetings() {
  const { data, mutate } = useSWR('/meetings', (url) =>
    fetch(url).then(r => r.json())
  );
  
  const createMeeting = async (dto) => {
    await api.post('/meetings', dto);
    mutate(); // Tell SWR to refetch
  };
  
  return { meetings: data, createMeeting };
}
```

**📖 Learn:** https://swr.vercel.app/docs/getting-started

---

## 7. Charts & Dates

---

### `recharts` — v3.9.2
**What it is:** A charting library built specifically for React. Uses SVG.

**How it's used:** Instructor analytics dashboard — engagement scores over time.

```tsx
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { time: "10:00", score: 0.85 },
  { time: "10:05", score: 0.72 },
];

<LineChart width={500} height={300} data={data}>
  <XAxis dataKey="time" />
  <YAxis domain={[0, 1]} />
  <Tooltip />
  <Line type="monotone" dataKey="score" stroke="#7C3AED" />
</LineChart>
```

**📖 Learn:** https://recharts.org/en-US/guide

---

### `date-fns` — v4.1.0
**What it is:** A utility library for date manipulation.

**How it's used:** Formatting meeting timestamps, showing relative time.

```typescript
import { format, formatDistanceToNow, isPast } from "date-fns";

format(new Date(meeting.scheduledAt), "MMM dd, yyyy 'at' h:mm a")
// → "Sep 10, 2026 at 3:30 PM"

formatDistanceToNow(new Date(meeting.scheduledAt), { addSuffix: true })
// → "in 2 hours" or "3 days ago"
```

**📖 Learn:** https://date-fns.org/docs/Getting-Started

---

## 8. Dev Tools

---

### `eslint` + `eslint-config-next`
**What it is:** A linter — catches errors and bad patterns without running the code. `eslint-config-next` adds Next.js specific rules (warns if you use `<img>` instead of Next.js `<Image>`).

**📖 Learn:** https://eslint.org/docs/latest/use/getting-started

---

### `postcss` + `@tailwindcss/postcss`
**What it is:** CSS processor. Tailwind v4 uses it to transform CSS and inject utility classes. You never touch this — it just works from `postcss.config.mjs`.

---

### `@types/*` packages
TypeScript type definitions for libraries:
- `@types/node` — Node.js APIs (fs, path, crypto)
- `@types/react` — React (JSX, hooks, component props)
- `@types/react-dom` — ReactDOM (root.render, portals)

---

## 📊 Priority Learning Map

```
HIGH PRIORITY — used constantly:
├── next              → The whole framework
├── react             → UI rendering
├── typescript        → Types everywhere
├── tailwindcss       → All styling
├── zod               → All validation
└── react-hook-form   → All forms

MEDIUM PRIORITY — specific features:
├── swr               → Data fetching pattern
├── jose              → Auth middleware (Edge)
├── livekit-*         → The entire meeting room
├── shadcn / cva / cn → Component building blocks
└── date-fns          → Date display

LOW PRIORITY — learn when you hit them:
├── recharts          → Analytics charts
├── cmdk              → Search palette
├── react-day-picker  → Date input
├── base-ui           → Specific modal behavior
└── lucide-react      → Just look up icons as needed
```

---

## 🔗 Quick Reference — All Official Docs

| Package | Docs URL |
|---|---|
| Next.js | https://nextjs.org/docs |
| React | https://react.dev |
| TypeScript | https://typescriptlang.org/docs |
| Tailwind CSS v4 | https://tailwindcss.com/docs |
| shadcn/ui | https://ui.shadcn.com/docs |
| Base UI | https://base-ui.com |
| Zod | https://zod.dev |
| React Hook Form | https://react-hook-form.com |
| SWR | https://swr.vercel.app |
| LiveKit Client | https://docs.livekit.io/realtime/client |
| LiveKit React | https://docs.livekit.io/realtime/client/react-components |
| jose | https://github.com/panva/jose |
| Lucide Icons | https://lucide.dev/icons |
| Recharts | https://recharts.org |
| date-fns | https://date-fns.org |
| CVA | https://cva.style |
| cmdk | https://cmdk.paco.me |
| react-day-picker | https://daypicker.dev |
