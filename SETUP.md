# Amor Fati — Setup Guide

## What's been built

A working Next.js app with all Phase 1 screens:

- `/` — Landing page
- `/signup` `/login` — Auth (Supabase email + password)
- `/morning` — 3-step morning reflection with mood check-in
- `/evening` — 3-step evening reflection with mood check-in
- `/practice` — Dichotomy of Control exercise (with premium teaser)
- `/history` — Entry history, last 90 days

---

## Get it running locally

### 1. Open the project in Cursor
Drag the `app/` folder into Cursor, or: `File → Open Folder → select app/`

### 2. Install dependencies
In the terminal inside Cursor:
```
npm install
```

### 3. Set up Supabase
1. Go to [supabase.com](https://supabase.com) → New project
2. Once created: **Settings → API** → copy your Project URL and anon key
3. In the `app/` folder, copy `.env.local.example` to `.env.local`:
   ```
   cp .env.local.example .env.local
   ```
4. Paste your Supabase URL and anon key into `.env.local`

### 4. Run the database schema
1. In Supabase dashboard → **SQL Editor**
2. Open `supabase/schema.sql` from this project
3. Paste the contents into the editor and click **Run**

### 5. Enable email auth in Supabase
Settings → Authentication → Providers → Email → make sure it's enabled

### 6. Start the app
```
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploy to Vercel
1. Push the `app/` folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy → live in 60 seconds

---

## What's next (Phase 1 remaining)
- [ ] Add middleware to redirect unauthenticated users away from /morning, /evening, etc.
- [ ] Add a logout button
- [ ] Test on mobile (the nav is built for it)
- [ ] Deploy to Vercel with a real domain
- [ ] Share with 10 people
