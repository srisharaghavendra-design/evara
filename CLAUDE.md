# evara — Claude Code Project Memory

> This file is auto-loaded by Claude Code every session. Never paste the brief manually again.

---

## Stack & Infrastructure

| Layer | Detail |
|---|---|
| Frontend | React (Vite) — edits go to `src/` only, root files have no effect |
| Backend | Supabase project `sqddpjsgtwblmkgxqyxe` |
| Hosting | Vercel — auto-deploys from GitHub `main` branch (30–60s delay) |
| Email | SendGrid — FROM address `hello@evarahq.com` hardcoded in edge function code, not env |
| AI | Anthropic API — Haiku for speed tasks, Sonnet for generation |
| Domain | `evarahq.com` (Namecheap) — inbox via Namecheap Private Email |
| Live app | https://evara-tau.vercel.app |
| GitHub repo | `srisharaghavendra-design/evara` |

## Supabase

- **Project ID:** `sqddpjsgtwblmkgxqyxe`
- **Auth:** Use anon key for all edge function calls — never service key in frontend
- **JWT:** `verify_jwt = false` on ALL edge functions (required)
- **Edge function slugs:** `auto-draft-lifecycle` · `generate-edm` · `send-email` · `email-webhook` · `ai-proxy` · `post-event-report` · `generate-campaign`
- **RLS:** Every table has company-level row isolation — never bypass
- **execute_sql:** Run one statement at a time — multi-statement separated by semicolons is unreliable via MCP

## Vercel

- **Project ID:** `prj_tgc5bFLvZYcQM3X2ERv67KWGZFCo`
- **Org ID:** `team_7MgUAWQfdunI9yx6GHplB1af`
- **CLI token:** `YOUR_VERCEL_TOKEN`
- **Build minutes:** Free plan — exhausted often. Use prebuilt deploy method:

```bash
npm run build
rm -rf .vercel/output
mkdir -p .vercel/output/static
cp -r dist/. .vercel/output/static/
cat > .vercel/output/config.json << 'EOF'
{"version":3,"routes":[{"handle":"filesystem"},{"src":"/(.*)","dest":"/index.html"}]}
EOF
echo '{"projectId":"prj_tgc5bFLvZYcQM3X2ERv67KWGZFCo","orgId":"team_7MgUAWQfdunI9yx6GHplB1af"}' > .vercel/project.json
vercel deploy --prebuilt --prod --token YOUR_VERCEL_TOKEN --yes
```

## File Structure

```
src/
  App.jsx                  — main shell, routing, auth (~1800 lines, edit carefully)
  lib/
    evara.js               — supabase client, keys, getSender
    utils.jsx              — buildEmailHtml (exported)
  components/
    Shared.jsx             — Spin, Alert, Inp, ViewHint, ScoreBadge, ImageUploadZone
                             C = color tokens (e.g. C.red = "#FF453A")
  views/
    DashView.jsx           — dashboard, tracking only (no build CTAs)
    EdmView.jsx            — email builder, Step 1
    LandingView.jsx        — landing page builder, Step 2
    FormsView.jsx          — registration form, embedded in Step 2
    ScheduleView.jsx       — send/schedule, Step 3 (gated)
    ContactView.jsx        — contact management
    AnalyticsView.jsx      — open/click/attendance metrics
    CheckInView.jsx        — event day check-in
    SocialView.jsx         — social media post generator
    CampaignView.jsx       — full campaign overview
    SettingsView.jsx       — brand kit, profile, logo, colours
    AgendaView.jsx
    SeatingView.jsx
    QAView.jsx
  pages/
    PublicLandingPage.jsx  — public /page/:slug route
    PublicFormPage.jsx     — public /form/:token route
    PublicCheckInPage.jsx
    PublicDashboardPage.jsx
supabase/
  functions/               — edge functions (Deno/TypeScript)
```

---

## Core UX Flow (never break these rules)

1. **Event brief** → AI auto-drafts all email types → displayed as tabs in Step 1
2. **Step 1 · Emails** — user reviews and approves each draft individually
3. **Step 2 · Landing Page + Form** — landing page editor with registration form embedded (no separate Form step)
4. **Step 3 · Schedule** — LOCKED until: all emails approved AND landing page published
5. **Dashboard** — tracking only. Zero build-action CTAs. Populates only after first email sent.
6. **New users** land directly on event brief as step 1 — no company/brand setup screens first

## Email Types (in order)

Save the Date → Invite → Reminder → Confirmation → BYO (Know Before You Go) → Thank You

---

## Code Rules

### Before every edit
- Check file line count. If over ~300 lines, split into modules first.
- Read only the section being edited — use `view_range`, not full file fetch.
- Grep for the anchor string before replacing — never assume line numbers.

### String replacement pattern
```python
new = src.replace(old, new_code, 1)   # count=1 always — no accidental global replace
assert old in src, f"Anchor not found: {repr(old[:60])}"
```

### JSX safety checks before pushing
- No undeclared state variables in `useEffect` dependency arrays
- No `position: fixed` in new UI (collapses iframe height)
- No duplicate function declarations (causes build errors silently)
- `C` color token imported from `../components/Shared` in every view file

### GitHub push pattern (Python urllib — not curl for writes)
```python
import json, base64, urllib.request

TOKEN = "YOUR_GITHUB_TOKEN"
REPO  = "srisharaghavendra-design/evara"

def push_file(path, content_str, message):
    # 1. Get current SHA
    req = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/contents/{path}",
        headers={"Authorization": f"token {TOKEN}", "User-Agent": "evara-bot"}
    )
    sha = json.loads(urllib.request.urlopen(req).read())["sha"]
    # 2. Push
    body = json.dumps({
        "message": message,
        "content": base64.b64encode(content_str.encode()).decode(),
        "sha": sha,
        "author": {"name": "Srisha Raghavendra", "email": "srisha@evarahq.com"}
    }).encode()
    req2 = urllib.request.Request(
        f"https://api.github.com/repos/{REPO}/contents/{path}",
        method="PUT",
        headers={"Authorization": f"token {TOKEN}", "User-Agent": "evara-bot", "Content-Type": "application/json"},
        data=body
    )
    r = urllib.request.urlopen(req2)
    print("Pushed:", r.status, path)
```

---

## Supabase Edge Functions

### Deployment (MCP tool is unreliable — use CLI or dashboard)
MCP `deploy_edge_function` silently deploys placeholder content. Always verify with `get_edge_function` after deploy. Reliable path: push to GitHub + use Supabase dashboard directly at:
`https://supabase.com/dashboard/project/sqddpjsgtwblmkgxqyxe/functions/[slug]/details`

### Known behaviour
- `auto-draft-lifecycle` — v7, sets `is_active: false` on forms insert
- `generate-campaign` — always sets `status: "draft"` (not conditional on date)

---

## Multi-tenant Data Rules

- Every DB query must be scoped to `company_id` — never return cross-company data
- PII (names, emails) never sent to AI — only event content goes to Anthropic API
- GDPR: unsubscribe link mandatory in every sent email
- RLS policies handle isolation — don't bypass with service key in frontend

---

## Orbis Test Account

- Company ID: `8ce4eb02-7b8e-4a30-988b-c2281e4eb5b2`
- User: `srisha.raghavendra@gmail.com`
- Used for all development testing

---

## Session Rules (Claude follows automatically)

1. **One-shot fixes only.** Fix silently, verify, then report. No "try this / now try that" loops.
2. **Read before writing.** Always fetch the current file state before editing — never edit from memory.
3. **Batch GitHub fetches.** Fetch all files needed in one script, not serial round-trips.
4. **Split large files first.** Any file over ~300 lines gets split into modules before new feature work.
5. **No exploration tokens.** If a task is well-specified, go straight to execution. Ask only when genuinely ambiguous.
6. **Crash audit before push.** Check all major views for undeclared state in useEffect deps, missing imports, duplicate declarations.
7. **Verify deploys.** After every Supabase edge function deploy, call `get_edge_function` to confirm the actual code deployed.
