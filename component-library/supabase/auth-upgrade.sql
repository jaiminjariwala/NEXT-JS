drop policy if exists "Owners can view their own community components"
  on public.community_components;
drop policy if exists "Authenticated users can insert their own community components"
  on public.community_components;
drop policy if exists "Authenticated users can update their own community components"
  on public.community_components;
drop policy if exists "Authenticated users can delete their own community components"
  on public.community_components;

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

do $$
begin
  if to_regclass('public.community_component_reactions') is not null then
    execute 'drop policy if exists "Authenticated users can view their own component reactions" on public.community_component_reactions';
    execute 'drop policy if exists "Authenticated users can insert their own component reactions" on public.community_component_reactions';
    execute 'drop policy if exists "Authenticated users can delete their own component reactions" on public.community_component_reactions';

    execute 'create policy "Authenticated users can view their own component reactions" on public.community_component_reactions for select to authenticated using (auth.uid()::text = user_id)';
    execute 'create policy "Authenticated users can insert their own component reactions" on public.community_component_reactions for insert to authenticated with check (auth.uid()::text = user_id)';
    execute 'create policy "Authenticated users can delete their own component reactions" on public.community_component_reactions for delete to authenticated using (auth.uid()::text = user_id)';
  end if;

  if to_regclass('public.community_component_versions') is not null then
    execute 'drop policy if exists "Owners can view their own component versions" on public.community_component_versions';
    execute 'drop policy if exists "Owners can insert their own component versions" on public.community_component_versions';
    execute 'drop policy if exists "Owners can delete their own component versions" on public.community_component_versions';

    execute 'create policy "Owners can view their own component versions" on public.community_component_versions for select to authenticated using (auth.uid()::text = owner_id)';
    execute 'create policy "Owners can insert their own component versions" on public.community_component_versions for insert to authenticated with check (auth.uid()::text = owner_id)';
    execute 'create policy "Owners can delete their own component versions" on public.community_component_versions for delete to authenticated using (auth.uid()::text = owner_id)';
  end if;
end
$$;
