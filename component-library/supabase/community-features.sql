drop policy if exists "Owners can view their own community components"
  on public.community_components;
drop policy if exists "Authenticated users can insert their own community components"
  on public.community_components;
drop policy if exists "Authenticated users can update their own community components"
  on public.community_components;
drop policy if exists "Authenticated users can delete their own community components"
  on public.community_components;

alter table public.community_components
  drop constraint if exists community_components_owner_id_fkey;

alter table public.community_components
  add column if not exists forked_from_id uuid references public.community_components(id) on delete set null,
  add column if not exists like_count integer not null default 0,
  add column if not exists bookmark_count integer not null default 0;

alter table public.community_components
  alter column owner_id type text using owner_id::text;

create index if not exists community_components_forked_from_id_idx
  on public.community_components(forked_from_id);

create table if not exists public.community_component_reactions (
  component_id uuid not null references public.community_components(id) on delete cascade,
  user_id text not null,
  reaction_type text not null check (reaction_type in ('like', 'bookmark')),
  created_at timestamptz not null default timezone('utc', now()),
  primary key (component_id, user_id, reaction_type)
);

drop policy if exists "Authenticated users can view their own component reactions"
  on public.community_component_reactions;
drop policy if exists "Authenticated users can insert their own component reactions"
  on public.community_component_reactions;
drop policy if exists "Authenticated users can delete their own component reactions"
  on public.community_component_reactions;

alter table public.community_component_reactions
  drop constraint if exists community_component_reactions_user_id_fkey;

alter table public.community_component_reactions
  alter column user_id type text using user_id::text;

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

drop policy if exists "Owners can view their own component versions"
  on public.community_component_versions;
drop policy if exists "Owners can insert their own component versions"
  on public.community_component_versions;

alter table public.community_component_versions
  drop constraint if exists community_component_versions_owner_id_fkey;

alter table public.community_component_versions
  alter column owner_id type text using owner_id::text;

create index if not exists community_component_versions_component_id_idx
  on public.community_component_versions(component_id, version_number desc);

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

alter table public.community_component_reactions enable row level security;
alter table public.community_component_versions enable row level security;

create policy "Owners can view their own community components"
  on public.community_components
  for select
  to authenticated
  using (auth.uid()::text = owner_id);

create policy "Authenticated users can insert their own community components"
  on public.community_components
  for insert
  to authenticated
  with check (auth.uid()::text = owner_id);

create policy "Authenticated users can update their own community components"
  on public.community_components
  for update
  to authenticated
  using (auth.uid()::text = owner_id)
  with check (auth.uid()::text = owner_id);

create policy "Authenticated users can delete their own community components"
  on public.community_components
  for delete
  to authenticated
  using (auth.uid()::text = owner_id);

create policy "Authenticated users can view their own component reactions"
  on public.community_component_reactions
  for select
  to authenticated
  using (auth.uid()::text = user_id);

create policy "Authenticated users can insert their own component reactions"
  on public.community_component_reactions
  for insert
  to authenticated
  with check (auth.uid()::text = user_id);

create policy "Authenticated users can delete their own component reactions"
  on public.community_component_reactions
  for delete
  to authenticated
  using (auth.uid()::text = user_id);

create policy "Owners can view their own component versions"
  on public.community_component_versions
  for select
  to authenticated
  using (auth.uid()::text = owner_id);

create policy "Owners can insert their own component versions"
  on public.community_component_versions
  for insert
  to authenticated
  with check (auth.uid()::text = owner_id);

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
select
  component.id,
  component.owner_id,
  component.name,
  component.category,
  component.description,
  component.language,
  component.tsx,
  component.js,
  component.html,
  component.css,
  component.status,
  1
from public.community_components component
where not exists (
  select 1
  from public.community_component_versions version
  where version.component_id = component.id
);

update public.community_components component
set
  like_count = reaction_counts.like_count,
  bookmark_count = reaction_counts.bookmark_count
from (
  select
    component_id,
    count(*) filter (where reaction_type = 'like')::integer as like_count,
    count(*) filter (where reaction_type = 'bookmark')::integer as bookmark_count
  from public.community_component_reactions
  group by component_id
) as reaction_counts
where component.id = reaction_counts.component_id;
