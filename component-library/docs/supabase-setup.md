# Clerk + Supabase Setup

## 1. Create the services

1. Create a Supabase project.
2. Create a Clerk application for this project.

## 2. Add local environment variables

Create `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/.env.local` with:

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` also works if your Supabase project still uses that older naming.

## 3. Run the database schema

For a brand-new Supabase project:

1. Open `SQL Editor`.
2. Open `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/schema.sql`.
3. Run the full file.

For an existing Supabase project that already has the community tables:

1. Open `SQL Editor`.
2. Open `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/clerk-migration.sql`.
3. Run the full file.

If you also want likes, bookmarks, forks, and version history on an older project, run:

1. `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/community-features.sql`

## 4. Connect Clerk to Supabase

In Supabase:

1. Open `Authentication`.
2. Open `Third-Party Auth`.
3. Add a `Clerk` integration.
4. Follow the Supabase prompts to connect your Clerk application.

In Clerk:

1. Open your application dashboard.
2. Follow the Supabase integration flow so Clerk session tokens can be used against Supabase.

This app expects the Clerk user id to be available in the JWT `sub` claim. The RLS policies use:

```sql
auth.jwt()->>'sub'
```

for ownership and reaction checks.

## 5. What happens in the app

- signed-in users authenticate with Clerk
- Supabase still stores community components, reactions, and versions
- published community components are visible to everyone
- drafts and edit/delete actions are only available to the component owner

## 6. Vercel

Add these environment variables to the Vercel project that deploys the community branch:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
