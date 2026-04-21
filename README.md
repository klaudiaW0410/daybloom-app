# DayBloom — Personal Life OS

DayBloom is a premium, personal life management system built with React, TypeScript, and Supabase.

## Tech Stack
- **Frontend**: React + TypeScript (Vite)
- **Database/Auth**: Supabase
- **Charts**: Recharts
- **Styling**: Vanilla CSS

## Setup Instructions

### 1. Supabase SQL Setup

Run the following SQL in your Supabase SQL Editor:

```sql
-- Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  timezone text default 'Europe/Stockholm',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Mood Entries
create table public.mood_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  mood integer check (mood >= 1 and mood <= 5),
  note text,
  date date default current_date not null,
  unique (user_id, date)
);

-- Habit Definitions
create table public.habit_definitions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  icon text,
  color text,
  order_index integer default 0,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

-- Habit Logs
create table public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  habit_id uuid references public.habit_definitions on delete cascade not null,
  date date default current_date not null,
  completed boolean default false,
  unique (user_id, habit_id, date)
);

-- Journal Entries
create table public.journal_entries (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date default current_date not null,
  food_log text,
  workout_log text,
  affirmations text,
  reflections text,
  tomorrow_plan text,
  future_goals text,
  unique (user_id, date)
);

-- Photos
create table public.photos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  date date default current_date not null,
  storage_path text not null,
  caption text,
  created_at timestamp with time zone default now()
);

-- Todos
create table public.todos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  title text not null,
  due_date date,
  completed boolean default false,
  priority text check (priority in ('low', 'medium', 'high')) default 'medium',
  created_at timestamp with time zone default now()
);

-- RLS Policies
alter table public.profiles enable row level security;
alter table public.mood_entries enable row level security;
alter table public.habit_definitions enable row level security;
alter table public.habit_logs enable row level security;
alter table public.journal_entries enable row level security;
alter table public.photos enable row level security;
alter table public.todos enable row level security;

-- Example policy (repeat for others)
create policy "Users can only access their own profile" on public.profiles for all using (auth.uid() = id);
create policy "Users can only access their own mood entries" on public.mood_entries for all using (auth.uid() = user_id);
create policy "Users can only access their own habits" on public.habit_definitions for all using (auth.uid() = user_id);
create policy "Users can only access their own habit logs" on public.habit_logs for all using (auth.uid() = user_id);
create policy "Users can only access their own journals" on public.journal_entries for all using (auth.uid() = user_id);
create policy "Users can only access their own photos" on public.photos for all using (auth.uid() = user_id);
create policy "Users can only access their own todos" on public.todos for all using (auth.uid() = user_id);

-- Profile trigger on Auth Signup
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, new.raw_user_meta_data->>'display_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### 2. Supabase Storage Setup
- Create a public bucket named `photos`.
- Add RLS policies for `photos` bucket:
  - Select: `(role() = 'authenticated')`
  - Insert: `(role() = 'authenticated' AND (bucket_id = 'photos'::text))`
  - Update: `(role() = 'authenticated' AND (bucket_id = 'photos'::text))`
  - Delete: `(role() = 'authenticated' AND (bucket_id = 'photos'::text))`

### 3. Environment Variables
Create a `.env` file from `.env.example`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Installation
```bash
npm install
npm run dev
```
