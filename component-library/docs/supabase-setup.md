# Supabase Setup

## 1. Create the project

1. Go to [https://supabase.com](https://supabase.com).
2. Create a new project.
3. Wait for the database to finish provisioning.

## 2. Add environment variables

1. Open your Supabase project dashboard.
2. Click the green `Connect` button near the top bar.
3. Copy:
   - `Project URL`
   - `publishable` key
4. If you prefer, you can still find the key under `Project Settings` -> `API Keys`.
5. In newer Supabase UI, the app uses `publishable key` terminology instead of `anon key`.
4. Create `.env.local` in the project root.
5. Paste:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

## 3. Create the database table

1. In Supabase, open `SQL Editor`.
2. Open `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/schema.sql`.
3. Run that SQL in the editor.

## 4. Add your first shared component

For now, use `Table Editor` -> `community_components` and add a row manually.

Recommended starter row:

- `slug`: `hello-card`
- `name`: `Hello Card`
- `category`: `Card`
- `author_name`: your name
- `language`: `typescript`
- `tsx`: a self-contained React component
- `css`: optional CSS
- `status`: `published`

## 5. What happens in the app

- published rows are loaded into the left sidebar
- community components render in an isolated iframe preview
- official local components keep using the existing preview system

## 6. Auth later

## 6. Enable email auth

1. Open `Authentication` -> `Providers`.
2. Enable `Email`.
3. For local testing, you can keep confirmation behavior simple first and adjust later.

## 7. Upgrade existing projects for owner draft access

If you already ran the first SQL file before the auth UI was added:

1. Open `SQL Editor`.
2. Open `/Users/jaiminmukeshjariwala/Documents/PERSONAL-PROJECTS/WEB-DEV/NEXT-JS/component-library/supabase/auth-upgrade.sql`.
3. Run it.

That adds the select policy required for signed-in users to read their own drafts.
