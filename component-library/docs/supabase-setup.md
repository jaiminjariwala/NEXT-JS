# Supabase Community Setup

## 1. Create the service

1. Create a Supabase project.

## 2. Add local environment variables

Create `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` also works if your project still uses that older naming.

## 3. Run the database SQL

For a brand-new Supabase project:

1. Open `SQL Editor`.
2. Open `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/schema.sql`.
3. Run the full file.

For an existing Supabase project that already has the community tables:

1. Open `SQL Editor`.
2. Open `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/auth-upgrade.sql`.
3. Run the full file.

If you also want likes, bookmarks, forks, and version history on an older project, run:

1. `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/community-features.sql`

If your project already has version history and you want restore actions to mark an older version as current without creating a new version row, run:

1. `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/version-history-upgrade.sql`

If you want your main account to be able to delete any community component from the UI, run:

1. `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/community-admins.sql`

Before you run it, replace:

- `replace-with-your-main-email@example.com`

with the email address of the account that should have admin delete access.

If you already ran an older Clerk-oriented migration on this same project, rerun:

1. `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/auth-upgrade.sql`

That resets ownership policies back to Supabase `auth.uid()`.

## 4. Enable Supabase auth providers

In Supabase:

1. Open `Authentication`.
2. Open `Sign In / Providers`.
3. Enable `GitHub`.
4. Add the callback URL Supabase gives you in the GitHub developer console.
5. Enable `Google` later when you are ready.

Then open `Authentication -> URL Configuration` and add:

- `http://localhost:3000`
- your deployed community URL, for example `https://component-library-community.vercel.app`

## 5. What happens in the app

- signed-in users authenticate with Supabase OAuth
- Supabase stores community components, reactions, and versions
- published community components are visible to everyone
- drafts and edit/delete actions are only available to the component owner

## 6. Vercel

Add these environment variables to the Vercel project that deploys the community branch:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY`
