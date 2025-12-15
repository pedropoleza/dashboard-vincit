-- Seed Data for Dashboard Visualization (UPDATED for DASHBOARD MANIFESTO)
-- Run this in Supabase SQL Editor

-- 1. Clean up
truncate table daily_metrics;
truncate table pipeline_stage_daily;
truncate table ghl_opportunities;

-- Variables
do $$
declare
  v_loc text := 'demo_location_vincit';
  v_pipeline text := 'pipeline_sales_01';
  
  -- DASHBOARD SPECIFIC STAGES
  v_stage_w_prospect text := 'stage_w_prospect'; -- "W Prospect" (New Lead)
  v_stage_m1_sched text := 'stage_m1_sched';   -- "M1 S"
  v_stage_m1_comp text := 'stage_m1_comp';     -- "M1 C"
  v_stage_m2_sched text := 'stage_m2_sched';   -- "M2 S"
  v_stage_m2_comp text := 'stage_m2_comp';     -- "M2 C" (Critical for DSC)
  v_stage_dc_sched text := 'stage_dc_sched';   -- "DC S"
  v_stage_dc_comp text := 'stage_dc_comp';     -- "DC C" (Won)

  i integer;
  current_day date;
  advisor_names text[] := array['Pedro', 'Ana', 'Carlos', 'Mariana'];
  selected_advisor text;
begin

  -- 2. Insert Opportunities (Current State) across the funnel
  
  -- Create W Prospects (Top of funnel)
  for i in 1..20 loop
    selected_advisor := advisor_names[(i % 4) + 1];
    insert into ghl_opportunities (location_id, opportunity_id, contact_id, pipeline_id, stage_id, status, name, source, assigned_to, created_at, updated_at)
    values (v_loc, 'opp_w_' || i, 'contact_' || i, v_pipeline, v_stage_w_prospect, 'open', 'Lead W ' || i, 'Ads', selected_advisor, now() - (i || ' days')::interval, now());
  end loop;

  -- Create M1 Completed (Mid funnel)
  for i in 1..15 loop
    selected_advisor := advisor_names[(i % 4) + 1];
    insert into ghl_opportunities (location_id, opportunity_id, contact_id, pipeline_id, stage_id, status, name, source, assigned_to, created_at, updated_at)
    values (v_loc, 'opp_m1_' || i, 'contact_m1_' || i, v_pipeline, v_stage_m1_comp, 'open', 'Lead M1 ' || i, 'Referral', selected_advisor, now() - (i || ' days')::interval, now());
  end loop;

  -- Create M2 Completed (High value for DSC)
  for i in 1..10 loop
    selected_advisor := advisor_names[(i % 4) + 1];
    insert into ghl_opportunities (location_id, opportunity_id, contact_id, pipeline_id, stage_id, status, name, source, assigned_to, created_at, updated_at)
    values (v_loc, 'opp_m2_' || i, 'contact_m2_' || i, v_pipeline, v_stage_m2_comp, 'open', 'Lead M2 ' || i, 'Referral', selected_advisor, now() - (i || ' days')::interval, now());
  end loop;
  
  -- Create DC Completed (Won)
  for i in 1..8 loop
    selected_advisor := advisor_names[(i % 4) + 1];
    insert into ghl_opportunities (location_id, opportunity_id, contact_id, pipeline_id, stage_id, status, name, source, assigned_to, created_at, updated_at)
    values (v_loc, 'opp_won_' || i, 'contact_won_' || i, v_pipeline, v_stage_dc_comp, 'won', 'Client Won ' || i, 'Referral', selected_advisor, now() - (i || ' days')::interval, now());
  end loop;

  -- 3. Insert Funnel Data (pipeline_stage_daily) for Analysis
  -- Generate history for the last 30 days
  for i in 0..30 loop
    current_day := (now() - (i || ' days')::interval)::date;
    
    -- W Prospect: High volume
    insert into pipeline_stage_daily (date, location_id, pipeline_id, stage_id, created_count, open_count, won_count)
    values (current_day, v_loc, v_pipeline, v_stage_w_prospect, (random() * 5 + 2)::int, 20, 0);

    -- M1 Comp: Moderate
    insert into pipeline_stage_daily (date, location_id, pipeline_id, stage_id, created_count, open_count, won_count)
    values (current_day, v_loc, v_pipeline, v_stage_m1_comp, (random() * 3 + 1)::int, 15, 0);
    
    -- M2 Comp: Lower (Leakage from M1->M2)
    insert into pipeline_stage_daily (date, location_id, pipeline_id, stage_id, created_count, open_count, won_count)
    values (current_day, v_loc, v_pipeline, v_stage_m2_comp, (random() * 2)::int, 10, 0);

    -- DC Comp (Won)
    insert into pipeline_stage_daily (date, location_id, pipeline_id, stage_id, created_count, open_count, won_count)
    values (current_day, v_loc, v_pipeline, v_stage_dc_comp, 0, 0, (random() * 1)::int);
  end loop;

  -- 4. Daily Metrics (Appointments & Referrals)
  -- Note: We need a place to store "Referrals Collected". 
  -- Our current schema only has 'appointments'.
  -- FOR MVP: We will assume 'appointments_created' = Referrals Collected for this demo (or add a column).
  -- I Will use 'appointments_created' as Referrals Collected placeholder for now to avoid schema migration in seed step.
  
  for i in 0..30 loop
    current_day := (now() - (i || ' days')::interval)::date;
    
    insert into daily_metrics (date, location_id, opportunities_created, opportunities_open, opportunities_won, appointments_created, appointments_completed, appointments_no_show)
    values (
      current_day,
      v_loc,
      (random() * 5 + 1)::int, 
      20, 
      (random() * 1)::int,      
      (random() * 2)::int,      -- Using as Pseudo "Referrals Collected"
      (random() * 4 + 1)::int,  -- "Meetings Completed" (Base for Ref Expected)
      0
    );
  end loop;

end $$;
