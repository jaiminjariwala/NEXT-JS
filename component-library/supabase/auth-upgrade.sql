drop policy if exists "Owners can view their own community components"
  on public.community_components;

create policy "Owners can view their own community components"
  on public.community_components
  for select
  to authenticated
  using ((select auth.jwt()->>'sub') = owner_id);
