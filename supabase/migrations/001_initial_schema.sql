-- ============================================================
-- Contribution Tracker — Supabase Database Schema
-- File: supabase/migrations/001_initial_schema.sql
--
-- Run this in the Supabase SQL editor or via the Supabase CLI:
--   supabase db push
-- ============================================================

-- ── Enable UUID extension ───────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── Transactions table ──────────────────────────────────────────────────────
create table if not exists public.transactions (
  id          uuid primary key default uuid_generate_v4(),
  user_id     text not null,          -- Clerk user ID (e.g. "user_2abc...")
  date        date not null,
  payee       text not null,
  amount      integer not null        -- CENTS: R 150.00 → 15000
                check (amount > 0),
  memo        text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast per-user queries (the most common query pattern)
create index if not exists idx_transactions_user_id
  on public.transactions(user_id);

-- Index for date-range filtering (dashboard aggregations, year-end summary)
create index if not exists idx_transactions_date
  on public.transactions(user_id, date desc);

-- ── Auto-update updated_at ──────────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger transactions_updated_at
  before update on public.transactions
  for each row execute procedure public.handle_updated_at();

-- ── Row Level Security ──────────────────────────────────────────────────────
-- RLS ensures users can ONLY ever read/write their own rows,
-- even if there is a bug in the application code.

alter table public.transactions enable row level security;

-- Policy: users can SELECT their own transactions
create policy "Users can read own transactions"
  on public.transactions for select
  using (user_id = auth.jwt() ->> 'sub');

-- Policy: users can INSERT their own transactions
create policy "Users can insert own transactions"
  on public.transactions for insert
  with check (user_id = auth.jwt() ->> 'sub');

-- Policy: users can UPDATE their own transactions
create policy "Users can update own transactions"
  on public.transactions for update
  using (user_id = auth.jwt() ->> 'sub');

-- Policy: users can DELETE their own transactions
create policy "Users can delete own transactions"
  on public.transactions for delete
  using (user_id = auth.jwt() ->> 'sub');

-- ── Grant permissions to anon + authenticated roles ─────────────────────────
grant usage on schema public to anon, authenticated;
grant all on public.transactions to anon, authenticated;

-- ============================================================
-- IMPORTANT: Clerk JWT Template Setup
-- ============================================================
-- In your Clerk dashboard, go to:
--   JWT Templates → New template → Supabase
--
-- Set the template to:
-- {
--   "sub": "{{user.id}}",
--   "role": "authenticated"
-- }
--
-- This makes auth.jwt() ->> 'sub' return the Clerk user ID,
-- which is what the RLS policies above check against.
-- ============================================================
