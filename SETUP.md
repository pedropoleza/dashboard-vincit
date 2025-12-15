# GoHighLevel Backend Ingestion Setup Guide

## 1. Architecture Summary
This backend receives Webhooks from GoHighLevel, normalizes the data, persists it to Supabase (Postgres), and calculates daily metrics.

**Flow:** GHL Webhook -> Next.js API (`/api/webhooks/ghl`) -> Supabase (`ghl_raw_events`, `ghl_opportunities`, `daily_metrics`).

## 2. Environment Configuration
Create a file named `.env.local` in the root directory (do not commit this file). Paster the following content and fill in your values.

```env
# Supabase Configuration
# Retrieve these from Supabase Project Settings -> API
SUPABASE_URL=https://your-project.supabase.co
# IMPORTANT: Use the SERVICE_ROLE_KEY (starts with ey...), NOT the anon key.
SUPABASE_SERVICE_ROLE_KEY=ey...

# Webhook Security
# Arbitrary secure token you generate. You will paste this into GHL custom field or header config.
WEBHOOK_BEARER_TOKEN=secure_random_string_123
# Mode: 'bearer' (easiest) or 'signature' (advanced)
WEBHOOK_AUTH_MODE=bearer

# Admin Access (for Backfill Endpoint)
ADMIN_TOKEN=admin_secret_999

# GoHighLevel (For Backfill Only)
# Obtained via OAuth or the Webhook method you mentioned
GHL_ACCESS_TOKEN=
GHL_LOCATION_ID=
```

> **Note on Provided Keys**: The keys you provided (`sb_publishable_...`, `sb_secret_...`) appear to be non-standard Supabase keys (possibly Management API or a wrapper). Please ensure you use the **Project URL** and **Service Role Secret (JWT)** from the Supabase Dashboard > Settings > API.

## 3. Database Setup (Supabase)
1. Go to your Supabase Project -> SQL Editor.
2. Copy the content of `supabase/schema.sql` from this repo.
3. Run the SQL to create tables (`ghl_raw_events`, `ghl_opportunities`, etc.) and Row Level Security policies.

## 4. Deployment Check (Vercel)
1. Push this code to a Git repository (GitHub/GitLab).
2. Import project into Vercel.
3. In Vercel Project Settings -> Environment Variables, add all the variables from your `.env.local`.
4. Deploy.

## 5. GoHighLevel Configuration
### Set up the Webhook
1. In GoHighLevel Automation (Workflow).
2. Trigger: Opportunity Status Change / Create / etc.
3. Action: **Webhook**.
4. Method: **POST**.
5. URL: `https://your-vercel-app.vercel.app/api/webhooks/ghl`
   (Or `https://.../api/webhooks/ghl` if using custom domain)
6. **Headers**:
   - Key: `Authorization`
   - Value: `Bearer secure_random_string_123` (matching your `.env` value)
   - (Optional) `Content-Type`: `application/json`

## 6. Testing

### Test with Curl
You can simulate a webhook event using this command:

```bash
curl -X POST http://localhost:3000/api/webhooks/ghl \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secure_random_string_123" \
  -d '[
  {
    "body": {
      "type": "OpportunityCreate",
      "locationId": "test_location_001",
      "id": "opp_test_123",
      "contactId": "contact_test_456",
      "status": "open",
      "pipelineId": "pipeline_1",
      "pipelineStageId": "stage_1",
      "dateAdded": "2025-01-01T12:00:00Z"
    }
  }
]'
```

**Expected Response:**
```json
{"ok":true}
```

### Verification
Check Supabase tables:
- `ghl_raw_events`: Should have 1 row.
- `ghl_opportunities`: Should have 1 row for `opp_test_123`.
- `daily_metrics`: Should have count=1 for `opportunities_created` on 2025-01-01.

## 7. Known Unknowns & Limitations
- **Signature Verification**: The HMAC-SHA256 signature verification is implemented but relies on GHL sending `x-wh-signature`. If GHL changes the signing algo, switch `WEBHOOK_AUTH_MODE` to `bearer`.
- **Status "Won" logic**: Currently, we count "Won" metrics when an event arrives with `status: 'won'`. If webhooks arrive out of order (e.g. Won then Open), metrics might be slightly off. Strictly monitoring `ghl_opportunities` status is better for exact current state.
- **Pagination**: The Backfill endpoint (`/api/admin/backfill`) fetches a limited number of opportunities (default 20-100). For production with thousands of leads, implement cursor-based pagination effectively.
