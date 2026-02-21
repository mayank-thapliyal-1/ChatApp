# Real-time Chat App (Setup)

Next.js (App Router) + TypeScript + Tailwind CSS + Convex + Clerk. This repo contains **setup, schema, and base layout only** — no full messaging logic yet.

## Prerequisites

- Node.js 20+
- npm (or pnpm/yarn)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env.local
```

- **Clerk**: [dashboard.clerk.com](https://dashboard.clerk.com) → API Keys. Use the **Convex** JWT template (Dashboard → JWT Templates → Convex).
- **Convex**: [dashboard.convex.dev](https://dashboard.convex.dev) → create a project, then run:

```bash
npx convex dev
```

This links the project and generates `convex/_generated`. Keep it running in a separate terminal while developing.

Set in **Convex Dashboard** (Settings → Environment Variables) the Clerk JWT issuer domain from your Clerk JWT template (e.g. `https://your-app.clerk.accounts.dev`).

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in (or sign up) and you’ll be redirected to the dashboard.

## Verification checklist

- [ ] **Clerk**: Unauthenticated visit to `/dashboard` redirects to sign-in.
- [ ] **Convex**: `npx convex dev` runs and schema compiles; `convex/_generated` is present.
- [ ] **Env**: With empty `.env.local`, the app shows “Copy .env.example to .env.local”. With keys set, home and sign-in work.

## Project structure

```
app/
  (auth)/           # Clerk sign-in, sign-up
  dashboard/        # Protected chat layout (sidebar + chat area)
  layout.tsx
  page.tsx

components/
  sidebar/          # Sidebar with UserButton
  chat/             # ConversationList, ChatWindow, MessageBubble
  ui/               # EmptyState
  providers/        # ConvexClientProvider (Clerk + Convex)

convex/
  schema.ts         # users, conversations, messages
  users.ts
  conversations.ts
  messages.ts
  auth.config.ts    # Clerk JWT issuer for Convex

lib/
  utils.ts
```

## Scripts

- `npm run dev` — start Next.js with Turbopack
- `npm run build` — production build (works without env; with env, full app is used)
- `npm run lint` — ESLint

## Commit suggestion

After verifying the checklist:

```bash
git add -A && git commit -m "chore: initial setup with clerk + convex + tailwind"
```
