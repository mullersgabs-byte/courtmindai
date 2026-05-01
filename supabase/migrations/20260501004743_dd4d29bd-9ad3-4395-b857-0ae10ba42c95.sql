-- Storage bucket for uploaded training videos (public read so the AI and the player can fetch the file)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'training-videos',
  'training-videos',
  true,
  104857600, -- 100 MB
  array['video/mp4','video/quicktime','video/webm']
)
on conflict (id) do nothing;

-- Public can read video files (bucket is public, but make this explicit)
create policy "Public read training videos"
on storage.objects for select
to public
using (bucket_id = 'training-videos');

-- Anyone can upload a training video (anonymous demo flow)
create policy "Anyone can upload training videos"
on storage.objects for insert
to public
with check (bucket_id = 'training-videos');

-- Table to persist each analysis
create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  video_path text not null,
  video_url text not null,
  status text not null default 'pending', -- pending | done | error
  error text,
  overall_score numeric,
  verdict text,
  events jsonb,        -- [{ time_seconds, type, title, detail }]
  raw jsonb,           -- full model response
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.analyses enable row level security;

-- Public demo: anyone can create and read analyses (no auth in this flow)
create policy "Anyone can read analyses"
on public.analyses for select to public using (true);

create policy "Anyone can insert analyses"
on public.analyses for insert to public with check (true);

create policy "Anyone can update analyses"
on public.analyses for update to public using (true) with check (true);
