create extension if not exists pgcrypto;

create table if not exists public.daily_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  record_date date not null default current_date,
  bowel_count integer,
  bowel_condition text check (bowel_condition in ('normal', 'loose', 'diarrhea', 'constipation', 'bloody')),
  pain_level integer check (pain_level between 0 and 10),
  pain_note text,
  diet_note text,
  condition_level integer check (condition_level between 1 and 5),
  condition_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, record_date)
);

alter table public.daily_records enable row level security;

create policy "daily_records_select_own"
  on public.daily_records for select
  using (auth.uid() = user_id);

create policy "daily_records_insert_own"
  on public.daily_records for insert
  with check (auth.uid() = user_id);

create policy "daily_records_update_own"
  on public.daily_records for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "daily_records_delete_own"
  on public.daily_records for delete
  using (auth.uid() = user_id);
