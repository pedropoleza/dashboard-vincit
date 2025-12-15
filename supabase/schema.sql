-- Enable RLS
alter default privileges in schema public grant all on tables to postgres, service_role;

-- 1. ghl_raw_events (Audit Log)
create table if not exists ghl_raw_events (
  id uuid primary key default gen_random_uuid(),
  received_at timestamptz default now(),
  location_id text not null,
  event_type text not null,
  entity_id text not null,
  webhook_id text,
  event_ts timestamptz,
  headers jsonb,
  payload jsonb not null,
  source_ip text,
  signature text,
  dedupe_key text not null unique
);

create index if not exists idx_ghl_raw_loc_time on ghl_raw_events(location_id, received_at desc);
create index if not exists idx_ghl_raw_loc_type_time on ghl_raw_events(location_id, event_type, received_at desc);
-- dedupe_key has a unique constraint which effectively acts as an index

alter table ghl_raw_events enable row level security;
create policy "Service Role Full Access" on ghl_raw_events 
  as permissive for all 
  to service_role 
  using (true) 
  with check (true);

-- 2. ghl_opportunities (Normalized Current State)
create table if not exists ghl_opportunities (
  id uuid primary key default gen_random_uuid(),
  location_id text not null,
  opportunity_id text not null,
  contact_id text,
  pipeline_id text,
  stage_id text,
  status text,
  name text,
  source text,
  assigned_to text,
  created_at timestamptz,
  updated_at timestamptz,
  last_event_ts timestamptz,
  raw_last_payload jsonb,
  constraint uniq_loc_opp unique(location_id, opportunity_id)
);

create index if not exists idx_opp_loc_pipeline_stage on ghl_opportunities(location_id, pipeline_id, stage_id);
create index if not exists idx_opp_loc_status on ghl_opportunities(location_id, status);
create index if not exists idx_opp_loc_last_ts on ghl_opportunities(location_id, last_event_ts desc);

alter table ghl_opportunities enable row level security;
create policy "Service Role Full Access" on ghl_opportunities 
  as permissive for all 
  to service_role 
  using (true) 
  with check (true);

-- 3. daily_metrics (Fast KPIs)
create table if not exists daily_metrics (
  date date not null,
  location_id text not null,
  opportunities_created int default 0,
  opportunities_open int default 0,
  opportunities_won int default 0,
  appointments_created int default 0,
  appointments_completed int default 0,
  appointments_no_show int default 0,
  updated_at timestamptz default now(),
  primary key (date, location_id)
);

alter table daily_metrics enable row level security;
create policy "Service Role Full Access" on daily_metrics 
  as permissive for all 
  to service_role 
  using (true) 
  with check (true);

-- 4. pipeline_stage_daily (Funnel Tracking)
create table if not exists pipeline_stage_daily (
  date date not null,
  location_id text not null,
  pipeline_id text not null,
  stage_id text not null,
  created_count int default 0,
  open_count int default 0,
  won_count int default 0,
  updated_at timestamptz default now(),
  primary key (date, location_id, pipeline_id, stage_id)
);

alter table pipeline_stage_daily enable row level security;
create policy "Service Role Full Access" on pipeline_stage_daily 
  as permissive for all 
  to service_role 
  using (true) 
  with check (true);

-- 5. Views (Optional Helpers)

-- KPI Last 30 Days
create or replace view v_kpi_last_30_days as
select 
  location_id,
  sum(opportunities_created) as total_created,
  sum(opportunities_won) as total_won,
  sum(appointments_completed) as total_appointments
from daily_metrics
where date >= (current_date - interval '30 days')
group by location_id;

-- Funnel Today
create or replace view v_funnel_today_by_stage as
select
  location_id,
  pipeline_id,
  stage_id,
  sum(created_count) as today_created,
  sum(open_count) as today_open,
  sum(won_count) as today_won
from pipeline_stage_daily
where date = current_date
group by location_id, pipeline_id, stage_id;
