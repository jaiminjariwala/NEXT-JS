create table if not exists public.community_admins (
  email text primary key,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.community_admins enable row level security;

drop policy if exists "Community admins can view their own admin row"
  on public.community_admins;
create policy "Community admins can view their own admin row"
  on public.community_admins
  for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt()->>'email', '')));

drop policy if exists "Community admins can delete any community component"
  on public.community_components;
create policy "Community admins can delete any community component"
  on public.community_components
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.community_admins admin
      where lower(admin.email) = lower(coalesce(auth.jwt()->>'email', ''))
    )
  );

insert into public.community_admins (email)
values ('jaiminjariwala5@gmail.com')
on conflict (email) do nothing;

