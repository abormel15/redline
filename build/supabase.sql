-- Redline account storage (run once in the Supabase SQL editor). See parts/app84.js.
create table if not exists public.kv (
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  path text not null,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (user_id, path)
);
alter table public.kv enable row level security;
drop policy if exists "kv own rows" on public.kv;
create policy "kv own rows" on public.kv for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
insert into storage.buckets (id, name, public, file_size_limit) values ('rd-assets', 'rd-assets', false, 52428800) on conflict (id) do nothing;
drop policy if exists "rd-assets own read" on storage.objects; drop policy if exists "rd-assets own insert" on storage.objects; drop policy if exists "rd-assets own update" on storage.objects; drop policy if exists "rd-assets own delete" on storage.objects;
create policy "rd-assets own read" on storage.objects for select to authenticated using (bucket_id = 'rd-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rd-assets own insert" on storage.objects for insert to authenticated with check (bucket_id = 'rd-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rd-assets own update" on storage.objects for update to authenticated using (bucket_id = 'rd-assets' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "rd-assets own delete" on storage.objects for delete to authenticated using (bucket_id = 'rd-assets' and (storage.foldername(name))[1] = auth.uid()::text);
