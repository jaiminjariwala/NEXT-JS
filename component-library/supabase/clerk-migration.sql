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
  alter column owner_id type text using owner_id::text;

do $$
begin
  if to_regclass('public.community_component_reactions') is not null then
    execute 'drop policy if exists "Authenticated users can view their own component reactions" on public.community_component_reactions';
    execute 'drop policy if exists "Authenticated users can insert their own component reactions" on public.community_component_reactions';
    execute 'drop policy if exists "Authenticated users can delete their own component reactions" on public.community_component_reactions';
    execute 'alter table public.community_component_reactions drop constraint if exists community_component_reactions_user_id_fkey';
    execute 'alter table public.community_component_reactions alter column user_id type text using user_id::text';
  end if;

  if to_regclass('public.community_component_versions') is not null then
    execute 'drop policy if exists "Owners can view their own component versions" on public.community_component_versions';
    execute 'drop policy if exists "Owners can insert their own component versions" on public.community_component_versions';
    execute 'alter table public.community_component_versions drop constraint if exists community_component_versions_owner_id_fkey';
    execute 'alter table public.community_component_versions alter column owner_id type text using owner_id::text';
  end if;
end
$$;

create policy "Owners can view their own community components"
  on public.community_components
  for select
  to authenticated
  using ((select auth.jwt()->>'sub') = owner_id);

create policy "Authenticated users can insert their own community components"
  on public.community_components
  for insert
  to authenticated
  with check ((select auth.jwt()->>'sub') = owner_id);

create policy "Authenticated users can update their own community components"
  on public.community_components
  for update
  to authenticated
  using ((select auth.jwt()->>'sub') = owner_id)
  with check ((select auth.jwt()->>'sub') = owner_id);

create policy "Authenticated users can delete their own community components"
  on public.community_components
  for delete
  to authenticated
  using ((select auth.jwt()->>'sub') = owner_id);

do $$
begin
  if to_regclass('public.community_component_reactions') is not null then
    execute 'create policy "Authenticated users can view their own component reactions" on public.community_component_reactions for select to authenticated using ((select auth.jwt()->>''sub'') = user_id)';
    execute 'create policy "Authenticated users can insert their own component reactions" on public.community_component_reactions for insert to authenticated with check ((select auth.jwt()->>''sub'') = user_id)';
    execute 'create policy "Authenticated users can delete their own component reactions" on public.community_component_reactions for delete to authenticated using ((select auth.jwt()->>''sub'') = user_id)';
  end if;

  if to_regclass('public.community_component_versions') is not null then
    execute 'create policy "Owners can view their own component versions" on public.community_component_versions for select to authenticated using ((select auth.jwt()->>''sub'') = owner_id)';
    execute 'create policy "Owners can insert their own component versions" on public.community_component_versions for insert to authenticated with check ((select auth.jwt()->>''sub'') = owner_id)';
  end if;
end
$$;
