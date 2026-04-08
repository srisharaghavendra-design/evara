-- evara complete schema migration
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Companies table
create table if not exists companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  from_email text default 'hello@evarahq.com',
  brand_color text default '#0A84FF',
  brand_logo_url text,
  sendgrid_api_key text,
  plan text default 'starter',
  created_at timestamptz default now()
);

-- Profiles (users)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  company_id uuid references companies(id),
  email text,
  full_name text,
  role text default 'admin',
  avatar_url text,
  created_at timestamptz default now()
);

-- Events
create table if not exists events (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  name text not null,
  event_date date,
  event_time text,
  location text,
  description text,
  status text default 'draft',
  created_by uuid references profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Contacts
create table if not exists contacts (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references companies(id) on delete cascade,
  email text not null,
  first_name text,
  last_name text,
  company_name text,
  phone text,
  title text,
  linkedin_url text,
  source text default 'manual',
  unsubscribed boolean default false,
  unsubscribed_at timestamptz,
  gdpr_consent boolean default false,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(company_id, email)
);

-- Event contacts (junction + status)
create table if not exists event_contacts (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  contact_id uuid references contacts(id) on delete cascade,
  company_id uuid references companies(id),
  status text default 'pending',
  invited_at timestamptz,
  confirmed_at timestamptz,
  declined_at timestamptz,
  attended_at timestamptz,
  seat_number text,
  dietary_requirements text,
  notes text,
  created_at timestamptz default now(),
  unique(event_id, contact_id)
);

-- Email campaigns
create table if not exists email_campaigns (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  company_id uuid references companies(id),
  name text,
  subject text,
  email_type text,
  template_style text default 'branded',
  html_content text,
  plain_text text,
  status text default 'draft',
  segment text default 'all',
  send_at timestamptz,
  sent_at timestamptz,
  total_sent integer default 0,
  total_opened integer default 0,
  total_clicked integer default 0,
  total_bounced integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Email sends (individual record per contact per campaign)
create table if not exists email_sends (
  id uuid primary key default uuid_generate_v4(),
  campaign_id uuid references email_campaigns(id) on delete cascade,
  contact_id uuid references contacts(id),
  event_id uuid references events(id),
  company_id uuid references companies(id),
  email text not null,
  status text default 'sent',
  sendgrid_message_id text,
  opened_at timestamptz,
  clicked_at timestamptz,
  bounced_at timestamptz,
  unsubscribed_at timestamptz,
  sent_at timestamptz default now()
);

-- Forms
create table if not exists forms (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  company_id uuid references companies(id),
  name text,
  fields jsonb default '[]'::jsonb,
  form_type text default 'registration',
  is_active boolean default true,
  share_token text unique default encode(gen_random_bytes(12), 'hex'),
  created_at timestamptz default now()
);

-- Form submissions
create table if not exists form_submissions (
  id uuid primary key default uuid_generate_v4(),
  form_id uuid references forms(id) on delete cascade,
  event_id uuid references events(id),
  company_id uuid references companies(id),
  contact_id uuid references contacts(id),
  submitter_email text,
  responses jsonb,
  submitted_at timestamptz default now()
);

-- Contact activity log
create table if not exists contact_activity (
  id uuid primary key default uuid_generate_v4(),
  contact_id uuid references contacts(id) on delete cascade,
  event_id uuid references events(id) on delete set null,
  company_id uuid references companies(id),
  activity_type text,
  description text,
  metadata jsonb,
  created_at timestamptz default now()
);

-- Landing pages
create table if not exists landing_pages (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  company_id uuid references companies(id),
  slug text unique,
  title text,
  template text default 'corporate',
  blocks jsonb,
  custom_css text,
  is_published boolean default false,
  created_at timestamptz default now()
);

-- Event summary view (for analytics)
create or replace view event_summary as
select 
  e.id as event_id,
  e.name,
  e.company_id,
  count(distinct ec.id) as total_contacts,
  count(distinct case when ec.status = 'confirmed' then ec.id end) as total_confirmed,
  count(distinct case when ec.status = 'declined' then ec.id end) as total_declined,
  count(distinct case when ec.status = 'attended' then ec.id end) as total_attended,
  count(distinct case when ec.status = 'pending' then ec.id end) as total_pending,
  coalesce(sum(cam.total_sent), 0) as total_sent,
  coalesce(sum(cam.total_opened), 0) as total_opened,
  coalesce(sum(cam.total_clicked), 0) as total_clicked
from events e
left join event_contacts ec on ec.event_id = e.id
left join email_campaigns cam on cam.event_id = e.id
group by e.id, e.name, e.company_id;

-- Row Level Security
alter table companies enable row level security;
alter table profiles enable row level security;
alter table events enable row level security;
alter table contacts enable row level security;
alter table event_contacts enable row level security;
alter table email_campaigns enable row level security;
alter table email_sends enable row level security;
alter table forms enable row level security;
alter table form_submissions enable row level security;
alter table contact_activity enable row level security;
alter table landing_pages enable row level security;

-- RLS Policies (company isolation)
create policy "Users see own company data" on events for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Users see own company data" on contacts for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Users see own company data" on event_contacts for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Users see own company data" on email_campaigns for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Users see own company data" on email_sends for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Users see own company contacts lifecycle" on contact_activity for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Public can submit forms" on form_submissions for insert
  with check (true);

create policy "Public can read active forms" on forms for select
  using (is_active = true);

create policy "Users manage own forms" on forms for all
  using (company_id = (select company_id from profiles where id = auth.uid()));

create policy "Public can read events for check-in" on events for select
  using (true);

create policy "Public can update check-in status" on event_contacts for update
  using (true);

create policy "Public can read contacts for check-in" on event_contacts for select
  using (true);

-- Functions for webhook tracking
create or replace function increment_campaign_opens(campaign_id uuid)
returns void language plpgsql security definer as $$
begin
  update email_campaigns set total_opened = total_opened + 1 where id = campaign_id;
end;
$$;

create or replace function increment_campaign_clicks(campaign_id uuid)
returns void language plpgsql security definer as $$
begin
  update email_campaigns set total_clicked = total_clicked + 1 where id = campaign_id;
end;
$$;

-- Index for performance
create index if not exists idx_event_contacts_event_id on event_contacts(event_id);
create index if not exists idx_event_contacts_status on event_contacts(status);
create index if not exists idx_email_campaigns_event_id on email_campaigns(event_id);
create index if not exists idx_contacts_company_id on contacts(company_id);
create index if not exists idx_contact_activity_contact_id on contact_activity(contact_id);
create index if not exists idx_form_submissions_form_id on form_submissions(form_id);
create index if not exists idx_forms_share_token on forms(share_token);

-- Add tags column to contacts for VIP marking etc
alter table contacts add column if not exists tags text[] default '{}';

-- Add session tracking for Q&A
create table if not exists qa_questions (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  company_id uuid references companies(id),
  contact_id uuid references contacts(id),
  question text not null,
  answered boolean default false,
  upvotes integer default 0,
  submitted_at timestamptz default now()
);

-- Add polls table
create table if not exists polls (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references events(id) on delete cascade,
  company_id uuid references companies(id),
  question text not null,
  options jsonb default '[]'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Add seat assignments to event_contacts (already exists as seat_number text)
-- Add dietary requirements
alter table event_contacts add column if not exists dietary text;
alter table event_contacts add column if not exists notes text;

-- Add share_token to events for read-only dashboard sharing
alter table events add column if not exists share_token text unique;
create index if not exists idx_events_share_token on events(share_token);

-- Public read access for shared dashboards
create policy "Public can view events by share token" on events for select
  using (share_token is not null);

-- Add capacity field to events
alter table events add column if not exists capacity integer;
