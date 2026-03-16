-- CutMix Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Scans table
create table if not exists public.scans (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  image_url text default '',
  cutmix_score integer not null check (cutmix_score >= 0 and cutmix_score <= 100),
  symmetry_score integer not null default 0,
  proportion_score integer not null default 0,
  harmony_score integer not null default 0,
  jawline_score integer not null default 0,
  eye_balance_score integer not null default 0,
  tier text not null default 'Developing',
  report jsonb,
  created_at timestamptz default now()
);

-- Row Level Security for scans
alter table public.scans enable row level security;

create policy "Users can view their own scans"
  on public.scans for select
  using (auth.uid() = user_id);

create policy "Users can insert their own scans"
  on public.scans for insert
  with check (auth.uid() = user_id);

create policy "Users can delete their own scans"
  on public.scans for delete
  using (auth.uid() = user_id);

-- Index for fast user queries
create index if not exists scans_user_id_idx on public.scans(user_id);
create index if not exists scans_created_at_idx on public.scans(created_at desc);

-- Storage bucket for scan images
insert into storage.buckets (id, name, public)
values ('scan-images', 'scan-images', true)
on conflict do nothing;

create policy "Users can upload scan images"
  on storage.objects for insert
  with check (bucket_id = 'scan-images' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Public can view scan images"
  on storage.objects for select
  using (bucket_id = 'scan-images');

