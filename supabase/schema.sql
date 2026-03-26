-- Amor Fati — Supabase Schema
-- Run this in your Supabase SQL Editor

-- ─── Journal Entries ──────────────────────────────────────────────────────────
create table if not exists journal_entries (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  type        text not null check (type in ('morning', 'evening', 'practice')),
  content     jsonb not null default '{}',
  mood_score  int check (mood_score between 1 and 5),
  entry_date  date not null default current_date,
  created_at  timestamptz not null default now(),

  -- One morning + one evening per day per user
  unique (user_id, type, entry_date)
);

-- Index for fast user history queries
create index on journal_entries (user_id, entry_date desc);

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table journal_entries enable row level security;

-- Users can only see their own entries
create policy "Users see own entries"
  on journal_entries for select
  using (auth.uid() = user_id);

-- Users can only insert their own entries
create policy "Users insert own entries"
  on journal_entries for insert
  with check (auth.uid() = user_id);

-- Users can update their own entries
create policy "Users update own entries"
  on journal_entries for update
  using (auth.uid() = user_id);

-- Users can delete their own entries
create policy "Users delete own entries"
  on journal_entries for delete
  using (auth.uid() = user_id);

-- ─── User Profiles ────────────────────────────────────────────────────────────
create table if not exists profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  display_name  text,
  tier          text not null default 'free' check (tier in ('free', 'practitioner', 'lifetime')),
  streak        int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users see own profile"
  on profiles for select
  using (auth.uid() = id);

create policy "Users update own profile"
  on profiles for update
  using (auth.uid() = id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
