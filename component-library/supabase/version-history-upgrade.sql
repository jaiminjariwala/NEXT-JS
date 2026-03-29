alter table public.community_component_versions
  add column if not exists is_current boolean not null default false;

create or replace function public.snapshot_community_component_version()
returns trigger
language plpgsql
as $$
declare
  next_version_number integer;
begin
  if current_setting('app.skip_component_version_snapshot', true) = '1' then
    return new;
  end if;

  update public.community_component_versions
  set is_current = false
  where component_id = new.id
    and is_current = true;

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
    version_number,
    is_current
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
    next_version_number,
    true
  );

  return new;
end;
$$;

create or replace function public.restore_community_component_version(target_version_id uuid)
returns public.community_components
language plpgsql
as $$
declare
  target_version public.community_component_versions%rowtype;
  restored_component public.community_components%rowtype;
begin
  select *
  into target_version
  from public.community_component_versions
  where id = target_version_id
    and owner_id = auth.uid()::text;

  if not found then
    raise exception 'Unable to restore this version.';
  end if;

  perform set_config('app.skip_component_version_snapshot', '1', true);

  update public.community_components
  set
    name = target_version.name,
    category = target_version.category,
    description = target_version.description,
    language = coalesce(target_version.language, 'typescript'),
    tsx = target_version.tsx,
    js = target_version.js,
    html = target_version.html,
    css = coalesce(target_version.css, ''),
    status = target_version.status
  where id = target_version.component_id
    and owner_id = auth.uid()::text
  returning *
  into restored_component;

  if restored_component.id is null then
    raise exception 'Unable to restore this version.';
  end if;

  update public.community_component_versions
  set is_current = (id = target_version.id)
  where component_id = target_version.component_id;

  return restored_component;
end;
$$;

with ranked_versions as (
  select
    version.id,
    row_number() over (
      partition by version.component_id
      order by version.version_number desc, version.created_at desc
    ) as version_rank
  from public.community_component_versions version
)
update public.community_component_versions version
set is_current = (ranked_versions.version_rank = 1)
from ranked_versions
where version.id = ranked_versions.id;

drop policy if exists "Owners can delete their own component versions"
  on public.community_component_versions;

create policy "Owners can delete their own component versions"
  on public.community_component_versions
  for delete
  to authenticated
  using (auth.uid()::text = owner_id);
