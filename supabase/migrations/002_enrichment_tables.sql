-- Migration 002: Enrichment Tables
-- Run this in Supabase SQL Editor after the initial schema

-- 1. Contacts Table (Enriched from GHL API)
create table if not exists ghl_contacts (
  contact_id text primary key,
  location_id text not null,
  full_name text,
  first_name text,
  last_name text,
  email text,
  phone text,
  source text,
  tags text[],
  custom_fields jsonb,
  last_enriched_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_contacts_location on ghl_contacts(location_id);
create index idx_contacts_enriched on ghl_contacts(last_enriched_at);

-- 2. Users/Advisors Table
create table if not exists ghl_users (
  user_id text primary key,
  location_id text,
  full_name text,
  email text,
  role text,
  avatar_url text,
  type text,
  last_enriched_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_users_location on ghl_users(location_id);
create index idx_users_enriched on ghl_users(last_enriched_at);

-- 3. Pipeline Stages Table
create table if not exists ghl_pipeline_stages (
  stage_id text primary key,
  pipeline_id text not null,
  location_id text not null,
  stage_name text not null,
  stage_order integer,
  color text,
  show_in_funnel boolean default true,
  last_enriched_at timestamptz default now(),
  created_at timestamptz default now()
);

create index idx_stages_pipeline on ghl_pipeline_stages(pipeline_id);
create index idx_stages_location on ghl_pipeline_stages(location_id);

-- 4. RLS Policies (Service Role Only - Same as before)
alter table ghl_contacts enable row level security;
alter table ghl_users enable row level security;
alter table ghl_pipeline_stages enable row level security;

-- Allow service_role full access
create policy "Allow service_role full access to contacts"
  on ghl_contacts for all
  using (true)
  with check (true);

create policy "Allow service_role full access to users"
  on ghl_users for all
  using (true)
  with check (true);

create policy "Allow service_role full access to stages"
  on ghl_pipeline_stages for all
  using (true)
  with check (true);
