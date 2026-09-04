# CreatorWorks Identity-Enabled Release

## Decision and boundary

CreatorWorks will become a small server-capable application while preserving the approved catalog, product previews, product drawer, and guided **Share your work** journey.

CreatorWorks may use the same provider accounts and billing organizations as Producer Studio, but it must use separate technical resources:

- GitHub repository: `ctumalan/creatorworks` (already separate)
- Vercel project: `creatorworks`
- WorkOS project/environment and AuthKit application: `CreatorWorks` / `CreatorWorks Web`
- Supabase project: `creatorworks`
- CreatorWorks-only secrets, callback URLs, database, cookies, authorization rules, and administrator role

Producer Studio users, allowlists, sessions, cookies, database credentials, and administrator permissions must not be reused.

## Smallest appropriate stack

- **Application:** Astro with TypeScript and server rendering
- **Hosting:** Vercel with the Astro Vercel adapter
- **Authentication:** WorkOS AuthKit through the WorkOS Node SDK
- **Database and avatar storage:** one separate Supabase project using Postgres and Storage
- **Authorization:** CreatorWorks server code; never browser-only checks
- **Current interface:** reuse the existing HTML, CSS, JavaScript, illustrations, preview images, and product data during migration

Astro is the smallest practical step from the current static site: public catalog pages can remain fast and mostly static, while sign-in, profiles, ownership, saving, and administration gain protected server routes. CreatorWorks will use WorkOS for identity and Supabase for application data; Supabase Auth should remain disabled to avoid two competing account systems.

## Two identity layers

### Public identity

Chosen and editable by the member:

- Display name
- Unique public profile address
- Avatar, with initials as the fallback
- One short identity label such as Musician, Engineer, Parent, Freelancer, or Creator
- Short biography
- Public projects

The identity label is ordinary profile text. It never grants access or authority.

Public profile route: `/people/{profile-slug}`

Never expose a person's email address, WorkOS identifier, system role, private activity, or private projects on this page.

### System authority

Protected by the server:

- `member` — ordinary account
- `admin` — CreatorWorks administration

New accounts always begin as `member`. The founder account is promoted using an exact WorkOS user ID stored only in protected server configuration or through a protected database operation. A name, email address, profile label, browser value, or URL parameter must never grant administrator access.

## Minimum data model

### `users`

- `id` — internal UUID, primary key
- `workos_user_id` — unique, required
- `system_role` — `member` or `admin`, default `member`
- `created_at`, `updated_at`

### `profiles`

- `user_id` — primary key and foreign key to `users`
- `slug` — unique public address
- `display_name` — required public name
- `identity_label` — optional self-written label, maximum 60 characters
- `bio` — optional, short and plain text
- `avatar_path` — optional processed image path
- `is_public` — member-controlled visibility
- `created_at`, `updated_at`

### `projects`

- `id` — UUID, primary key
- `owner_user_id` — required foreign key to `users`
- `slug` — unique public address
- Existing catalog fields: name, category, summary, purpose, audience, stage, price label, external URL, preview image, and three benefits
- `visibility` — draft, private-link, or public
- `ownership_status` — unverified, review-pending, or verified
- `created_at`, `updated_at`, `published_at`

A project has one accountable owner in the first release. Team membership can be added later only when a real collaboration need appears.

### `saved_projects`

- `user_id`
- `project_id`
- `created_at`
- Composite primary key: `user_id`, `project_id`

### Future `verified_feedback`

Reserve the relationship but do not build the social system yet:

- `id`
- `project_id`
- `author_user_id`
- `prompt`
- `response`
- `visibility`
- `moderation_status`
- `created_at`

Public star ratings, anonymous drive-by reviews, direct messages, follower counts, and public authority scores are not part of this identity milestone.

## Access rules

- Anyone may browse the catalog, open public profiles, view public projects, and follow a product link without an account.
- Sign-in is required to publish or manage a project, maintain a profile, save across devices, or leave verified feedback.
- A member may edit only their own profile, saved items, and owned projects.
- Publishing requires authenticated identity and a separate check that the member controls or represents the linked product.
- During the founding beta, project-ownership verification is a transparent founder review. It must not be presented as an automated safety or quality certification.
- Administrator pages and operations must verify `system_role` on every server request.

## Avatar standard

- Avatar is optional; initials are always available.
- Accept only common image formats with a modest file-size limit.
- Validate and re-encode the image on the server; discard the original upload.
- Remove embedded metadata.
- Use unpredictable stored filenames scoped to the member.
- Provide obvious replace and remove actions.
- Explain that a chosen profile avatar is public when the profile is public.

## Proposed routes

Public:

- `/` — catalog
- `/projects/{project-slug}` — shareable project page or catalog detail destination
- `/people/{profile-slug}` — public profile
- `/auth/sign-in`
- `/auth/callback`
- `/auth/sign-out`

Signed-in member:

- `/me`
- `/me/profile`
- `/me/projects`
- `/me/saved`

Founder administration:

- `/admin`
- `/admin/projects`
- `/admin/ownership-reviews`

## Provider setup names and URLs

These are proposed names. The production Vercel address must be confirmed as available before it is entered into WorkOS.

### Vercel

- Project name: `creatorworks`
- Git repository: `ctumalan/creatorworks`
- Expected production address: `https://creatorworks.vercel.app`
- Production branch: `main`

### WorkOS/AuthKit

- Project/environment: a CreatorWorks-specific Staging and Production environment; do not use Producer Studio's environment or user base
- Application name: `CreatorWorks Web`
- Staging callback: `http://localhost:4321/auth/callback`
- Staging sign-out return: `http://localhost:4321/`
- Proposed production callback: `https://creatorworks.vercel.app/auth/callback`
- Proposed production sign-out return: `https://creatorworks.vercel.app/`

Do not finalize the production URLs until Vercel confirms the assigned domain. Add a future custom-domain callback only after that domain is owned and connected.

### Supabase

- Project name: `creatorworks`
- Avatar bucket: `profile-avatars`
- Region: choose the closest practical region to the first users; this cannot be changed casually later

## Environment variable names

Never commit their values.

Safe configuration:

- `PUBLIC_APP_URL`
- `WORKOS_CLIENT_ID`
- `WORKOS_REDIRECT_URI`
- `SESSION_COOKIE_NAME` (recommended value: `cw_session`)
- `SUPABASE_URL`
- `SUPABASE_AVATAR_BUCKET` (recommended value: `profile-avatars`)

Secrets:

- `WORKOS_API_KEY`
- `WORKOS_COOKIE_PASSWORD`
- `SUPABASE_SERVICE_ROLE_KEY`
- `FOUNDER_WORKOS_USER_ID`

Add `WORKOS_WEBHOOK_SECRET` only if a later milestone actually uses WorkOS webhooks.

## Migration path

1. Preserve the current static prototype as the visual reference.
2. Add Astro and render the existing catalog at `/` without changing its appearance or behavior.
3. Move the ten product records into a database seed while retaining all existing preview images and URLs.
4. Add AuthKit sign-in, callback, sign-out, encrypted session cookie, and protected server middleware.
5. Create the `users` record on first successful sign-in.
6. Add profile editing, initials fallback, avatar upload, and `/people/{slug}`.
7. Attach the ten initial projects to one official in-house CreatorWorks profile.
8. Assign and verify the founder `admin` role server-side.
9. Add cross-device saved projects.
10. Test authorization failures before enabling publishing or a public production deployment.

Each step should preserve anonymous browsing and should be independently testable and reversible.

## What can be completed without the founder

- Scaffold Astro locally.
- Preserve and migrate the existing interface.
- Write the database schema and seed data.
- Implement environment-variable validation without values.
- Build authentication routes against placeholder configuration.
- Build profiles, ownership rules, avatar validation, and administrator guards.
- Add automated tests and a local setup guide.

## What requires the founder

- Confirm the architecture and that the project is entering the identity-enabled release.
- Create or approve the separate Vercel project.
- Confirm the actual Vercel production domain.
- Create or approve the separate WorkOS application and copy its values into Vercel without sharing them in chat or Git.
- Create or approve the separate Supabase project, select its region, and copy its values into Vercel without sharing them in chat or Git.
- Sign in once so the immutable WorkOS user ID for the founder account exists.
- Approve the initial in-house public profile name, label, biography, and avatar.
- Approve any paid-plan upgrade before it occurs.

## Cost and plan cautions

- WorkOS currently advertises AuthKit/User Management as free for up to one million monthly active users. Production and optional branding/custom-domain features should still be checked before launch.
- Supabase currently offers a free plan with two active projects, 500 MB database storage, 1 GB file storage, and pausing after one week of inactivity. Pro begins at $25 per month; additional project compute and overages can add cost.
- Vercel Hobby is free but restricted to non-commercial personal use. Because CreatorWorks is intended to become a business, confirm whether the existing Pro team should own this project before production launch.
- No paid plan, custom domain, image transformation, backup add-on, or usage-based overage should be enabled without explicit approval.

Pricing changes over time. Re-check the official provider pages immediately before choosing a paid plan.

## Sources checked for this decision

- WorkOS AuthKit: <https://workos.com/docs/authkit/overview>
- WorkOS applications and credential isolation: <https://workos.com/docs/authkit/applications>
- WorkOS redirect behavior: <https://workos.com/docs/reference/authkit/authentication/get-authorization-url>
- WorkOS pricing: <https://workos.com/pricing>
- Vercel Hobby plan: <https://vercel.com/docs/plans/hobby>
- Vercel limits: <https://vercel.com/docs/limits>
- Supabase pricing: <https://supabase.com/pricing>
- Supabase billing: <https://supabase.com/docs/guides/platform/billing-on-supabase>

## Stop point

No Vercel, WorkOS, Supabase, domain, or paid resource should be created or connected until the founder reviews and approves this document.
