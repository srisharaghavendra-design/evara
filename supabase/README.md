# evara Supabase Setup

## Run the schema migration
1. Go to your Supabase project → SQL Editor
2. Paste the contents of `migrations/001_evara_schema.sql`
3. Click Run

## Deploy edge functions
```powershell
# In your project directory
supabase login
supabase link --project-ref sqddpjsgtwblmkgxqyxe
supabase functions deploy generate-edm --no-verify-jwt
supabase functions deploy send-email --no-verify-jwt
supabase functions deploy send-triggered-email --no-verify-jwt
```

## Environment variables needed in Supabase Edge Functions
Set these in Supabase → Project Settings → Edge Functions → Secrets:
- `ANTHROPIC_API_KEY` — for AI email generation
- `SENDGRID_API_KEY` — for sending emails
- `SENDGRID_FROM_EMAIL` — hello@evarahq.com
