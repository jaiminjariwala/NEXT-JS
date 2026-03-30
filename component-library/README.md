# Component Library

A curated component showcase that evolved from a static gallery into a three-pane community workspace.

The project started as a clean, read-only component library for previewing custom UI work. It now supports community-authored components, personal drafts, bookmarks, forks, inline code editing, version history, and Supabase-backed persistence while preserving the original curated component collection.

## What This Project Is

This app has two layers:

1. Official component library
   - curated components you built and present in a polished gallery
   - examples: Folding Letters, Employee ID Card Lanyard, Contact Me (Mail) Card, Figma Canvas, clocks, calendars, cards, drawer, folder

2. Community workspace
   - authenticated users can create their own components
   - users can save drafts, publish components, fork existing work, bookmark components, edit code inline, and manage version history

## Product Evolution

### Phase 1: Static component showcase

The first version of the site focused on:

- exploring custom-built components
- seeing a live preview
- browsing source code
- presenting the collection in a minimal, design-led interface

### Phase 2: Workspace redesign

The UI was reworked into a permanent three-column layout:

- left sidebar for navigation
- middle panel for live preview
- right panel for code

This replaced the older canvas + modal browsing model.

### Phase 3: Community features

The app now supports:

- Supabase-backed community components
- OAuth sign-in
- personal drafts and published components
- bookmarks
- forks
- code editing from the right panel
- version history with restore
- admin delete capability for community moderation

## Current UI Model

The app is organized into three vertical sections:

1. Sidebar
   - official components
   - your components
   - saved components
   - published community components

2. Preview panel
   - shows the currently selected component
   - official and community components both render here
   - community components use a sandboxed preview

3. Code panel
   - shows the selected component code
   - supports tabs such as `tsx`, `js`, `html`, and `css` when available
   - supports inline editing and saving for owned community components

## Core Features

### Official component library

- clean, minimal browsing interface
- code always visible beside the preview
- curated component ordering
- official components can be forked into personal drafts

### Community component system

- sign in with Supabase OAuth
- create a new component
- save as `draft` or `published`
- edit metadata and code
- delete owned components
- bookmark community components
- fork community and official components
- view saved components in a dedicated sidebar section

### Version history

- each save creates a version snapshot
- older versions can be restored by clicking the version block
- non-current versions can be deleted
- current version tracking is handled in the database

### Preview system

- official components render directly in the app
- community components render in a sandboxed iframe-style preview layer
- preview-only mode is shown when a signed-in user does not own a selected community component

### Admin tooling

- a designated admin email can delete any community component from the UI
- useful for moderation or cleanup when components were created from other accounts

## Tech Stack

### Frontend

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS 4
- Monaco Editor
- Lucide React
- Framer Motion
- GSAP

### Preview / code tooling

- `@babel/standalone`
- `react-live`
- custom community sandbox preview

### Backend / data

- Supabase
- Supabase Auth
- Postgres Row Level Security

### Component-specific libraries

- `pdfjs-dist` for PDF preview handling
- `mammoth` for Word document preview handling
- `three`, `@react-three/fiber`, `@react-three/rapier`, `meshline` for 3D / canvas-heavy components

## Current Auth Model

The project currently uses Supabase Auth for the community workspace.

Implemented:

- GitHub OAuth

Planned / optional:

- Google OAuth

The current app UI uses custom auth controls inside the sidebar instead of a third-party auth widget.

## Community Data Model

Main table:

- `community_components`

Supporting tables:

- `community_component_reactions`
- `community_component_versions`
- `community_admins`

Main ideas:

- every community component has an owner
- components can be `draft`, `published`, or `archived`
- bookmarks are stored per user
- versions are snapshotted on save
- one version is marked as current

## Main User Flows

### Browse official components

1. Open the app
2. Select a component from `Official`
3. View the preview in the middle panel
4. Inspect the code in the right panel
5. Fork it if you want your own editable copy

### Create a community component

1. Sign in
2. Click `Add component`
3. Fill in name, slug, category, description, status, and code
4. Save as draft or publish
5. The new item appears under `My Components`

### Edit your own component

1. Select a component under `My Components`
2. Click `Edit` in the code panel or use the metadata editor
3. Update code or metadata
4. Save
5. A new version is created in version history

### Restore an older version

1. Open a component you own
2. Click `History`
3. Click a previous version block
4. That version becomes current

### Bookmark a component

1. Sign in
2. Open a community component
3. Click the bookmark action
4. It appears in the `Saved` section

### Fork a component

1. Sign in
2. Open an official or community component
3. Click `Fork`
4. A personal copy is created under your components

## Project Structure

```text
src/
  app/
  components/
    LibraryWorkspace/
    library/
  data/
    code/
    versions/
    componentsData.ts
  lib/
    supabase/
    community-components.ts
  types/
supabase/
  schema.sql
  auth-upgrade.sql
  community-features.sql
  version-history-upgrade.sql
  community-admins.sql
docs/
  supabase-setup.md
```

## Key Files

- `src/components/LibraryWorkspace/LibraryWorkspace.tsx`
  - main application workspace
  - sidebar, preview panel, code panel, community actions, auth-aware logic

- `src/components/LibraryWorkspace/CommunitySandboxPreview.tsx`
  - sandbox preview for community-authored code

- `src/data/componentsData.ts`
  - official component registry

- `src/lib/community-components.ts`
  - Supabase fetch/mapping layer for community items

- `src/types/index.ts`
  - shared types for official and community items

## Environment Variables

Create `.env.local` with:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_publishable_key
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` also works if your project still uses the older naming.

## Supabase Setup

Full setup notes live in:

- `docs/supabase-setup.md`

Important SQL files:

- `supabase/schema.sql`
  - baseline setup for a brand-new Supabase project

- `supabase/auth-upgrade.sql`
  - refreshes owner-based Supabase auth policies

- `supabase/community-features.sql`
  - adds reactions, forks, bookmarks, versions, triggers, and related policies

- `supabase/version-history-upgrade.sql`
  - fixes version history current-state and restore behavior

- `supabase/community-admins.sql`
  - grants admin delete ability to a specific email

### Important note about SQL Editor tabs

Supabase SQL Editor tabs are not the source of truth.

The source of truth is the SQL files in the repo.

That means:

- you can safely close/delete old SQL Editor tabs
- deleting tabs does not delete your database schema or data
- do not blindly rerun every SQL file on an existing project
- rerun only the migration or patch you actually need

## Local Development

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Build:

```bash
npm run build
```

Lint:

```bash
npm run lint
```

## Deployment Strategy

This project was designed to support two versions of the site:

- a static curated version
- a community-enabled version

Recommended branch setup:

- `main`
  - static or public-facing stable version

- `community`
  - community/auth features and ongoing product work

Recommended Vercel setup:

- one Vercel project pointing to `main`
- one Vercel project pointing to `community`

This lets you share two separate links without overwriting the existing static deployment.

## Notes on Current Product Decisions

- likes were removed from the UI
- bookmarks and forks remain
- official components are still the curated core of the library
- community components are additive, not a replacement
- save/edit actions are restricted to owned community components
- preview-only editing is allowed visually for non-owned components, but persistence is blocked

## Future Directions

Potential next improvements include:

- Google OAuth
- richer profile pages
- comment / feedback system
- public creator pages
- better moderation tools
- more searchable metadata
- thumbnail generation for community components

## Summary

This project is no longer just a static component gallery.

It is now a component workspace that combines:

- a polished official design library
- an editor-friendly preview/code environment
- a Supabase-backed community layer
- ownership, bookmarking, forking, and versioning workflows

The app keeps the original design-centric feel while growing into a collaborative component platform.
