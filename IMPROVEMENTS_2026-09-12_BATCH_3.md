# September 12 — invitation, profile, and community improvements

## Status

Implemented and validated. The owner approved adding the final two-column credit illustration and committing, deploying, and publishing this batch. Publication is in progress; production database migration 022 has **not yet** been applied. Existing public hosting, framework, and no-index settings are unchanged.

## Approved batch

1. Invitation-led project presentation: ivory/forest colors, tilted screenshot, action under preview, inline comments in place of the oversized experience callout.
2. Smaller creator profile header and project cards, public-only activity summary and expandable per-project counts, private general messages in the existing Messages inbox.
3. Category conversations removed from the Get feedback/listing creation tab.
4. Share added to My projects. Published projects share their public invitation; private listings share only the external app link, available to the owner, with a privacy explanation.
5. Textareas grow/shrink automatically with a capped height; no resize grip.
6. Intrusive save-help question mark removed; contextual comment guidelines remain available.
7. External-website tooltip removed; external-link arrow retained.
8. One Send invitation control with Email, Text, Copy invitation, More options. Sharing hands off to the chosen app and never sends automatically.
9. Directional sliding treatment for Find an app / Get feedback selection.
10. Directional project/profile panel entry, closing motion, and backdrop fade. Reduced-motion preferences disable movement.
11. Real guest comments, pending moderation, followed by optional signup for an **in-site publication notification**. No promise of email delivery, creator acceptance, or replies that the existing public-comment model does not support.
12. Active discussion pill for at least three approved public comments/reviews within 30 days. Not an invented rank.
13. Once-per-browser brand introduction, with reduced-motion support.
14. Public profile sharing using the canonical profile URL; private profiles cannot be shared.
15. Restrained Filter & sort menu animation.
16. Request feedback moved to eligible My projects menus, with explicit credit-cost confirmation and existing cancellation/refund behavior preserved.
17. One community progress card with expandable explanations. Available request credit, unique creators helped, and lifetime verification credits remain distinct tracks because their accounting rules differ.

Public profile statistics include only published projects, approved public contributions, and current saves. Visits and shares are explicitly marked as untracked, not represented as zero or fabricated activity.

## Data and privacy

`database/022_profile_messages_guest_comments.sql` is required before deploying this source.

- Guest identifiers are server-signed, HttpOnly, same-site, seven-day browser cookies; only a hash is stored with comments. Guests display as Guest even after opting into notifications.
- Same-origin checks, bounded text, network/member throttling, idempotent requests, publication checks, and moderation apply to submission. Failed or conflicting submissions preserve text.
- Notification subscription requires an explicit opt-in and a verified account in the same browser. Expired or previously claimed guest comments cannot be claimed by another account.
- General messages require verified accounts and are accessible only to participants. Both parties' block state is enforced. Reports permit existing administrators to inspect the reported conversation; there is no public message wall.
- Inbox filtering/sorting/pagination is applied globally across project and direct conversations. Read markers are monotonic.
- New tables have RLS and deny browser roles; trusted server routines derive participants from the authenticated account.
- Account export includes the member's conversations and claimed guest comments, excluding guest hashes. Existing account-erasure flows also redact new message content and claimed guest comments.
- Public privacy copy documents the new behavior. No marketing email or automatic external sharing is introduced.

## Validation

- 185 application tests pass, including illustration placement and its readable text alternative.
- TypeScript check and production build pass.
- Disposable database checks pass with migrations 001–022: guest retry/conflict handling, expiry, ownership claims before and after publication, one-time notifications, private-only messaging, blocking, read monotonicity, browser-role denial, account erasure, and public-only aggregate counts.
- Mixed project/direct inbox pagination verified across 30 conversations.
- Existing workspace database suite passes, including 29-thread pagination and draft ownership/history protections.
- Existing wish/category database suite passes, including 200+ wishes and category normalization.
- Local fixture preview responds successfully at `http://127.0.0.1:4326/dashboard/community`. Sample content only; sending is deliberately disabled. Preview pages also exist at `/people/sample-creator` and `/projects/sample-0`.
- No browser visual or click-through testing was performed for this batch. Database tests use a disposable local PostgreSQL-compatible runtime, not production.

## Publication sequence

Obtain approval for public release, review the exact diff, take/verify a current production backup, and apply migration 022. Verify its schema/functions and access controls, then commit only the batch's files, push the approved revision, and deploy that matching source through the existing Vercel project. Confirm the live deployment and account/guest routes before calling the release complete.

Do not replay the previous September 12 backup script. Do not include unrelated existing untracked notes or output files. A failed application deployment should roll back the app to the known-good revision; leave additive database objects in place pending a reviewed recovery plan rather than deleting user messages.

## Approved illustration and release preflight

- The approved two-column image is stored at `assets/community-credits-explainer.png`, directly below the Community credits page heading and before the live progress card. Responsive sizing preserves the complete illustration. An expandable HTML text equivalent provides the same benefits without relying on text in an image.
- The image is the owner's selected Give feedback / Receive Feedback version, with three benefit bullets under each character. It is copied unchanged from the generated original.
- Production preflight in the Supabase SQL Editor confirmed that 022's five principal functions and three guest columns are absent, there are two existing public-comment records and zero notifications, and no `release_backup_20260912_022` snapshot exists.
- The separate one-time `database/release-backup-20260912-022.sql` snapshot procedure and subsequent migration sequence pass locally. No production snapshot or 022 migration has been executed at this checkpoint.
- Vercel account access is working. Supabase browser navigation stalled while checking managed backup availability; the live app remains unchanged until the database checkpoint is complete.
