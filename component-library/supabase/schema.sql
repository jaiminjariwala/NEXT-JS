create extension if not exists pgcrypto;

create table if not exists public.community_components (
  id uuid primary key default gen_random_uuid(),
  owner_id text,
  forked_from_id uuid references public.community_components(id) on delete set null,
  slug text not null unique,
  name text not null,
  category text,
  author_name text,
  description text,
  language text not null default 'typescript' check (language in ('typescript', 'javascript')),
  tsx text,
  js text,
  html text,
  css text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  like_count integer not null default 0,
  bookmark_count integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists community_components_status_created_at_idx
  on public.community_components(status, created_at desc);

create index if not exists community_components_forked_from_id_idx
  on public.community_components(forked_from_id);

create table if not exists public.community_component_reactions (
  component_id uuid not null references public.community_components(id) on delete cascade,
  user_id text not null,
  reaction_type text not null check (reaction_type in ('like', 'bookmark')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (component_id, user_id, reaction_type)
);

create index if not exists community_component_reactions_user_id_idx
  on public.community_component_reactions(user_id, created_at desc);

create table if not exists public.community_component_versions (
  id uuid primary key default gen_random_uuid(),
  component_id uuid not null references public.community_components(id) on delete cascade,
  owner_id text,
  name text not null,
  category text,
  description text,
  language text not null default 'typescript' check (language in ('typescript', 'javascript')),
  tsx text,
  js text,
  html text,
  css text not null default '',
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  version_number integer not null,
  created_at timestamptz not null default timezone('utc', now()),
  unique (component_id, version_number)
);

create index if not exists community_component_versions_component_id_idx
  on public.community_component_versions(component_id, version_number desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.sync_community_component_reaction_counts()
returns trigger
language plpgsql
as $$
begin
  if tg_op in ('INSERT', 'UPDATE') then
    update public.community_components
    set
      like_count = (
        select count(*)
        from public.community_component_reactions
        where component_id = new.component_id
          and reaction_type = 'like'
      ),
      bookmark_count = (
        select count(*)
        from public.community_component_reactions
        where component_id = new.component_id
          and reaction_type = 'bookmark'
      )
    where id = new.component_id;
  end if;

  if tg_op in ('DELETE', 'UPDATE') then
    update public.community_components
    set
      like_count = (
        select count(*)
        from public.community_component_reactions
        where component_id = old.component_id
          and reaction_type = 'like'
      ),
      bookmark_count = (
        select count(*)
        from public.community_component_reactions
        where component_id = old.component_id
          and reaction_type = 'bookmark'
      )
    where id = old.component_id;
  end if;

  return coalesce(new, old);
end;
$$;

create or replace function public.snapshot_community_component_version()
returns trigger
language plpgsql
as $$
declare
  next_version_number integer;
begin
  select coalesce(max(version_number), 0) + 1
  into next_version_number
  from public.community_component_versions
  where component_id = new.id;

  insert into public.community_component_versions (
    component_id,
    owner_id,
    name,
    category,
    description,
    language,
    tsx,
    js,
    html,
    css,
    status,
    version_number
  )
  values (
    new.id,
    new.owner_id,
    new.name,
    new.category,
    new.description,
    new.language,
    new.tsx,
    new.js,
    new.html,
    new.css,
    new.status,
    next_version_number
  );

  return new;
end;
$$;

drop trigger if exists set_community_components_updated_at on public.community_components;
create trigger set_community_components_updated_at
before update on public.community_components
for each row
execute function public.set_updated_at();

drop trigger if exists sync_community_component_reaction_counts on public.community_component_reactions;
create trigger sync_community_component_reaction_counts
after insert or update or delete on public.community_component_reactions
for each row
execute function public.sync_community_component_reaction_counts();

drop trigger if exists snapshot_community_component_version on public.community_components;
create trigger snapshot_community_component_version
after insert or update on public.community_components
for each row
execute function public.snapshot_community_component_version();

alter table public.community_components enable row level security;
alter table public.community_component_reactions enable row level security;
alter table public.community_component_versions enable row level security;

drop policy if exists "Published community components are viewable by everyone"
  on public.community_components;
create policy "Published community components are viewable by everyone"
  on public.community_components
  for select
  using (status = 'published');

drop policy if exists "Owners can view their own community components"
  on public.community_components;
create policy "Owners can view their own community components"
  on public.community_components
  for select
  to authenticated
  using (auth.uid()::text = owner_id);

drop policy if exists "Authenticated users can insert their own community components"
  on public.community_components;
create policy "Authenticated users can insert their own community components"
  on public.community_components
  for insert
  to authenticated
  with check (auth.uid()::text = owner_id);

drop policy if exists "Authenticated users can update their own community components"
  on public.community_components;
create policy "Authenticated users can update their own community components"
  on public.community_components
  for update
  to authenticated
  using (auth.uid()::text = owner_id)
  with check (auth.uid()::text = owner_id);

drop policy if exists "Authenticated users can delete their own community components"
  on public.community_components;
create policy "Authenticated users can delete their own community components"
  on public.community_components
  for delete
  to authenticated
  using (auth.uid()::text = owner_id);

drop policy if exists "Authenticated users can view their own component reactions"
  on public.community_component_reactions;
create policy "Authenticated users can view their own component reactions"
  on public.community_component_reactions
  for select
  to authenticated
  using (auth.uid()::text = user_id);

drop policy if exists "Authenticated users can insert their own component reactions"
  on public.community_component_reactions;
create policy "Authenticated users can insert their own component reactions"
  on public.community_component_reactions
  for insert
  to authenticated
  with check (auth.uid()::text = user_id);

drop policy if exists "Authenticated users can delete their own component reactions"
  on public.community_component_reactions;
create policy "Authenticated users can delete their own component reactions"
  on public.community_component_reactions
  for delete
  to authenticated
  using (auth.uid()::text = user_id);

drop policy if exists "Owners can view their own component versions"
  on public.community_component_versions;
create policy "Owners can view their own component versions"
  on public.community_component_versions
  for select
  to authenticated
  using (auth.uid()::text = owner_id);

drop policy if exists "Owners can insert their own component versions"
  on public.community_component_versions;
create policy "Owners can insert their own component versions"
  on public.community_component_versions
  for insert
  to authenticated
  with check (auth.uid()::text = owner_id);
